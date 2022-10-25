import { BigNumber } from 'ethers'
import BTree_ from 'sorted-btree'
import { leftId, shortId } from '../../lib/formatText'
const BTree = (BTree_ as any).default as typeof BTree_

import config from '../../config'
import { Logging } from '../../utils'

import { Player } from './player'
import { Round } from './round'
import { BlockDetails } from '../../chain/sync'

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

	private myOverlays: string[] = []
	private myAccounts: string[] = []

	/**
	 * Make the constructor private so that it can't be called.
	 * @private
	 */
	private constructor() {
		this.players = new BTree()
		this.rounds = new BTree()
	}

	// --- game logic ---

	// --- commit
	public commit(overlay: string, block: BlockDetails) {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)

		// create the round if it doesn't exist
		if (!this.rounds.has(roundNo)) {
			this.rounds.set(roundNo, new Round(block))
		} else {
			// update the round timestamp
			this.rounds.get(roundNo)!.lastBlock = block
		}

		// update player state
		const player = this.players.get(overlay)!
		player.commit(block)

		// update the round state
		const round = this.rounds.get(roundNo)!
		round.commits++
		round.players.push(overlay)

		Logging.showError(
			`${Round.roundString(block.blockNo)} Player ${leftId(overlay, 16)}`
		)

		round.render()
	}

	// --- reveal
	public reveal(
		overlay: string,
		hash: string,
		depth: number,
		block: BlockDetails
	) {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)

		// create the round if it doesn't exist
		if (!this.rounds.has(roundNo)) {
			this.rounds.set(roundNo, new Round(block))
		} else {
			// update the round timestamp
			this.rounds.get(roundNo)!.lastBlock = block
		}

		// update the player
		const player = this.players.get(overlay)!
		player.reveal(block, roundNo, hash, depth)

		// update the round state
		const round = this.rounds.get(roundNo)!
		round.reveals++

		if (round.hashes[hash]) {
			if (round.hashes[hash].depth != depth) {
				Logging.showLogError(
					`reveal: hash ${hash} has different depth ${round.hashes[hash].depth} != ${depth}`
				)
				return
			}

			round.hashes[hash].count++
		} else {
			round.hashes[hash] = {
				count: 1,
				depth,
			}
		}

		Logging.showError(
			`${Round.roundString(block.blockNo)} new hash ${shortId(hash, 16)}`
		)
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
		amount: BigNumber,
		block: BlockDetails,
		freezes: StakeFreeze[] = [],
		slashes: StakeSlash[] = []
	) {
		const roundNo = SchellingGame.roundFromBlockNo(block.blockNo)

		// update player state
		const winningPlayer = this.players.get(winner.overlay)!
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
		const round = this.rounds.get(roundNo)!

		round.claim = {
			overlay: winner.overlay,
			amount,
			depth: winner.depth,
			truth: winner.hash,
		}
		round.freezes = freezes.length
		round.slashes = slashes.length

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
		// create the player if it doesn't exist
		if (!this.players.has(overlay)) {
			this.players.set(overlay, new Player(overlay, owner, block))
		}

		// update player state
		const player = this.players.get(overlay)!
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
		return Math.floor(blockNo / config.blocksPerRound)
	}
}
