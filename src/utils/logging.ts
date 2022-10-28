import { currentLocalTime, specificLocalTime } from '../lib'
import { Ui, BOXES } from '../types/entities'

export default class Logging {
	private static instance: Logging
	private _debugging: boolean = false // Controls all showError logging to stderr (extensive)
	private _errorLogEnabled: boolean = false // Controls showLog* logging to stderr (less stuff)
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

		if (this._debugging) {
			console.error(`${specificLocalTime(when)} ${tag ? `[${tag}]` : ''}${msg}`)
		}

		// output to the output box
		if (this._lastErrorTag != tag)
			Ui.getInstance().insertTopCallback(BOXES.OUTPUT)(msg, when) // Scroll down
		else Ui.getInstance().lineSetterCallback(BOXES.OUTPUT)(0, msg, when) // Replace top line

		this._lastErrorTag = tag || ''
	}

	private showLog(log: string | object): void {
		const msg = this._stringifyError(log)

		if (this._errorLogEnabled) {
			console.error(`${currentLocalTime()} ${msg}`)
		}
	}

	private showLogError(err: string | object): void {
		if (!this._debugging) this.showLog(err)
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
