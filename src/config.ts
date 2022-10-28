/**
 * Ethereum Swarm Schelling game configuration by chain
 */

import { ChainSync } from './chain'

export type ChainConfig = {
	game: {
		blocksPerRound: number
		commitPhaseBlocks: number
		revealPhaseBlocks: number
	}
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

export const chainConfig: Configs = {
	'5': {
		game: {
			blocksPerRound: 152,
			commitPhaseBlocks: 152 / 4,
			revealPhaseBlocks: 152 / 4 + 1,
		},
		contracts: {
			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD',
			stakeRegistry: '0x18391158435582D5bE5ac1640ab5E2825F68d3a4',
			bzzToken: '0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335',
			postageStamp: '0x7aAC0f092F7b961145900839Ed6d54b1980F200c',
		},
	},
}

export default class Config {
	static chainConfig: Configs = chainConfig
	static chainSync: ChainSync = ChainSync.getInstance()

	static chainId = 5

	private constructor() {}

	static get contracts(): ChainConfig['contracts'] {
		return Config.chainConfig[Config.chainId].contracts
	}

	static get game(): ChainConfig['game'] {
		return Config.chainConfig[Config.chainId].game
	}

	static setChainId(chainId: number) {
		Config.chainId = chainId
	}
}
