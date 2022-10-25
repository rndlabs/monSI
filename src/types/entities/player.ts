import { BigNumber } from 'ethers'
import { Logging } from '../../utils'
import { BlockDetails } from '../../chain/sync'
import { specificLocalTime } from '../../lib/formatDate'
import { leftId, shortId } from '../../lib/formatText'
import { colorDelta, colorValue } from '../../lib/formatUi'
import { formatSi, shortBZZ } from '../../lib/formatUnits'
import { Round } from './round'
import { SchellingGame } from './schelling'
import Ui from './ui'

export class Player {
	private _overlay: string // overlay of the bee node
	private _account: string // ethereum address of the bee node
	private amount: BigNumber = BigNumber.from(0) // total amount won / lost
	private line: number // where this player is in the players list
	private lastBlock: BlockDetails // block details of last interaction
	private playCount?: number // don't initialize
	private winCount = 0 // initialize as 0
	private frozenThawBlock?: number // if true, this is a frozen overlay
	private freezeCount = 0 // initialize as 0
	private slashCount = 0 // initialize as 0

	private reveals: { [round: number]: { hash: string; depth: number } } = {}

	public get overlay() {
		return this._overlay
	}
	public get account() {
		return this._account
	}

	/**
	 * Create a new Player object
	 * @param overlay address of the bee node (swarm overlay)
	 * @param account ethereum address of the bee node
	 */
	constructor(overlay: string, account: string, _block: BlockDetails) {
		this._overlay = overlay
		this._account = account
		this.line = SchellingGame.getInstance().size
		this.lastBlock = _block

		Logging.showLogError('New player: ' + this.overlayString())

		this.render()
	}

	/**
	 * Format the overlay address as a string
	 * @returns the overlay address as a string
	 */
	overlayString(): string {
		return leftId(this._overlay, 12)
	}

	/**
	 * Format the player as a string
	 * @returns the player as a string
	 */
	format(): string {
		let result = this.overlayString()

		if (this.playCount) result = result + ` ${this.winCount}/${this.playCount}`
		if (this.freezeCount > 0)
			result += ` {blue-fg}${this.freezeCount}{/blue-fg}`
		if (this.slashCount > 0) result += ` {red-fg}${this.slashCount}{/red-fg}`

		if (this.amount.gt(0)) {
			result +=
				' ' +
				colorValue(this.amount, shortBZZ, { showPlus: false }) +
				colorDelta(this._overlay + ':amount', this.amount, formatSi, {
					showPlus: true,
				})
		}

		if (this.frozenThawBlock)
			result += ` {blue-fg}${this.frozenThawBlock}{/blue-fg}`

		return result
	}

	formatRound(round: number): string {
		let t = `${Round.roundString(
			this.lastBlock.blockNo
		)} ${this.overlayString()}`
		t += ` ${Round.roundPhaseFromBlock(this.lastBlock.blockNo)}`
		if (this.reveals[round]) {
			t += ` ^${this.reveals[round].depth} ${shortId(
				this.reveals[round].hash,
				10
			)}`
		}
		return `${specificLocalTime(this.lastBlock.blockTimestamp)} ${t}`
	}

	/**
	 * Bump the player's play count
	 * @param blockTime the block time in milliseconds
	 */
	commit(block: BlockDetails) {
		this.lastBlock = block
		this.playCount = (this.playCount || 0) + 1

		// if the player is frozen, check if they should be thawed
		if (this.frozenThawBlock) {
			this.frozenThawBlock = undefined
		}

		this.render()
	}

	reveal(block: BlockDetails, round: number, hash: string, depth: number) {
		this.lastBlock = block
		this.reveals[round] = { hash, depth }
	}

	/**
	 * As a winner, claim our prize
	 * @param block the block time in milliseconds
	 * @param _amount the amount to add to the player's total amount
	 */
	claim(block: BlockDetails, _amount: BigNumber) {
		this.lastBlock = block
		this.amount = this.amount.add(_amount)
		this.winCount++

		this.render()
	}

	/**
	 * Freeze the player's stake
	 * @param block the block time in milliseconds
	 * @param thawBlock the block number when the player will be thawed
	 */
	freeze(block: BlockDetails, thawBlock: number) {
		this.lastBlock = block
		this.frozenThawBlock = thawBlock
		this.freezeCount++

		Logging.showLogError(
			`${this.overlayString()} Frozen for ${thawBlock - block.blockNo} blocks`
		)

		this.render()
	}

	updateStake(block: BlockDetails, amount: BigNumber) {
		this.lastBlock = block
		// don't set the below as the amount is only used to track winnings
		// this.amount = amount

		Logging.showLogError(
			`${this.overlayString()} Stake Updated ${shortBZZ(amount)}`
		)

		this.render()
	}

	/**
	 * Slash the player's stake
	 * @param block the block time in milliseconds
	 * @param amount the amount to subtract from the player's total amount
	 */
	slash(block: BlockDetails, amount: BigNumber) {
		this.lastBlock = block
		this.amount = this.amount.sub(amount)
		this.slashCount++

		Logging.showLogError(`${this.overlayString()} Slashed ${shortBZZ(amount)}`)

		this.render()
	}

	/**
	 * Render the player to the screen
	 */
	render() {
		Ui.getInstance().updatePlayer(
			this.line,
			this.format(),
			this.lastBlock.blockTimestamp
		)
	}
}
