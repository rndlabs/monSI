import { Command, Option, InvalidOptionArgumentError } from 'commander'
import pack from '../package.json'
import config from './config'

import { ChainSync } from './chain'
import { SchellingGame, Ui } from './types/entities'
import { Logging } from './utils'
import { utils } from 'ethers'

// sane defaults for the environment variables (if not set)
const DEFAULT_PRELOAD_ROUNDS = 4
const DEFAULT_RPC_ENDPOINT = 'ws://goerli-geth.dappnode:8546'

interface CLIOptions {
	mainnet: boolean
	rpcEndpoint: string
	rounds?: number
	block?: number
	round?: number
	singleRound?: number
}

/**
 * Run the CLI
 * @param overlays User's overlays to highlight
 * @param options CLI options
 */
async function run(overlays: string[], options: CLIOptions) {
	const { mainnet, rpcEndpoint, rounds, block, round, singleRound } = options

	// Set the chain ID
	config.setChainId(mainnet ? 100 : 5)

	const chainsync = ChainSync.getInstance()

	// initialiaze ChainSync
	await chainsync.init(rpcEndpoint)

	let startBlock = await chainsync.getCurrentBlock()
	let endBlock

	// load only a single round and stop
	if (singleRound) {
		startBlock = singleRound * config.game.blocksPerRound
		endBlock = startBlock + config.game.blocksPerRound - 1 // inclusive
	}
	// preload from the given block
	else if (block !== undefined) startBlock = block
	// preload from the given round
	else if (round) startBlock = round * config.game.blocksPerRound
	// preload the last 'rounds' rounds
	else if (rounds) startBlock -= rounds * config.game.blocksPerRound

	// start the chain sync
	chainsync.start(startBlock, endBlock)

	// start the game
	const game = SchellingGame.getInstance()

	if (overlays.length > 0) {
		for (const overlay of overlays) {
			game.highlightOverlay(overlay)
		}
	}

	// start the TUI
	const ui = Ui.getInstance()
}

function cliParseInt(value: string, dummyPrevious: unknown): number {
	// parseInt takes a string and an optional radix
	const parsedValue = parseInt(value, 10)
	if (isNaN(parsedValue)) {
		throw new InvalidOptionArgumentError('Not a number.')
	}
	return parsedValue
}

function cliParseOverlay(overlay: string, previous: string[]): string[] {
	try {
		// use ethers to validate the overlay address
		const bytes = utils.arrayify(overlay, { allowMissingPrefix: true })
		if (bytes.length != 32) {
			throw new Error('Invalid overlay length')
		} else {
			if (!previous) previous = []
			// for ensuring consistent `0x` prefix
			previous.push(utils.hexlify(bytes))
			return previous
		}
	} catch (e) {
		throw new InvalidOptionArgumentError('Not a valid overlay.')
	}
}

/**
 * CLI entry point
 */
async function main() {
	const program = new Command()

	program
		.name('monSI')
		.description('Monitor Storage Incentives for Swarm')
		.version(pack.version)
		.argument(
			'[overlays...]',
			'Overlay addresses for highlighting',
			cliParseOverlay
		)
		.addOption(new Option('--mainnet', 'Use Swarm mainnet').default(false))
		.addOption(
			new Option(
				'--rpc-endpoint <string>',
				'RPC endpoint for the blockchain node'
			)
				.env('RPC_URL')
				.default(DEFAULT_RPC_ENDPOINT)
		)
		.addOption(
			new Option(
				'-r, --rounds [rounds]',
				'Load the last number of rounds from the blockchain'
			)
				.conflicts(['block, round, singleRound'])
				.default(DEFAULT_PRELOAD_ROUNDS) // Startup can take a LONG time if you make this large!
				.argParser(cliParseInt)
		)
		.addOption(
			new Option('-b, --block [block]', 'Block number to start loading from')
				.conflicts(['rounds, round, singleRound'])
				.argParser(cliParseInt)
		)
		.addOption(
			new Option('-R, --round [round]', 'Round number to start loading from')
				.conflicts(['rounds, block, singleRound'])
				.argParser(cliParseInt)
		)
		.addOption(
			new Option('-S, --singleRound [round]', 'Load a single round and stop')
				.conflicts(['rounds, round, block'])
				.argParser(cliParseInt)
		)
		.action(run)

	await program.parseAsync(process.argv)
}

main()
