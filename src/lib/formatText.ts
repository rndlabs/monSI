import config from '../config'
import { SchellingGame } from '../types/entities/schelling'

/**
 * Library for short formatting of text.
 */

// TODO: dry code

export function shortId(id: string, n: number) {
	if (typeof id != 'string') return id
	if (id.substring(0, 2) == '0x') id = id.substring(2)
	if (id.length <= n * 2) return id
	return id.substring(0, n) + '..' + id.substring(id.length - n)
}

export function leftId(id: string, n: number) {
	if (typeof id != 'string') return id
	if (id.substring(0, 2) == '0x') id = id.substring(2)
	if (id.length <= n) return id
	return id.substring(0, n - 3) + '...'
}

export function fmtAccount(acct: string, n = 12): string {
	acct = acct.toLowerCase()
	if (acct == config.contracts.redistribution) return 'Redistribution'
	if (acct == config.contracts.stakeRegistry) return 'StakeRegistry'
	if (acct == config.contracts.bzzToken) return 'gBZZToken'
	if (acct == config.contracts.postageStamp) return 'PostageStamp'

	let r = leftId(acct, n)
	if (SchellingGame.getInstance().isMyAccount(acct))
		r = '{yellow-fg}' + r + '{/yellow-fg}'
	return r
}

export function fmtOverlay(o: string, n = 12): string {
	let r = leftId(o, n)
	if (SchellingGame.getInstance().isMyOverlay(o))
		r = '{yellow-fg}' + r + '{/yellow-fg}'
	return r
}
