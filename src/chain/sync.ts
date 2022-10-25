import {
	Log,
	BlockWithTransactions,
	TransactionResponse,
} from '@ethersproject/abstract-provider'
import { BigNumber, providers } from 'ethers'
import semaphore from 'semaphore'

import config, { getRpcUrl } from '../config'
import { Logging } from '../utils'
import gasmonitor, { gasPriceToString, gasUtilization } from './gas'

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
	StakeFreeze,
	StakeSlash,
} from '../types/entities/schelling'
import { shortBZZ } from '../lib/formatUnits'
import { fmtAccount } from '../lib/formatText'
import { Round } from '../types/entities/round'
import Ui, { BOXES } from '../types/entities/ui'

const game = SchellingGame.getInstance()

enum State {
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

export default class ChainSync {
	private static instance: ChainSync

	private provider: providers.WebSocketProvider

	private stakeRegistry: StakeRegistry
	private redistribution: Redistribution
	private bzzToken: BzzToken

	private _state: State = State.INIT
	private lastBlock: BlockDetails = { blockNo: 7753000, blockTimestamp: 0 }
	private tip: number = 0
	private tipTimestamp: number = 0

	private numFailedTransactions = 0

	private constructor() {
		// configure the RPC
		this.provider = new providers.WebSocketProvider(getRpcUrl())

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
	}

	// --- singleton method

	public static getInstance(): ChainSync {
		if (!ChainSync.instance) {
			ChainSync.instance = new ChainSync()
		}
		return ChainSync.instance
	}

	public async start() {
		Logging.showLogError(`Starting ChainSync...`)

		// change the state to warmup
		this._state = State.WARMUP

		// we are synced to the tip of the chain, activate the listeners
		this.setupEventListeners()

		// sync the blockchain - effectively backfilling the game state
		await this.syncBlockchain()

		// change the state to running
		this._state = State.RUNNING
	}

	private async syncBlockchain() {
		Logging.showLogError(`Syncing blockchain...`)
		// 1. Process all `StakeUpdated` events as this determines who is in the game.
		const stakeUpdatedFilter = this.stakeRegistry.filters.StakeUpdated()
		const stakeUpdatedLogs = await this.provider.getLogs({
			...stakeUpdatedFilter,
			fromBlock: 7716036, // TODO: set to genesis block for stake registry
		})

		// now process the logs and add players to the game
		await this.processStakeUpdatedLogs(stakeUpdatedLogs)

		// 2. Process all `commit`, `reveal`, and `claim` transactions to the Redistribution contract.

		// replay each block to get the data
		// const sem = semaphore(MAX_CONCURRENT)

		this.tip = await this.provider.getBlockNumber()
		Logging.showLogError(`Processing blocks ${this.lastBlock} to ${this.tip}`)

		// data structures / reporting are designed so that we can process blocks in any order
		do {
			const block = await this.provider.getBlockWithTransactions(
				this.lastBlock.blockNo + 1
			)

			await this.blockHandler(block)

			this.lastBlock = {
				blockNo: block.number,
				blockTimestamp: block.timestamp * 1000,
				baseFeePerGas: block.baseFeePerGas,
			}
		} while (this.lastBlock.blockNo <= this.tip)

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
			gasmonitor(block.baseFeePerGas ?? BigNumber.from(1))

			const dt = new Date(block.timestamp * 1000).toISOString()
			const gas = `${gasUtilization(block)}% ${gasPriceToString(
				block.baseFeePerGas || BigNumber.from(0)
			)}`
			let text = `${Round.roundFromBlock(block.number)} Block: ${
				block.number
			} Gas: ${gas} Time: ${dt}`
			const deltaBlockTime =
				this.tipTimestamp == 0
					? ''
					: `${block.timestamp - this.tipTimestamp / 1000}s`

			Ui.getInstance().lineInserterCallback(BOXES.BLOCKS)(
				0,
				`${block.number} ${gas}${deltaBlockTime}`,
				block.timestamp * 1000
			)

			Logging.showError(text, 'block')

			const start = Date.now()
			if (this._state == State.RUNNING) {
				await this.blockHandler(block)

				this.lastBlock = {
					blockNo: block.number,
					blockTimestamp: block.timestamp * 1000,
					baseFeePerGas: block.baseFeePerGas,
				}
			}
			const elapsed = Date.now() - start

			text += ` ${elapsed}ms`

			Ui.getInstance().lineSetterCallback(BOXES.BLOCKS)(
				0,
				`${block.number} ${gas} ${deltaBlockTime} ${elapsed}ms`,
				block.timestamp * 1000
			)

			Logging.showError(text, 'block')

			this.tip = blockNumber
			this.tipTimestamp = block.timestamp * 1000
		})
	}

	public get state(): State {
		return this._state
	}

	private async blockHandler(block: BlockWithTransactions) {
		if (block.number % 100 == 0)
			Logging.showLogError(`Sync: Processing block ${block.number}`)
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
				game.commit(overlayAddress, blockDetails)
				break
			case 'reveal': // reveal
				const [overlay, depth, hash] = desc.args
				game.reveal(overlay, hash, depth, blockDetails)
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
				game.claim(winner!, amount, blockDetails, freezes, slashes)
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
