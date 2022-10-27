import { BigNumber, BigNumberish } from 'ethers'
import { BlockDetails } from '../../chain/sync'
import config from '../../config'
import { fmtOverlay } from '../../lib/formatText'
import { formatSi } from '../../lib/formatUnits'
import { SchellingGame } from './schelling'
import Ui, { BOXES } from './ui'

export type RoundHash = {
	depth: number
	count: number
}

export type Claim = {
	overlay: string
	truth: string
	depth: BigNumberish
	amount: BigNumber
}

export class Round {
	private _id: number
	public lastBlock: BlockDetails
	public commits = 0
	public reveals = 0
	public slashes = 0
	public freezes = 0
	public players: string[] = []
	public hashes: { [hash: string]: RoundHash } = {}
	public claim: Claim | undefined = undefined
	public unclaimed = false
	private line = 0
	private rendered = false

	public get id() {
		return this._id
	}

	constructor(block: BlockDetails) {
		this._id = Round.roundFromBlock(block.blockNo)
		this.lastBlock = block
		this.rendered = false
		this.line = SchellingGame.getInstance().numRounds
	}

	/**
	 * Format the round as a string.
	 * @returns {string} The round as a string.
	 */
	format(): string {
		let r = `${this.roundString()} ${this.commits}-${this.reveals}`
		if (this.slashes > 0) r += `={red-fg}${this.slashes}{/red-fg}`

		// iterate over all hashes and if the depth is not the same in all, set sameDepth to false
		let sameDepth = true
		let depth = 0
		for (const hash in this.hashes) {
			if (depth === 0) depth = this.hashes[hash].depth
			else if (depth !== this.hashes[hash].depth) {
				sameDepth = false
				break
			}
		}

		// enumerate and output the hashes
		let i = 0
		for (const hash in this.hashes) {
			r += i > 0 ? '+' : ' '
			const color = this.claim && hash == this.claim.truth ? 'green' : 'red'
			r +=
				`{${color}-fg}${this.hashes[hash].count}` +
				(!sameDepth ? `^${this.hashes[hash].depth}` : '') +
				`{/${color}-fg}`
			i++
		}

		if (this.freezes > 0) r = r + `={blue-fg}${this.freezes}{/blue-fg}`
		if (this.claim) {
			r += ` ${fmtOverlay(this.claim.overlay, 12)}`
			r += ` ^${this.claim.depth}`
			r +=
				' {green-fg}' +
				formatSi(this.claim.amount, { showPlus: true }) +
				'{/green-fg}'
		} else if (this.unclaimed) {
			r += ' {magenta-fg}UNCLAIMED{/magenta-fg}'
		}
		return r
	}

	formatRoundPlayers(): string {
		let r = ''
		for (const player of this.players) {
			r += '\n' // Always start with a newline to have room for the current round at the top
			const p = SchellingGame.getInstance().getPlayer(player)!
			r += p.formatRound(this._id)
		}
		return r
	}

	/**
	 * Render the round.
	 */
	render() {
		const ui = Ui.getInstance()
		const playersCb = ui.boxSetterCallback(BOXES.ROUND_PLAYERS)

		// update the rounds box
		if (this.rendered) {
			const roundsCb = ui.lineSetterCallback(BOXES.ROUNDS)
			roundsCb(0, this.format(), this.lastBlock.blockTimestamp)
		} else {
			this.rendered = true
			const roundsCb = ui.insertTopCallback(BOXES.ROUNDS)
			roundsCb(this.format(), this.lastBlock.blockTimestamp)
		}

		// set the round players box
		ui.boxLabelSetterCallback(BOXES.ROUND_PLAYERS)(`Round ${this.id} players`)
		playersCb(this.formatRoundPlayers())
	}

	public roundString(): string {
		return Round.roundString(this.lastBlock.blockNo)
	}

	public static roundFromBlock(block: number) {
		return Math.floor(block / config.blocksPerRound)
	}

	public static roundString(block: number) {
		return `${Round.roundFromBlock(block)}(${block % config.blocksPerRound})`
	}

	public static roundPhaseFromBlock(block: number) {
		const residual = block % config.blocksPerRound

		if (residual < config.commitPhaseBlocks) {
			return 'commit'
		} else if (residual < config.commitPhaseBlocks + config.revealPhaseBlocks) {
			return 'reveal'
		} else {
			return 'claim'
		}
	}
}