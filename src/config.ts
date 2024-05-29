/**
 * Ethereum Swarm Schelling game configuration by chain
 */

import { utils } from 'ethers'

import { ChainSync } from './chain/index.js'

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
		stakeDeployBlock: number
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
		// Goerli Testnet
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
			bzzToken: utils.getAddress('0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335'),

			// for deployment addresses, see https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_testnet.go
			stakeRegistry: utils.getAddress(
				'0xE39AD1Ea8232ea525d061125433890fCA0260d04'
			),
			stakeDeployBlock: 10115421,

			postageStamp: utils.getAddress(
				'0x74A21593321dDb9a1dB2ae0718e1a0F20D8896Fd'
			),

			priceOracle: utils.getAddress(
				'0x6003e7f976c87934EBeB4f8B240269f56Ac3a1df'
			),

			redistribution: utils.getAddress(
				'0xb4E1Cd379063cb1A69C8EAaaFae3f9E3e670F798'
			),
		},
	},
	'11155111': {
		// Sepolia Testnet
		chain: {
			name: 'sepolia',
			secondsPerBlock: 12,
		},
		units: {
			BZZ: 'sBZZ',
			ETH: 'sETH',
		},
		game: {
			blocksPerRound: 152,
			commitPhaseBlocks: 152 / 4,
			revealPhaseBlocks: 152 / 4,
		},
		contracts: {
			bzzToken: utils.getAddress('0x543dDb01Ba47acB11de34891cD86B675F04840db'),

			// for deployment addresses, see https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_testnet.go
			stakeRegistry: utils.getAddress(
				'0x41379955a216968996D10614B74b31AA48a0624A'
			),
			stakeDeployBlock: 4660478,

			postageStamp: utils.getAddress(
				'0x794532C50c6EfA070Cd206b82178E98433046996'
			),

			priceOracle: utils.getAddress(
				'0x201dcde5c2D14CE03Fa74b0158488122FcA673B8'
			),

			redistribution: utils.getAddress(
				'0xd4621827301E26645Ae3887f7172d6a372782F69'
			),
		},
	},
	'100': {
		// gnosis mainnet
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
			bzzToken: utils.getAddress('0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da'),

			// for deployment addresses, see https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_mainnet.go
			stakeRegistry: utils.getAddress(
				'0x781c6D1f0eaE6F1Da1F604c6cDCcdB8B76428ba7'
			),
			stakeDeployBlock: 25527075,
			postageStamp: utils.getAddress(
				'0x45a1502382541Cd610CC9068e88727426b696293'
			),
			priceOracle: utils.getAddress(
				'0x86DE783Bf23Bc13DaeF5A55ec531C198da8f10cF'
			),
			redistribution: utils.getAddress(
				'0xD9dFE7b0ddc7CcA41304FE9507ed823faD3bdBab'
			),
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
