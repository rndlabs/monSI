/**
 * Formats a string of numbers into a string with SI suffixes.
 */

import { BigNumber, utils } from 'ethers'

export type FormatUnitOptions = {
	precision?: number
	showPlus?: boolean
}

export function formatSi(num: BigNumber, options?: FormatUnitOptions): string {
	const units = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

	// parse the value as a bigint
	try {
		// if the value is zero, return 0
		if (num.isZero()) return '0'

		// determine if the number is negative
		const isNegative = num.lt(0)
		if (isNegative) {
			num.mul(-1)
		}

		const exponent = Math.min(
			// @ts-ignore
			Math.floor(Math.log10(num.toString()) / 3),
			units.length - 1
		)
		// @ts-ignore
		const n = Number(num.toString() / 1000 ** exponent).toPrecision(
			options && options.precision ? options.precision : 3
		)

		if (isNegative) return `-${n}${units[exponent]}`
		return options && options.showPlus
			? `+${n}${units[exponent]}`
			: `${n}${units[exponent]}`
	} catch (Error) {
		return num.toString()
	}
}

function wholeBZZ(bzz: string) {
	while (bzz.length <= 16) {
		bzz = '0' + bzz
	}
	bzz = bzz.slice(0, bzz.length - 16) + '.' + bzz.slice(bzz.length - 16)
	while (bzz.slice(-1) == '0') {
		bzz = bzz.slice(0, -1)
	}
	if (bzz.slice(-1) == '.') bzz = bzz + '0'
	return bzz
}

export function shortCurrency(
	n: BigNumber,
	decimals = 18,
	symbol = 'TOK',
	options?: FormatUnitOptions
) {
	const ONE = BigNumber.from(10).pow(decimals)

	let negative, result
	if (n.lt(0)) {
		negative = true
		n = n.mul(-1)
	}

	const resultFmt = (precision: number) =>
		Number(utils.formatUnits(n, decimals)).toFixed(precision) + ' ' + symbol

	if (n.lt(ONE.div(100))) return formatSi(n, options)
	else if (n.gte(ONE.mul(100))) result = resultFmt(0)
	else if (n.gte(ONE.mul(10))) result = resultFmt(1)
	else if (n.gte(ONE)) result = resultFmt(2)
	else result = resultFmt(3)

	if (negative) result = '-' + result
	else if (options && options.showPlus) result = '+' + result
	return result
}

export function shortBZZ(n: BigNumber, options?: FormatUnitOptions) {
	return shortCurrency(n, 16, 'BZZ', options)
}

export function shortETH(n: BigNumber, options?: FormatUnitOptions) {
	return shortCurrency(n, 18, 'ETH', options)
}
