/**
 * Ethereum Swarm Schelling game configuration by chain
 */

import { ChainSync } from './chain'

export type ChainConfig = {
	chain: {
		name: string
		secondsPerBlock: number
	}
	units: {
		BZZ: string
		ETH: string
	}
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
		priceOracle: string
	}
}

export type Configs = {
	[chainId: number]: ChainConfig
}
//  Note: contract addresses come from https://github.com/ethersphere/bee/blob/master/pkg/config/chain.go
export const chainConfig: Configs = {
	'5': {
		chain: {
			name: 'goerli',
			secondsPerBlock: 12,
		},
		units: {
			BZZ: 'gBZZ',
			ETH: 'gETH',
		},
		game: {
			blocksPerRound: 152,
			commitPhaseBlocks: 152 / 4,
			revealPhaseBlocks: 152 / 4,
		},
		contracts: {
			//			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD',	// Pre 2022/10/28 10.0.0 rc1
			redistribution: '0x2e4ccEb9a88bcfbC7779Fa693714783A345c1343',
			stakeRegistry: '0x18391158435582D5bE5ac1640ab5E2825F68d3a4',
			bzzToken: '0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335',
			postageStamp: '0x7aAC0f092F7b961145900839Ed6d54b1980F200c',
			priceOracle: '0x0c9de531dcb38b758fe8a2c163444a5e54ee0db2', // "goerliContractAddress" in pkg/config/chain.go
		},
	},
	'100': {
		// TODO: Correct these values once gnosis is deployed
		chain: {
			name: 'gnosis',
			secondsPerBlock: 5,
		},
		units: {
			BZZ: 'xBZZ',
			ETH: 'xdai', // Is it xdai, xDai, or xDAI
		},
		game: {
			blocksPerRound: 152,
			commitPhaseBlocks: 152 / 4,
			revealPhaseBlocks: 152 / 4,
		},
		contracts: {
			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD', // wrong
			stakeRegistry: '0x18391158435582D5bE5ac1640ab5E2825F68d3a4', // wrong
			bzzToken: '0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da', // correct
			postageStamp: '0x6a1A21ECA3aB28BE85C7Ba22b2d6eAE5907c900E', // correct
			priceOracle: '0x0FDc5429C50e2a39066D8A94F3e2D2476fcc3b85', // correct, "xdaiContractAddress" in pkg/config/chain.go
		},
	},
}

export default class Config {
	static chainConfig: Configs = chainConfig
	static chainSync: ChainSync = ChainSync.getInstance()

	static chainId = 5

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}

	static setChainId(chainId: number) {
		this.chainId = chainId
	}

	static get contracts(): ChainConfig['contracts'] {
		return Config.chainConfig[Config.chainId].contracts
	}

	static get units(): ChainConfig['units'] {
		return Config.chainConfig[Config.chainId].units
	}

	static get game(): ChainConfig['game'] {
		return Config.chainConfig[Config.chainId].game
	}

	static get chain(): ChainConfig['chain'] {
		return Config.chainConfig[Config.chainId].chain
	}
}
