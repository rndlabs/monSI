/**
 * Ethereum Swarm Schelling game configuration by chain
 */

import { utils } from 'ethers'

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
			bzzToken: utils.getAddress('0x2aC3c1d3e24b45c6C310534Bc2Dd84B5ed576335'), // correct 2022/11/14 from PostageStamp & Stake constructors

			stakeRegistry: utils.getAddress(
				//'0x39fc8db5d43c68379155b41451aa38190faa3498'	// From 2022/11/14 from pkg/config/chain.go
				'0xca024239DA477781f833858825602Cd249106882' // From 2022/12/12 https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_testnet.go
			),
			stakeDeployBlock: 8133404, // 7951984, // 2022/11/14

			postageStamp: utils.getAddress(
				//'0xf0a7e63f72a73bd339a7ee814aefa80995e532a0'	// From 2022/11/14 from pkg/config/chain.go
				'0x721E733E472f1531cDA23279E364f08869E2Bfa9' // From 2022/12/14 https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_testnet.go
			),

			priceOracle: utils.getAddress(
				//'0x2b308ceb1ff7398e93b008c9a9ea82ffcf6a7a24'	// From 2022/11/14 from Redistribution constructor
				'0x0d34297977123D55f64D109bB8D2C74e0358F83a' // From 2022/12/14 https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_testnet.go
			),

			//			redistribution: '0xF4963031E8b9f9659CB6ed35E53c031D76480EAD',	// Pre 2022/10/28 10.0.0 rc1
			redistribution: utils.getAddress(
				//'0x3174ed554247b3457922aecfcbdb17db123e519c'	// From 2022/11/14 in pkg/config/chain.go
				'0x8a0c1DA07261042f5aADa47ab9efa489Ee5A3e4b' // From 2022/12/14 https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_testnet.go
			),
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
			// 2022/12/19 from https://github.com/ethersphere/go-storage-incentives-abi/blob/master/abi/abi_mainnet.go
			bzzToken: utils.getAddress('0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da'),
			stakeRegistry: utils.getAddress(
				'0x781c6D1f0eaE6F1Da1F604c6cDCcdB8B76428ba7'
			),
			stakeDeployBlock: 25527075,
			postageStamp: utils.getAddress(
				'0x30d155478eF27Ab32A1D578BE7b84BC5988aF381'
			),
			priceOracle: utils.getAddress(
				'0x344A2CC7304B32A87EfDC5407cD4bEC7cf98F035'
			),
			redistribution: utils.getAddress(
				'0x8c26b7CA61A6608B011cBa43d8cA4476B6D8dA17'
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
