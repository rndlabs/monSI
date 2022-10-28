import {
	Log,
	BlockWithTransactions,
	TransactionResponse,
} from '@ethersproject/abstract-provider'
import { BigNumber, providers } from 'ethers'
import invariant from 'tiny-invariant'
import semaphore from 'semaphore'

import config from '../config'
import { Logging } from '../utils'
import { Gas } from './gas'

import {
	BzzToken,
	BzzToken__factory,
	Redistribution,
	Redistribution__factory,
	StakeRegistry,
	StakeRegistry__factory,
} from '../types/contracts'
import {
	Reveal,
	SchellingGame,
	Round,
	StakeFreeze,
	StakeSlash,
	Ui,
	BOXES,
} from '../types/entities'

import { shortBZZ, fmtAccount, specificLocalTime } from '../lib'
import { formatBlockDeltaColor } from '../lib/formatChain'

const game = SchellingGame.getInstance()

enum State {
	COLD,
	INIT,
	WARMUP,
	RUNNING,
}

export type BlockDetails = {
	blockNo: number
	blockTimestamp: number
	baseFeePerGas?: BigNumber | null
}

const MAX_CONCURRENT = 500

/**
 * A service to monitor blockchain events, subsequently updating the game state.
 */

export class ChainSync {
	private static instance: ChainSync

	// ram these variables to avoid undefined error checking (initialized in init)
	private provider!: providers.WebSocketProvider
	private stakeRegistry!: StakeRegistry
	private redistribution!: Redistribution
	private bzzToken!: BzzToken

	private _state: State = State.COLD
	private lastBlock: BlockDetails = { blockNo: 7753000, blockTimestamp: 0 }
	private tip: number = 0
	private tipTimestamp: number = 0

	private baseGasMonitor: Gas
	private gasPriceMonitor: Gas

	private _network?: providers.Network

	private numFailedTransactions = 0

	private constructor() {
		this.baseGasMonitor = new Gas(32)
		this.gasPriceMonitor = new Gas(32)
	}

	// --- singleton method

	public static getInstance(): ChainSync {
		if (!ChainSync.instance) {
			ChainSync.instance = new ChainSync()
		}
		return ChainSync.instance
	}

	public async getCurrentBlock(): Promise<number> {
		return await this.provider.getBlockNumber()
	}

	public async init(rpc: string) {
		// check the state
		invariant(this._state === State.COLD, 'ChainSync must be cold')

		this.provider = new providers.WebSocketProvider(rpc)

		// cache the network information
		this._network = await this.provider.getNetwork()

		// connect to the contracts
		this.stakeRegistry = StakeRegistry__factory.connect(
			config.contracts.stakeRegistry,
			this.provider
		)
		this.redistribution = Redistribution__factory.connect(
			config.contracts.redistribution,
			this.provider
		)
		this.bzzToken = BzzToken__factory.connect(
			config.contracts.bzzToken,
			this.provider
		)

		// mark as initialized
		this._state = State.INIT
	}

	public async start(startFromBlock: number) {
		invariant(this._state === State.INIT, 'ChainSync must be initialized')

		Logging.showLogError(`Starting ChainSync...`)

		// change the state to warmup
		this._state = State.WARMUP

		// we are synced to the tip of the chain, activate the listeners
		this.setupEventListeners()

		// sync the blockchain - effectively backfilling the game state
		await this.syncBlockchain(startFromBlock)

		// change the state to running
		this._state = State.RUNNING
	}

