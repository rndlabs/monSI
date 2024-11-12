import {
	Log,
	BlockWithTransactions,
	TransactionResponse,
} from '@ethersproject/abstract-provider'
import { BigNumber, providers, utils } from 'ethers'
import invariant from 'tiny-invariant'

import config from '../config.js'
import { Logging } from '../utils/index.js'
import { Gas } from './gas.js'

import {
	BzzToken,
	BzzToken__factory,
	Redistribution,
	Redistribution__factory,
	StakeRegistry,
	StakeRegistry__factory,
} from '../types/contracts/index.js'
import {
	Reveal,
	SchellingGame,
	Round,
	StakeFreeze,
	StakeSlash,
	Ui,
	BOXES,
} from '../types/entities/index.js'

import {
	shortBZZ,
	fmtAccount,
	fmtOverlay,
	specificLocalTime,
} from '../lib/index.js'
import { formatBlockDeltaColor } from '../lib/formatChain.js'

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

// const MAX_CONCURRENT = 500

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
	private tip = 0
	private tipTimestamp = 0

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

	public async start(
		showGas: boolean,
		preloadStakes: boolean,
		startFromBlock: number,
		endingBlock?: number
	) {
		invariant(this._state === State.INIT, 'ChainSync must be initialized')

		Logging.showLogError(`Starting ChainSync...`)

		// change the state to warmup
		this._state = State.WARMUP

		// we are synced to the tip of the chain, activate the listeners
		if (!endingBlock) this.setupEventListeners(showGas)

		// sync the blockchain - effectively backfilling the game state
		await this.syncBlockchain(
			showGas,
			preloadStakes,
			startFromBlock,
			endingBlock
		)

		const stakeContract = await this.redistribution.Stakes()
		if (stakeContract != config.contracts.stakeRegistry)
			Logging.showLogError(
				`stakes: ${stakeContract} vs config ${config.contracts.stakeRegistry}`
			)
		const stampContract = await this.redistribution.PostageContract()
		if (stampContract != config.contracts.postageStamp)
			Logging.showLogError(
				`stamps: ${stampContract} vs config ${config.contracts.postageStamp}`
			)
		const oracleContract = await this.redistribution.OracleContract()
		if (oracleContract != config.contracts.priceOracle)
			Logging.showLogError(
				`oracle: ${oracleContract} vs config ${config.contracts.priceOracle}`
			)

		// change the state to running
		this._state = State.RUNNING
	}

	private async syncBlockchain(
		showGas: boolean,
		preloadStakes: boolean,
		startFromBlock: number,
		endingBlock?: number
	) {
		startFromBlock =
			Math.floor(startFromBlock / config.game.blocksPerRound) *
			config.game.blocksPerRound

		// 1. Process all `StakeUpdated` and `StakeSlashed` events as this determines who is in the game.
		if (preloadStakes && config.contracts.stakeDeployBlock > 0) {
			this.preloadStakeLog()
		}

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
				Logging.showError(
					`Sync: Processing block ${block.number}/${
						endingBlock ? endingBlock : this.tip
					}`,
					'sync'
				)

			let roundAnchor: string | undefined
			if (block.number % (config.game.blocksPerRound / 4) == 0) {
				// Only at phase start
				try {
					roundAnchor = await this.redistribution.currentRoundAnchor({
						blockTag: block.number,
					})
					//Logging.showError(`currentRoundAnchor(${block.number}): ${roundAnchor}}`)
				} catch (e) {
					// Logging.showError(`currentRoundAnchor(${block.number}): ${e}}`)
					roundAnchor = undefined
				}
			}

			await this.blockHandler(showGas, block, roundAnchor)

			this.lastBlock = {
				blockNo: block.number,
				blockTimestamp: block.timestamp * 1000,
				baseFeePerGas: block.baseFeePerGas,
			}

			// break out early when we've processed the endingBlock
			if (block.number == endingBlock) break
		} while (this.lastBlock.blockNo < this.tip)
		const elapsed2 = Date.now() - start2
		Logging.showLogError(
			`Sync: Complete from block ${startFromBlock} to ${
				this.lastBlock.blockNo
			} in ${elapsed2 / 1000}s`
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

	private setupEventListeners(showGas: boolean) {
		// setup the event listeners

		// stake registry - only needed for new players / updated stakes
		/*
export interface StakeFrozenEventObject {
  frozen: string;
  overlay: string;
  time: BigNumber;
}
export type StakeFrozenEvent = TypedEvent<
  [string, string, BigNumber],
  StakeFrozenEventObject
>;

export type StakeFrozenEventFilter = TypedEventFilter<StakeFrozenEvent>;
*/
		/*
export interface OverlayChangedEventObject {
  owner: string;
  overlay: string;
}
export type OverlayChangedEvent = TypedEvent<
  [string, string],
  OverlayChangedEventObject
>;

export type OverlayChangedEventFilter = TypedEventFilter<OverlayChangedEvent>;
*/
		/*
    "StakeUpdated(address,uint256,uint256,bytes32,uint256)"(
      owner?: PromiseOrValue<string> | null,
      committedStake?: null,
      potentialStake?: null,
      overlay?: null,
      lastUpdatedBlock?: null
    ): StakeUpdatedEventFilter;
export interface StakeUpdatedEventObject {
  owner: string;
  committedStake: BigNumber;
  potentialStake: BigNumber;
  overlay: string;
  lastUpdatedBlock: BigNumber;
}
export type StakeUpdatedEvent = TypedEvent<
  [string, BigNumber, BigNumber, string, BigNumber],
  StakeUpdatedEventObject
>;

export type StakeUpdatedEventFilter = TypedEventFilter<StakeUpdatedEvent>;
*/
		this.stakeRegistry.on(
			this.stakeRegistry.filters[
				'StakeUpdated(address,uint256,uint256,bytes32,uint256,uint8)'
			](),
			async (
				owner,
				committedStake,
				potentialStake,
				overlay,
				lastUpdatedBlock,
				height,
				event
			) => {
				if (this._state == State.RUNNING) {
					const block = await this.provider.getBlock(event.blockNumber)
					game.stakeUpdated(overlay, owner, potentialStake, {
						blockNo: event.blockNumber,
						blockTimestamp: block.timestamp,
					})
				}
				//Logging.showLogError(
				//	`StakeUpdated event: ${fmtOverlay(overlay)}, ${shortBZZ(potentialStake)}(${shortBZZ(committedStake)}), ${fmtAccount(owner)}, ${lastUpdatedBlock}`
				//)
			}
		)

		// monitor the bzz token
		this.bzzToken.on(this.bzzToken.filters.Transfer(), (from, to, amount) => {
			// if (this._state == State.RUNNING)
			Logging.showLogError(
				`${shortBZZ(amount)} from ${fmtAccount(from)} to ${fmtAccount(to)}`
			)
		})

		this.bzzToken.on(
			this.bzzToken.filters.Approval(),
			(owner, spender, value) => {
				// if (this._state == State.RUNNING)
				Logging.showLogError(
					`${shortBZZ(value)} Approved from ${fmtAccount(
						owner
					)} to ${fmtAccount(spender)}`
				)
			}
		)

		// setup listener for new blocks
		this.provider.on('block', async (blockNumber: number) => {
			const block = await this.provider.getBlockWithTransactions(blockNumber)

			const gasPrice = await this.provider.getGasPrice()
			const priorityFee = BigNumber.from(
				await this.provider.send('eth_maxPriorityFeePerGas')
			)

			if (showGas) {
				this.gasPriceMonitor.newSample(gasPrice)

				let priceText = `{left}${specificLocalTime(
					block.timestamp * 1000
				)} ${blockNumber} ${
					this.gasPriceMonitor.lastPrice
				} ${this.gasPriceMonitor.percentColor()}%`
				priceText += ` ${Gas.gasPriceToString(
					gasPrice
				)} + ${Gas.gasPriceToString(priorityFee)}`
				priceText += '{/left}'
				const offsetLine = game.size + 1 // Keep room for the getRpcUrl
				Ui.getInstance().lineSetterCallback(BOXES.ALL_PLAYERS)(
					offsetLine,
					`{center}${config.chain.name} getGasPrice{/center}`,
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
			}

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
				let roundAnchor: string | undefined
				try {
					roundAnchor = await this.redistribution.currentRoundAnchor()
				} catch (e) {
					//Logging.showLog(`currentRoundAnchor: ${e}}`)
					roundAnchor = undefined
				}
				await this.blockHandler(showGas, block, roundAnchor)

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

	private async blockHandler(
		showGas: boolean,
		block: BlockWithTransactions,
		roundAnchor?: string
	) {
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
		if (showGas)
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
		const line = game.newBlock(blockDetails, roundAnchor)
		Ui.getInstance().lineSetterCallback(BOXES.ROUND_PLAYERS)(
			0,
			line,
			block.timestamp * 1000
		)

		block.transactions.forEach(async (tx) => {
			if (tx.to) {
				if (tx.to === config.contracts.redistribution) {
					// ToDo: Update redistribution contract once ABI is available
					await this.processRedistributionTx(
						this.redistribution.interface,
						true,
						tx,
						block.timestamp
					)
				}
				//else Logging.showLog(
				//	`Sync: block ${block.number} tx to ${tx.to} not redistribution ${config.contracts.redistribution}`)
			}
		})
		// I'd like to only refresh the top line if we processed something, but forEach precludes this
		Ui.getInstance().lineSetterCallback(BOXES.ROUND_PLAYERS)(
			0,
			line,
			block.timestamp * 1000
		)
	}

	private async processRedistributionTx(
		iface: utils.Interface,
		current: boolean,
		tx: TransactionResponse,
		blockTimestamp: number
	) {
		// colorize the round based on current contract or not
		const color = current ? 'white' : 'magenta'

		// get the receipt
		const receipt = await this.provider.getTransactionReceipt(tx.hash)

		// if tx failed, return
		if (!receipt.status) {
			const t = `{${color}-fg}${Round.roundFromBlock(
				receipt.blockNumber
			)}{/${color}-fg} ${receipt.blockNumber} {red-fg}Failed{/red-fg} ${
				tx.hash
			}`
			Logging.showLogError(t)
			Ui.getInstance().lineInserterCallback(BOXES.TRANSACTIONS)(
				1,
				t,
				blockTimestamp * 1000
			)
			this.numFailedTransactions++
			return
		}

		// decode the input data
		let desc
		try {
			desc = iface.parseTransaction(tx)
		} catch (e) {
			const t = `{${color}-fg}${Round.roundFromBlock(
				receipt.blockNumber
			)}{/${color}-fg} ${receipt.blockNumber} {red-fg}NoParse{/red-fg} ${
				tx.hash
			}`
			Logging.showLogError(t)
			Ui.getInstance().lineInserterCallback(BOXES.TRANSACTIONS)(
				1,
				t,
				blockTimestamp * 1000
			)
			Logging.showLog(`parseTransaction(${tx.hash}) failed with ${e}`)
			return
		}

		if (current) {
			const blockDetails: BlockDetails = {
				blockNo: receipt.blockNumber,
				blockTimestamp: blockTimestamp * 1000, // always set to milliseconds
			}

			// determine what function is being called
			switch (desc.name) {
				case 'commit': // commit
					var newHeight: number | undefined = undefined
					const [obfuscatedHash, roundNumber] = desc.args
					var overlayAddress = await this.stakeRegistry.overlayOfAddress(
						receipt.from
					)

					// Parse the logs for the winner / freezes / slashes
					receipt.logs.forEach((log) => {
						if (
							log.topics[0] ===
							this.redistribution.interface.getEventTopic('Committed')
						) {
							// below we destructure the Revealed struct
							const [roundNumber, overlay, height] =
								this.redistribution.interface.parseLog(log).args
							//Logging.showLogError(`${roundNumber} Commit ${fmtOverlay(overlay,64)} ${height}`)
							newHeight = height
						}
					})

					game.commit(overlayAddress, receipt.from, blockDetails, newHeight)

					break
				case 'reveal': // reveal
					var newStake: BigNumber | undefined = undefined
					var newStakeDensity: BigNumber | undefined = undefined
					const [depth, hash, revealNonce] = desc.args
					var overlay = await this.stakeRegistry.overlayOfAddress(receipt.from)

					// Parse the logs for the winner / freezes / slashes
					receipt.logs.forEach((log) => {
						if (
							log.topics[0] ===
							this.redistribution.interface.getEventTopic('Revealed')
						) {
							// below we destructure the Revealed struct
							const [roundNumber, overlay, stake, stakeDensity, hash, depth] =
								this.redistribution.interface.parseLog(log).args
							//Logging.showLogError(`${roundNumber} Reveal ${fmtOverlay(overlay,64)} ${shortBZZ(stake)} ${shortBZZ(stakeDensity)} ${depth}`)
							newStake = stake
							newStakeDensity = stakeDensity
						}
					})

					game.reveal(
						overlay,
						receipt.from,
						hash,
						depth,
						blockDetails,
						newStake,
						newStakeDensity
					)

					break
				case 'claim': // claim
					// check for a 'Winner' event
					const freezes: StakeFreeze[] = []
					const slashes: StakeSlash[] = []
					let winner: Reveal | undefined = undefined
					let amount = BigNumber.from(0)

					// Parse the logs for the winner / freezes / slashes
					receipt.logs.forEach((log) => {
						if (log.topics[0] === iface.getEventTopic('WinnerSelected')) {
							// below we destructure the Reveal struct
							winner = iface.parseLog(log).args[0]
							//Logging.showError(`Winner ${fmtOverlay(winner!.overlay)} ${shortBZZ(winner!.stake)} ${shortBZZ(winner!.stakeDensity)} ${winner!.depth}`)
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
							log.topics[0] ===
							this.bzzToken.interface.getEventTopic('Transfer')
						) {
							const [from, to, value] =
								this.bzzToken.interface.parseLog(log).args
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
				default:
					Logging.showLogError(`Unsupported Redistribution Tx ${desc.name}`)
			}
		}

		// Update transactions AFTER processing to pick up adopted highlight accounts
		let t = `{${color}-fg}${Round.roundFromBlock(
			receipt.blockNumber
		)}{/${color}-fg} ${receipt.blockNumber}`
		if (game.isMyAccount(tx.from)) t += ` {yellow-fg}${desc.name}{/yellow-fg}`
		else t += ` ${desc.name}`
		if (receipt.effectiveGasPrice)
			t += ` ${Gas.gasPriceToString(receipt.effectiveGasPrice)}`
		t += ` ${receipt.gasUsed}/${tx.gasLimit}`
		if (!tx.gasLimit.isZero()) {
			t += `=${(
				receipt.gasUsed.mul(10000).div(tx.gasLimit).toNumber() / 100
			).toFixed(2)}%`
		}
		if (tx.maxPriorityFeePerGas && tx.maxFeePerGas) {
			const baseFee = tx.maxFeePerGas.sub(tx.maxPriorityFeePerGas)
			t += ` ${Gas.gasPriceToString(baseFee)} ${Gas.gasPriceToString(
				tx.maxFeePerGas
			)} ${Gas.gasPriceToString(tx.maxPriorityFeePerGas)}`
		}
		Logging.showLog(t)
		Ui.getInstance().lineInserterCallback(BOXES.TRANSACTIONS)(
			1,
			t,
			blockTimestamp * 1000
		)
	}

	private async preloadStakeLog() {
		Logging.showLogError(
			`Loading StakeRegistry logs from block ${config.contracts.stakeDeployBlock}`
		)
		const start = Date.now()
		const stakeLogs = await this.stakeRegistry.queryFilter(
			{
				topics: [
					[
						this.stakeRegistry.interface.getEventTopic('StakeUpdated'),
						this.stakeRegistry.interface.getEventTopic('StakeSlashed'),
					],
				],
			},
			config.contracts.stakeDeployBlock
		)
		const elapsed = Date.now() - start
		Logging.showLogError(
			`Loaded ${stakeLogs.length} StakeRegistry logs in ${elapsed / 1000}s`
		)
		// now process the logs and add players to the game
		const start2 = Date.now()
		await this.processStakeLog(stakeLogs)
		const elapsed2 = Date.now() - start2
		Logging.showLogError(
			`Processed ${stakeLogs.length} StakeRegistry logs in ${elapsed2 / 1000}s`
		)
	}

	private async processStakeLog(logs: Log[]) {
		// process the logs
		Logging.showLogError(`Processing ${logs.length} StakeRegistry logs`)
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
				if (
					log.topics[0] ==
					this.stakeRegistry.interface.getEventTopic('StakeUpdated')
				) {
					const [
						owner,
						committedStake,
						potentialStake,
						overlay,
						lastUpdatedBlock,
					] = desc.args
					game.stakeUpdated(overlay, owner, potentialStake, blockDetails)
					//Logging.showLogError(
					//	`StakeUpdated event: ${fmtOverlay(overlay)}, ${shortBZZ(potentialStake)}(${shortBZZ(committedStake)}), ${fmtAccount(owner)}, ${lastUpdatedBlock}`
					//)
				} else if (
					log.topics[0] ==
					this.stakeRegistry.interface.getEventTopic('StakeSlashed')
				) {
					const [address, overlay, amount] = desc.args
					game.stakeSlashed(overlay, amount, blockDetails)
				}
			}
		}
	}

	public get rpcUrl(): string {
		return this.provider.connection.url
	}
}
