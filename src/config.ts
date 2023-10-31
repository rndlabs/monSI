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
				'0xCb07bf0603da228C8ec602bf12b973b8A94f9bac'
			),
			stakeDeployBlock: 8139930,

			postageStamp: utils.getAddress(
				'0x1f87FEDa43e6ABFe1058E96A07d0ea182e7dc9BD'
			),

			priceOracle: utils.getAddress(
				'0x3e475aEAB162E28fee46E69225af446D3c4f3Bd3'
			),

			redistribution: utils.getAddress(
				'0x90317dC80F6A9327ee728c68955a9Cef90b29f5c'
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
				'0x30d155478eF27Ab32A1D578BE7b84BC5988aF381'
			),
			priceOracle: utils.getAddress(
				'0x344A2CC7304B32A87EfDC5407cD4bEC7cf98F035'
			),
			redistribution: utils.getAddress(
				'0x1F9a1FDe5c6350E949C5E4aa163B4c97011199B4'
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