	private async syncBlockchain(startFromBlock: number) {
		startFromBlock =
			Math.floor(startFromBlock / config.game.blocksPerRound) *
			config.game.blocksPerRound

		Logging.showLogError(`Loading StakeUpdated logs from block 7716036`) // TODO: This should come from chain-config
		const start = Date.now()
		// 1. Process all `StakeUpdated` events as this determines who is in the game.
		const stakeUpdatedFilter = this.stakeRegistry.filters.StakeUpdated()
		const stakeUpdatedLogs = await this.provider.getLogs({
			...stakeUpdatedFilter,
			fromBlock: 7716036, // TODO: set to genesis block for stake registry
		})

		// now process the logs and add players to the game
		await this.processStakeUpdatedLogs(stakeUpdatedLogs)
		const elapsed = Date.now() - start
		Logging.showLogError(
			`Loaded ${stakeUpdatedLogs.length} StakeUpdated logs in ${elapsed}ms`
		)

		// 2. Process all `commit`, `reveal`, and `claim` transactions to the Redistribution contract.

		// replay each block to get the data
		// const sem = semaphore(MAX_CONCURRENT)

		this.tip = await this.provider.getBlockNumber()
		this.lastBlock.blockNo = startFromBlock - 1 // increments below before getting block

		// data structures / reporting are designed so that we can process blocks in any order
		Logging.showLogError(
			`Syncing blockchain from block ${this.lastBlock.blockNo + 1} to ${
				this.tip
			}`
		)
		const start2 = Date.now()
		do {
			//Logging.showLogError(`Sync block ${this.lastBlock.blockNo+1}`)
			const block = await this.provider.getBlockWithTransactions(
				this.lastBlock.blockNo + 1
			)

			if (block.number % 100 == 0)
				Logging.showError(`Sync: Processing block ${block.number}`, 'sync')

			await this.blockHandler(block)

			this.lastBlock = {
				blockNo: block.number,
				blockTimestamp: block.timestamp * 1000,
				baseFeePerGas: block.baseFeePerGas,
			}
		} while (this.lastBlock.blockNo < this.tip)
		const elapsed2 = Date.now() - start2
		Logging.showLogError(
			`Sync: Complete from block ${startFromBlock} to ${this.lastBlock.blockNo} in ${elapsed2}ms`
		)

		// for (let i = this.lastBlock; i <= nowBlockNumber; i++) {
		//     // sem.take(async () => {
		//         const block = await this.provider.getBlockWithTransactions(i)
		//         Logging.showLogError(`Processing block ${block.number}`)
		//         block.transactions.forEach(async (tx) => {
		//             // process the raw transaction
		//             if (tx.to === config.contracts.redistribution) {
		//                 await this.processRedistributionTx(tx, block.timestamp)
		//             }
		//         })

		//         // this.provider.getBlockWithTransactions(i).then((block) => {
		//         //     Logging.showLogError(`Processing block ${block.number}`)
		//         //     block.transactions.forEach(async (tx) => {
		//         //         if (tx.to === config.contracts.redistribution) {
		//         //             await this.processRedistributionTx(tx)
		//         //         }
		//         //     })
		//         // }).catch((e) => {
		//         //     console.log(e)
		//         // }).finally(() => {
		//         //     sem.leave()
		//         // })
		//     // })
		// }
	}

	private setupEventListeners() {
		// setup the event listeners

		// stake registry - only needed for new players / updated stakes
		this.stakeRegistry.on(
			this.stakeRegistry.filters[
				'StakeUpdated(bytes32,uint256,address,uint256)'
			](),
			(stakeId, amount, owner, round) => {
				// if (this._state == State.RUNNING)
				Logging.showLogError(
					`StakeUpdated event: ${stakeId}, ${amount}, ${owner}, ${round}`
				)
			}
		)

		// monitor the bzz token
		this.bzzToken.on(this.bzzToken.filters.Transfer(), (from, to, amount) => {
			// if (this._state == State.RUNNING)
			Logging.showLogError(
				`${shortBZZ(amount)} gBZZ from ${fmtAccount(from)} to ${fmtAccount(to)}`
			)
		})

		this.bzzToken.on(
			this.bzzToken.filters.Approval(),
			(owner, spender, value) => {
				// if (this._state == State.RUNNING)
				Logging.showLogError(
					`${shortBZZ(value)} gBZZ Approved from ${fmtAccount(
						owner
					)} to ${fmtAccount(spender)}`
				)
			}
		)

		// setup listener for new blocks
		this.provider.on('block', async (blockNumber: number) => {
			const block = await this.provider.getBlockWithTransactions(blockNumber)

			this.gasPriceMonitor.newSample(await this.provider.getGasPrice())

			const priceText = `{left}${specificLocalTime(
				block.timestamp * 1000
			)} ${blockNumber} ${
				this.gasPriceMonitor.lastPrice
			} ${this.gasPriceMonitor.percentColor()}%{/left}`
			const offsetLine = game.size + 1 // Keep room for the getRpcUrl
			Ui.getInstance().lineSetterCallback(BOXES.ALL_PLAYERS)(
				offsetLine,
				`{center}${config.name} getGasPrice{/center}`,
				-1
			)
			Ui.getInstance().lineSetterCallback(BOXES.ALL_PLAYERS)(
				offsetLine + 1,
				`{center}${this.gasPriceMonitor.history}{/center}`,
				-1
			)
			Ui.getInstance().lineInserterCallback(BOXES.ALL_PLAYERS)(
				offsetLine + 2,
				priceText,
				-1
			)

			const dt = new Date(block.timestamp * 1000).toISOString()
			const gas = `${Gas.gasUtilization(block)}% ${Gas.gasPriceToString(
				block.baseFeePerGas || BigNumber.from(0)
			)}`
			let text = `${Round.roundFromBlock(block.number)} Block: ${
				block.number
			} Gas: ${gas} Time: ${dt}`

			Logging.showError(text, 'block')

			const start = Date.now()
			if (this._state == State.RUNNING) {
				if (block.number != this.lastBlock.blockNo + 1)
					Logging.showError(
						`Skipped from block ${this.lastBlock.blockNo} to ${block.number}`
					)
				await this.blockHandler(block)

				this.lastBlock = {
					blockNo: block.number,
					blockTimestamp: block.timestamp * 1000,
					baseFeePerGas: block.baseFeePerGas,
				}
			}
			const elapsed = Date.now() - start

			text += ` ${elapsed}ms`
			Logging.showError(text, 'block')

			this.tip = blockNumber
			this.tipTimestamp = block.timestamp * 1000
		})
	}

