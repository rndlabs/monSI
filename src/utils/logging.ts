import { currentLocalTime, specificLocalTime } from '../lib/formatDate'
import Ui, { BOXES } from '../types/entities/ui'

export default class Logging {
	private static instance: Logging
	private _errorLogEnabled: boolean = false
	private _lastErrorTag: string = ''

	private constructor() {}

	public static getInstance(): Logging {
		if (!Logging.instance) {
			Logging.instance = new Logging()
		}
		return Logging.instance
	}

	public static showError(
		err: string,
		tag: string | undefined = undefined,
		time: number = Date.now()
	): void {
		Logging.getInstance().showError(err, tag, time)
	}

	public static showLog(log: string | object): void {
		Logging.getInstance().showLog(log)
	}

	public static showLogError(err: string | object): void {
		Logging.getInstance().showLogError(err)
	}

	private showError(
		err: string | object,
		tag: string | undefined = undefined,
		when?: number
	): void {
		const msg = this._stringifyError(err)

		if (!when) when = Date.now()

		if (this._errorLogEnabled) {
			console.error(
				`${specificLocalTime(when)} ${tag ? `[${tag}]` : ''} ${msg}`
			)
		}

		this._lastErrorTag = tag || ''

		// output to the output box
		Ui.getInstance().linePusherCallback(BOXES.OUTPUT)(msg, when)
	}

	private showLog(log: string | object): void {
		const msg = this._stringifyError(log)

		if (this._errorLogEnabled) {
			console.error(`${currentLocalTime()} ${msg}`)
		}
	}

	private showLogError(err: string | object): void {
		if (this._errorLogEnabled) this.showLog(err)
		this.showError(err)
	}

	/**
	 * Handle any abstract object that is thrown at the logging class.
	 * @param err Any error that needs to be printed
	 * @returns A string for the error to be printed
	 */
	private _stringifyError(err: any): string {
		if (typeof err != 'string') {
			err = JSON.stringify(err, undefined, 2)
		}
		return err
	}
}
