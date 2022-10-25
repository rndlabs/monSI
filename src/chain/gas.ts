import { BigNumber, utils } from 'ethers'
import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import { SchellingGame } from '../types/entities/schelling'
import tui, { BOXES } from '../types/entities/ui'

let history = ''
let historyCount = 0
let lastPrice = BigNumber.from(0)

export default (newPrice: BigNumber) => {
	const ui = tui.getInstance()
	const game = SchellingGame.getInstance()

	const delta = newPrice.sub(lastPrice)
	const bigChange = delta.abs() > lastPrice.div(10)

	if (!lastPrice.isZero()) {
		if (bigChange && history.length > 0) {
			if (delta.lt(0)) history += '{green-fg}v{/green-fg}'
			else if (delta.gt(0)) history += '{red-fg}^{/red-fg}'
			else history += '{yellow-fg}-{/yellow-fg}'
		} else {
			if (delta.lt(0)) history += 'v'
			else if (delta.gt(0)) history += '^'
			else history += '-'
		}
		historyCount++
		if (historyCount > 36) {
			if (history[0] == '{') {
				for (let i = 0; i < 2; i++) {
					const curly = history.indexOf('}')
					history = history.slice(curly + 1)
				}
			} else history = history.slice(1)
			historyCount--
		}
	}

	const text = `{center}Gas Price: ${gasPriceToString(
		newPrice
	)} ${gasPricePercentDelta(newPrice)}%{/center}`

	ui.lineSetterCallback(BOXES.ALL_PLAYERS)(
		game.size,
		`{center}${history}{/center}`,
		-1
	)
	ui.lineInserterCallback(BOXES.ALL_PLAYERS)(game.size + 1, text, -1)

	lastPrice = newPrice
}

export const gasPricePercentDelta = (newPrice: BigNumber): number => {
	const delta = newPrice.sub(lastPrice)
	return (
		!lastPrice.isZero() ? delta.mul(100).div(lastPrice) : BigNumber.from(0)
	).toNumber()
}

export const gasUtilization = (block: BlockWithTransactions): string => {
	return (
		block.gasUsed.mul(10000).div(block.gasLimit).toNumber() / 10000
	).toFixed(2)
}

export const gasPriceToString = (price: BigNumber): string => {
	const units = price.lt(utils.parseUnits('1', 'gwei')) ? 'mwei' : 'gwei'
	return `${Number(utils.formatUnits(price, units)).toFixed(3)} ${units}`
}
