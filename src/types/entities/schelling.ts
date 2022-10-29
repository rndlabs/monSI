import { BigNumber } from 'ethers'
import BTree_ from 'sorted-btree'
const BTree = (BTree_ as any).default as typeof BTree_

import config from '../../config'
import { Logging } from '../../utils'
import { leftId, shortId } from '../../lib'
import { BlockDetails } from '../../chain'

import { Player } from './player'
import { Round } from './round'

export type StakeFreeze = {
	overlay: string
	numBlocks: BigNumber
}

export type StakeSlash = {
	overlay: string
	amount: BigNumber
}

export type Reveal = {
	owner: string
	overlay: string
	stake: BigNumber
	stakeDensity: BigNumber
	hash: string
	depth: BigNumber
}

/**
 * A singleton class for managing the state of players
 */
export class SchellingGame {
	private static instance: SchellingGame
	// All players have a unique overlay address
	private players: BTree_<string, Player>
	private rounds: BTree_<number, Round>
	private currentRoundNo = 0
	private lastBlock: BlockDetails

	private myOverlays: string[] = []
	private myAccounts: string[] = []

	private static _showLogs = false

	/**
	 * Make the constructor private so that it can't be called.
	 * @private
	 */
	private constructor() {
		this.players = new BTree()
		this.rounds = new BTree()
		this.currentRoundNo = 0 // We haven't started the game yet
		this.lastBlock = { blockNo: 0, blockTimestamp: 0 }
	}

	private getOrCreatePlayer(
		overlay: string,
		account?: string,
		block?: BlockDetails
	): Player {
		if (!this.players.has(overlay)) {
			this.players.set(overlay, new Player(overlay, account, block, this.size))
			let line = 0 // Reassign the lines to sort the new player into place
			this.players.forEachPair((overlay, player) => {
				player.setLine(line++)
			})
		}
		return this.players.get(overlay)!
	}

	public getOrCreateRound(roundNo: number, block: BlockDetails): Round {
		// create the round if it doesn't exist
		if (!this.rounds.has(roundNo)) {
			this.rounds.set(roundNo, new Round(block))
			this.players.forEachPair((overlay, player) => {
				player.notPlaying()
			})
		}
		const round = this.rounds.get(roundNo)
		round!.lastBlock = block
		return round!
	}

	public highlightOverlay(overlay: string) {
		if (!this.myOverlays.includes(overlay)) {
			this.myOverlays[this.myOverlays.length] = overlay
			this.getOrCreatePlayer(overlay)
		}
	}

	// --- game logic ---

	public newBlock(block: BlockDetails): string {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)
		if (roundNo != this.currentRoundNo) {
			if (this.currentRoundNo != 0) {
				const round = this.rounds.get(this.currentRoundNo)
				if (round && !round.claim) {
					round.lastBlock = this.lastBlock
					round.unclaimed = true
					round.render()
				}
			}
			this.currentRoundNo = roundNo
		}
		this.lastBlock = block
		const blocksPerRound = config.game.blocksPerRound // TODO use configured blocksPerRound
		const offset = block.blockNo % blocksPerRound
		let phase
		let length
		let elapsed
		if (offset < blocksPerRound / 4) {
			phase = 'commit'
			length = blocksPerRound / 4
			elapsed = offset + 1
		} else if (offset < blocksPerRound / 2) {
			phase = 'reveal'
			length = blocksPerRound / 4
			elapsed = offset - blocksPerRound / 4 + 1
		} else {
			phase = 'claim'
			length = blocksPerRound / 2
			elapsed = offset - blocksPerRound / 2 + 1
		}
		const remaining = length - elapsed
		const percent = Math.floor((elapsed * 100) / length)