	public get state(): State {
		return this._state
	}

	private async blockHandler(block: BlockWithTransactions) {
		this.baseGasMonitor.newSample(block.baseFeePerGas ?? BigNumber.from(1))
		const deltaBlockTime =
			this.lastBlock.blockTimestamp == 0
				? ''
				: `${formatBlockDeltaColor(
						block.timestamp - this.lastBlock.blockTimestamp / 1000
				  )}s`

		Ui.getInstance().lineSetterCallback(BOXES.BLOCKS)(
			0,
			`{center}${this.baseGasMonitor.history}{/center}`,
			-1 // Don't timestamp this line
		)
		Ui.getInstance().lineInserterCallback(BOXES.BLOCKS)(
			1,
			`${block.number} ${deltaBlockTime} ${
				this.baseGasMonitor.lastPrice
			} ${this.baseGasMonitor.percentColor()}%`,
			block.timestamp * 1000
		)

		const blockDetails: BlockDetails = {
			blockNo: block.number,
			blockTimestamp: block.timestamp * 1000, // always set to milliseconds
		}
		const line = game.newBlock(blockDetails)
		Ui.getInstance().lineSetterCallback(BOXES.ROUND_PLAYERS)(
			0,
			line,
			block.timestamp * 1000
		)

		block.transactions.forEach(async (tx) => {
			if (tx.to === config.contracts.redistribution) {
				await this.processRedistributionTx(tx, block.timestamp)
			}
		})
	}

	private async processRedistributionTx(
		tx: TransactionResponse,
		blockTimestamp: number
	) {
		// get the receipt
		const receipt = await this.provider.getTransactionReceipt(tx.hash)

		// if tx failed, return
		if (!receipt.status) {
			this.numFailedTransactions++
			return
		}

		// decode the input data
		const desc = this.redistribution.interface.parseTransaction(tx)

		const blockDetails: BlockDetails = {
			blockNo: receipt.blockNumber,
			blockTimestamp: blockTimestamp * 1000, // always set to milliseconds
		}

		// determine what function is being called
		switch (desc.name) {
			case 'commit': // commit
				const [, overlayAddress] = desc.args
				game.commit(overlayAddress, receipt.from, blockDetails)
				break
			case 'reveal': // reveal
				const [overlay, depth, hash] = desc.args
				game.reveal(overlay, receipt.from, hash, depth, blockDetails)
				break
			case 'claim': // claim
				// check for a 'Winner' event
				const freezes: StakeFreeze[] = []
				const slashes: StakeSlash[] = []
				let winner: Reveal | undefined = undefined
				let amount = BigNumber.from(0)

				// Parse the logs for the winner / freezes / slashes
				receipt.logs.forEach((log) => {
					if (
						log.topics[0] ===
						this.redistribution.interface.getEventTopic('WinnerSelected')
					) {
						// below we destructure the Reveal struct
						;[winner] = this.redistribution.interface.parseLog(log).args
					} else if (
						log.topics[0] ===
						this.stakeRegistry.interface.getEventTopic('StakeSlashed')
					) {
						const [slashed, amount] =
							this.stakeRegistry.interface.parseLog(log).args
						slashes.push({
							overlay: slashed,
							amount,
						})
					} else if (
						log.topics[0] ===
						this.stakeRegistry.interface.getEventTopic('StakeFrozen')
					) {
						const [slashed, time] =
							this.stakeRegistry.interface.parseLog(log).args
						freezes.push({
							overlay: slashed,
							numBlocks: time,
						})
					} else if (
						log.topics[0] === this.bzzToken.interface.getEventTopic('Transfer')
					) {
						const [from, to, value] = this.bzzToken.interface.parseLog(log).args
						if (from == config.contracts.postageStamp && to == receipt.from) {
							amount = value
						}
					}
				})

				// make a claim on the game!
				game.claim(
					winner!,
					receipt.from,
					amount,
					blockDetails,
					freezes,
					slashes
				)
				break
		}
	}

	private async processStakeUpdatedLogs(logs: Log[]) {
		// process the logs
		for (let i = 0; i < logs.length; i++) {
			const log = logs[i]

			// get the transaction receipt
			const receipt = await this.provider.getTransactionReceipt(
				log.transactionHash
			)
			const block = await this.provider.getBlock(receipt.blockNumber)

			if (!receipt.status) {
				this.numFailedTransactions++
			} else {
				// parse the log
				const blockDetails = {
					blockNo: receipt.blockNumber,
					blockTimestamp: block.timestamp * 1000, // always set to milliseconds
				}

				const desc = this.stakeRegistry.interface.parseLog(log)
				const [overlay, stakeAmount, owner] = desc.args
				game.stakeUpdated(overlay, owner, stakeAmount, blockDetails)
			}
		}
	}

	public get rpcUrl(): string {
		return this.provider.connection.url
	}
}
