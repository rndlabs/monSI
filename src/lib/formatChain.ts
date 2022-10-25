export function chainName(id: number) {
	switch (id) {
		// from https://besu.hyperledger.org/en/stable/public-networks/concepts/network-and-chain-id/
		case 1:
			return 'mainnet'
		case 5:
			return 'goerli'
		case 11155111:
			return 'sepolia'
		case 2018:
			return 'dev'
		case 61:
			return 'classic'
		case 63:
			return 'ordor'
		case 6:
			return 'kotti'
		case 212:
			return 'astor'
		// from https://metamask.zendesk.com/hc/en-us/articles/360052711572-How-to-connect-to-the-Gnosis-Chain-network-formerly-xDai-
		case 100:
			return 'gnosis'
		default:
			return `chain ${id}`
	}
}
