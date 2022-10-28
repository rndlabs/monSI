/**
 * Ethereum Swarm Schelling game configuration by chain
 */

import dotenv from 'dotenv'
dotenv.config()

export type ChainConfig = {
	name: string
	secondsPerBlock: number
	blocksPerRound: number
	commitPhaseBlocks: number
	revealPhaseBlocks: number
	contracts: {
		redistribution: string
		stakeRegistry: string
		bzzToken: string
		postageStamp: string
	}
}

export type Configs = {
	[chainId: number]: ChainConfig
}

const chainConfig: Configs = {
	'5': {
		name: 'goerli',
		secondsPerBlock: 12,
		blocksPerRound: 152,
		commitPhaseBlocks: 152 / 4,
		revealPhaseBlocks: 152 / 4 + 1,
		contracts: {
			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD',
			stakeRegistry: '0x18391158435582D5bE5ac1640ab5E2825F68d3a4',
			bzzToken: '0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335',
			postageStamp: '0x7aAC0f092F7b961145900839Ed6d54b1980F200c',
		},
	},
	'100': {
		// ToDO: Correct these values once gnosis is deployed
		name: 'gnosis',
		secondsPerBlock: 5,
		blocksPerRound: 152,
		commitPhaseBlocks: 152 / 4,
		revealPhaseBlocks: 152 / 4 + 1,
		contracts: {
			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD', // wrong
			stakeRegistry: '0x18391158435582D5bE5ac1640ab5E2825F68d3a4', // wrong
			bzzToken: '0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da', // correct
			postageStamp: '0x6a1A21ECA3aB28BE85C7Ba22b2d6eAE5907c900E', // correct
		},
	},
}

export const getRpcUrl = () =>
	process.env.RPC_URL || 'ws://goerli-geth.dappnode:8546'

export default chainConfig[Number(process.env.CHAIN_ID) || 5] // TODO: Determine from RPC provider getChainId()
