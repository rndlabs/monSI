import { BigNumber } from 'ethers'
import { formatSi, FormatUnitOptions } from './formatUnits'

export function colorValue(
	value: BigNumber,
	fmtCallback: (n: BigNumber, options?: FormatUnitOptions) => string,
	options?: FormatUnitOptions
): string {
	if (!fmtCallback) fmtCallback = formatSi
	if (value.lt(0)) {
		return '{red-fg}' + fmtCallback(value, options) + '{/red-fg}'
	} else if (value.gte(0)) {
		return '{green-fg}' + fmtCallback(value, options) + '{/green-fg}'
	} else {
		return '{white-fg}+' + fmtCallback(value, options) + '{/white-fg}'
	}
}

export function colorSpecificDelta(
	previousValue: BigNumber,
	value: BigNumber,
	fmtRtn: (n: BigNumber, options?: FormatUnitOptions) => string,
	options?: FormatUnitOptions
): string {
	const delta = value.sub(previousValue)
	if (!delta.eq(0)) {
		return ' (' + colorValue(delta, fmtRtn, options) + ')'
	}
	return ''
}

const lastValues: { [key: string]: BigNumber } = {}

const clearDelta = (name: string) => {
	delete lastValues[name]
}

const isValueChanged = (name: string, value: BigNumber): boolean => {
	const lastValue = lastValues[name]
	if (lastValue === undefined) {
		return true
	}
	return !BigNumber.from(value).eq(lastValue)
}

export function colorDelta(
	name: string,
	value: BigNumber,
	fmtRtn: (n: BigNumber, options?: FormatUnitOptions) => string,
	options?: FormatUnitOptions
): string {
	const lastValue = lastValues[name]
	if (lastValue === undefined) {
		lastValues[name] = value
		return ''
	}

	const delta = value.sub(lastValue)
	if (!delta.eq(0)) {
		return ' (' + colorValue(delta, fmtRtn, options) + ')'
	}
	return ''
}
