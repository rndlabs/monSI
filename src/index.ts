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

const chainsync = ChainSync.getInstance()
const ui = tui.getInstance()
const game = SchellingGame.getInstance()
const log = Logging

// sane defaults for the environment variables (if not set)
const PRELOAD_ROUNDS = process.env.PRELOAD_ROUNDS || 4 // Startup can take a LONG time if you make this large!

;(async () => {
	chainsync.start()
})()
