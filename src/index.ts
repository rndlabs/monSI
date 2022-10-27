import { Logging } from './utils'
import dotenv from 'dotenv'

import tui from './types/entities/ui'
import ChainSync from './chain/sync'

import { SchellingGame } from './types/entities/schelling'

import config from './config'

// get the environment variables
dotenv.config()

const RPC_URL = process.env.RPC_URL || 'ws://goerli-geth.dappnode:8546'
const CHAIN_ID = Number(process.env.CHAIN_ID) || 5

//const usage = `Usage: ${process.argv[0]} ${process.argv[1]} rpcURL(websocket) <HighlightOverlays...> <options>` +
const usage =
	`Usage: ${process.argv[0]} ${process.argv[1]} <HighlightOverlays...> <options>` +
	'\n' +
	'Valid options are:' +
	'\n' +
	'    --preloadRounds N          Number of rounds to load before current round' +
	'\n' +
	'    --startBlock N             Block number to start loading' +
	'\n' +
	'    --startRound N             Round number to start loading; each round is 152 blocks' +
	'\n' +
	'' +
	'\n' +
	`for example: ${process.argv[0]} ${process.argv[1]} 6a7c4d45064a382fdd6913fcfdf631b9cacd163c02f9207dee219ef63e953e43 0xB7563E747205FA41E3C59ADCEC667AA5D7415A8E1F4A61B35232486FF49F7C7B 828bec0209b77c751b8e41cd1e4004e902db05a8a7323f53ddf3d1d3dbb7f412 --preloadRounds 4`
//				`for example: ${process.argv[0]} ${process.argv[1]} ws://localhost:8545 6a7c4d45064a382fdd6913fcfdf631b9cacd163c02f9207dee219ef63e953e43 0xB7563E747205FA41E3C59ADCEC667AA5D7415A8E1F4A61B35232486FF49F7C7B 828bec0209b77c751b8e41cd1e4004e902db05a8a7323f53ddf3d1d3dbb7f412 --preloadRounds 4`

const chainsync = ChainSync.getInstance()
const ui = tui.getInstance(usage)
const game = SchellingGame.getInstance()
const log = Logging

// sane defaults for the environment variables (if not set)
const PRELOAD_ROUNDS = process.env.PRELOAD_ROUNDS || 4 // Startup can take a LONG time if you make this large!

var preloadRounds = 0
var startBlock = 0
var startRound = 0

for (
	var i = 2;
	i < process.argv.length;
	i++ // start at 3 if/when RPC_URL is on command line
) {
	if (process.argv[i] == '--preloadRounds')
		preloadRounds = Number(
			process.argv[++i]
		) // Startup can take a LONG time if you make this large!
	else if (process.argv[i] == '--startBlock')
		startBlock = Number(process.argv[++i])
	else if (process.argv[i] == '--startRound')
		startRound = Number(process.argv[++i])
	else if (process.argv[i].slice(0, 1) == '-') {
		console.error('Invalid option ${process.argv[i]}')
		process.exit(-1)
	} else {
		var overlay = process.argv[i].toLowerCase()
		if (overlay.slice(0, 2) != '0x') overlay = '0x' + overlay
		if (
			overlay.length !=
			'0x47d48ff50fcfe118ecadb97d6cefe17397a0eeb554e4112b7a24d14ded8451bc'
				.length
		) {
			console.error('Invalid overlay ${overlay}')
			process.exit(-1)
		}
		game.highlightOverlay(overlay)
	}
}

;(async () => {
	var startArg = await chainsync.getCurrentBlock()
	if (preloadRounds > 0)
		startArg = startArg - preloadRounds * config.blocksPerRound
	else if (startRound > 0) startArg = startRound * config.blocksPerRound
	else if (startBlock > 0) startArg = startBlock

	chainsync.start(startArg)
})()