		let line = `${Round.roundString(
			block.blockNo
		)} ${percent}% of ${phase}, ${remaining} blocks left`
		if (config.game.blocksPerRound - offset - 1 != remaining)
			line = line + `, ${config.game.blocksPerRound - offset - 1} in round`
		return line
	}

	// --- commit
	public commit(overlay: string, owner: string, block: BlockDetails) {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)

		const round = this.getOrCreateRound(roundNo, block)

		// update player state
		const player = this.getOrCreatePlayer(overlay, owner, block)!
		player.commit(block)

		// update the round state
		round.commits++
		round.players.push(overlay)

		if (SchellingGame._showLogs)
			Logging.showError(
				`${Round.roundString(block.blockNo)} Player ${leftId(overlay, 16)}`
			)

		round.render()
	}

	// --- reveal
	public reveal(
		overlay: string,
		owner: string,
		hash: string,
		depth: number,
		block: BlockDetails
	) {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)

		const round = this.getOrCreateRound(roundNo, block)

		// update the player
		const player = this.getOrCreatePlayer(overlay, owner, block)!
		player.reveal(block, roundNo, hash, depth)

		// update the round state
		round.reveals++

		if (round.hashes[hash]) {
			if (round.hashes[hash].depth != depth) {
				Logging.showLogError(
					`reveal: hash ${hash} has different depth ${round.hashes[hash].depth} != ${depth}`
				)
				return
			}

			round.hashes[hash].count++
			if (this.isMyOverlay(overlay)) round.hashes[hash].highlight = true
		} else {
			round.hashes[hash] = {
				count: 1,
				depth,
				highlight: this.isMyOverlay(overlay),
			}
			if (SchellingGame._showLogs)
				Logging.showError(
					`${Round.roundString(block.blockNo)} new hash ${shortId(hash, 16)}`
				)
		}

		if (SchellingGame._showLogs)
			Logging.showError(
				`${Round.roundString(block.blockNo)} Player ${leftId(
					overlay,
					16
				)} reveal ${depth} ${shortId(hash, 16)}`
			)

		// render the round
		round.render()
	}

	// --- claim
	public claim(
		winner: Reveal,
		owner: string,
		amount: BigNumber,
		block: BlockDetails,
		freezes: StakeFreeze[] = [],
		slashes: StakeSlash[] = []
	) {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)

		const round = this.getOrCreateRound(roundNo, block)

		// update player state
		const winningPlayer = this.getOrCreatePlayer(winner.overlay, owner, block)!
		winningPlayer.claim(block, amount)

		// freeze any players
		freezes.forEach(({ overlay, numBlocks }) => {
			const player = this.players.get(overlay)
			if (player) {
				player.freeze(block, numBlocks.add(block.blockNo).toNumber())
			}
		})

		// slash any players
		slashes.forEach(({ overlay, amount: wad }) => {
			const player = this.players.get(overlay)
			if (player) {
				player.slash(block, wad)
			}
		})

		// update the round state
		round.lastBlock = block

		round.claim = {
			overlay: winner.overlay,
			amount,
			depth: winner.depth,
			truth: winner.hash,
		}
		round.freezes = freezes.length
		round.slashes = slashes.length

		if (SchellingGame._showLogs)
			Logging.showError(
				`${Round.roundString(block.blockNo)} Player ${leftId(
					winner.overlay,
					16
				)} claim ${winner.depth} ${shortId(winner.hash, 16)}`
			)

		// render the round
		round.render()
	}

	// --- stake logic (slashing and freezing handled in claim)

	// --- stake updated (depositStake)
	public stakeUpdated(
		overlay: string,
		owner: string,
		amount: BigNumber,
		block: BlockDetails
	) {
		// update player state
		const player = this.getOrCreatePlayer(overlay, owner, block)
		player.updateStake(block, amount)
	}

	// --- singleton method

	public static getInstance(): SchellingGame {
		if (!SchellingGame.instance) {
			SchellingGame.instance = new SchellingGame()
		}
		return SchellingGame.instance
	}

	// --- accessors

	/**
	 * Get the total number of players.
	 * @returns {number} The total number of players.
	 */
	public get size(): number {
		return this.players.size
	}

	/**
	 * Get all the players.
	 * @returns {IterableIterator[]} All the players.
	 */
	public get values(): IterableIterator<Player> {
		return this.players.values()
	}

	/**
	 * Get all the player's overlay addresses
	 * @returns {string[]} the player's overlay addresses
	 */
	public get keys(): IterableIterator<string> {
		return this.players.keys()
	}

	public get numRounds(): number {
		return this.rounds.size
	}

	public getRound(round: number) {
		return this.rounds.get(round)
	}

	public getPlayer(overlay: string) {
		return this.players.get(overlay)
	}

	// --- booleans

	/**
	 * Determine if the overlay address is in the list of my overlays
	 * @param overlay the overlay address to check
	 * @returns true if the overlay address is in the list of my overlays
	 */
	public isMyOverlay(overlay: string): boolean {
		return this.myOverlays.includes(overlay)
	}

	/**
	 * Determine if the account is in the list of my accounts
	 * @param account the account to check
	 * @returns true if the account is in the list of my accounts
	 */
	public isMyAccount(account: string): boolean {
		return this.myAccounts.includes(account)
	}

	// --- static helpers

	/**
	 * Determine the rond from the block number
	 * @param blockNo from which to calculate the round
	 * @returns the round number
	 */
	public static roundFromBlockNo(blockNo: number): number {
		return Math.floor(blockNo / config.game.blocksPerRound)
	}
}
