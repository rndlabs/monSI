/**
 * Ethereum Swarm Schelling game configuration by chain
 */

import dotenv from 'dotenv'
dotenv.config()

export type ChainConfig = {
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
		blocksPerRound: 152,
		commitPhaseBlocks: 152 / 4,
		revealPhaseBlocks: 152 / 2,
		contracts: {
			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD',
			stakeRegistry: '0x18391158435582D5bE5ac1640ab5E2825F68d3a4',
			bzzToken: '0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335',
			postageStamp: '0x7aAC0f092F7b961145900839Ed6d54b1980F200c',
		},
	},
}

export const getRpcUrl = () =>
	process.env.RPC_URL || 'ws://goerli-geth.dappnode:8546'

export default chainConfig[Number(process.env.CHAIN_ID) || 5]
