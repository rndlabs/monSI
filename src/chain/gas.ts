import { BigNumber, utils } from 'ethers'
import { BlockWithTransactions } from '@ethersproject/abstract-provider'

export class Gas {
	private _history: string = ''
	private _historyCount: number = 0
	private _percent: number = 0
	private _lastPrice: BigNumber = BigNumber.from(0)
	private _maxWidth: number

	public get lastPrice(): string {
		return Gas.gasPriceToString(this._lastPrice)
	}
	public get history(): string {
		return this._history
	}

	public get percent(): number {
		return this._percent
	}

	public percentColor(trigger: number = 10) {
		let result = `${this._percent}`
		if (this._percent >= trigger) result = `{red-fg}${this._percent}{/red-fg}`
		else if (this._percent <= -trigger)
			result = `{green-fg}${this._percent}{/green-fg}`
		return result
	}

	constructor(maxWidth: number) {
		this._maxWidth = maxWidth
		this._historyCount = maxWidth
		this._history = '.'.repeat(maxWidth)
	}

	newSample(newPrice: BigNumber): void {
		const delta = newPrice.sub(this._lastPrice)
		const bigChange = delta.abs() > this._lastPrice.div(10)

		this._percent = (
			!this._lastPrice.isZero()
				? delta.mul(100).div(this._lastPrice)
				: BigNumber.from(0)
		).toNumber()

		if (!this._lastPrice.isZero()) {
			this._percent = delta.mul(100).div(this._lastPrice).toNumber()
			if (bigChange && this._history.length > 0) {
				if (delta.lt(0)) this._history += '{green-fg}v{/green-fg}'
				else if (delta.gt(0)) this._history += '{red-fg}^{/red-fg}'
				else this._history += '{yellow-fg}-{/yellow-fg}'
			} else {
				if (delta.lt(0)) this._history += 'v'
				else if (delta.gt(0)) this._history += '^'
				else this._history += '-'
			}
			this._historyCount++
			if (this._historyCount > this._maxWidth) {
				if (this._history[0] == '{') {
					for (let i = 0; i < 2; i++) {
						const curly = this._history.indexOf('}')
						this._history = this._history.slice(curly + 1)
					}
				} else this._history = this._history.slice(1)
				this._historyCount--
			}
		}

		// const text = `{center}Gas Price: ${gasPriceToString(
		// 	newPrice
		// )} ${gasPricePercentDelta(newPrice)}%{/center}`

		// ui.lineSetterCallback(BOXES.ALL_PLAYERS)(
		// 	game.size,
		// 	`{center}${history}{/center}`,
		// 	-1
		// )
		// ui.lineInserterCallback(BOXES.ALL_PLAYERS)(game.size + 1, text, -1)

		this._lastPrice = newPrice
	}

	public static gasUtilization(block: BlockWithTransactions): string {
		return (
			block.gasUsed.mul(10000).div(block.gasLimit).toNumber() / 10000
		).toFixed(2)
	}

	public static gasPriceToString(price: BigNumber): string {
		const units = price.lt(utils.parseUnits('1', 'gwei')) ? 'mwei' : 'gwei'
		return `${Number(utils.formatUnits(price, units)).toFixed(3)} ${units}`
	}
}

// const text = `{center}Gas Price: ${gasPriceToString(
// 	newPrice
// )} ${gasPricePercentDelta(newPrice)}%{/center}`

// ui.lineSetterCallback(BOXES.ALL_PLAYERS)(
// 	game.size,
// 	`{center}${history}{/center}`,
// 	-1
// )
// ui.lineInserterCallback(BOXES.ALL_PLAYERS)(game.size + 1, text, -1)
