import blessed, { Widgets } from 'blessed'
import { getRpcUrl } from '../../config'
import { currentLocalTime, specificLocalTime } from '../../lib/formatDate'

/**
 * A singleton class for managing the user interface
 */

export enum BOXES {
	ALL_PLAYERS = 0,
	ROUNDS = 1,
	ROUND_PLAYERS = 2,
	BLOCKS = 3,
	OUTPUT = 4,
}

export default class Ui {
	private static instance: Ui

	private _screen: Widgets.Screen
	private _boxes: Widgets.BoxElement[] = []
	private _focusBox: number = -1

	/**
	 * Make the constructor private so that it can't be called.
	 */
	private constructor() {
		this._screen = blessed.screen({
			smartCSR: true,
			dockBorders: true,
		})
		this._screen.title = 'monSI'

		// --- key handlers

		// Quit on Escape, q, or Control-C.
		this._screen.key(['escape', 'q', 'C-c'], (ch, key) => {
			return process.exit(0)
		})

		// Change box focus on tab
		this._screen.key(['tab', 'S-tab'], (ch, key) => {
			this._boxes[this._focusBox].style.border.fg = 'white'
			if (key.shift) {
				this._focusBox =
					(this._focusBox - 1 + this._boxes.length) % this._boxes.length
			} else {
				this._focusBox = (this._focusBox + 1) % this._boxes.length
			}
			this._boxes[this._focusBox].style.border.fg = 'green'

			this._screen.render()
		})

		// --- create boxes
		this._createBox('All Players', true, {
			top: 0,
			left: '75%',
			width: '25%',
			height: '100%',

			content: '\n{center}' + getRpcUrl() + '{/center}',
			scrollable: true,
			tags: true,
		})

		this._createBox('Rounds', true, {
			top: 0,
			left: '40%',
			width: '35%',
			height: '75%',

			content: '',
			scrollable: true,
			tags: true,
		})

		this._createBox('Round Players', true, {
			top: 0,
			left: 0,
			width: '40%',
			height: '75%',

			content: '',
			scrollable: false,
			tags: true,
		})

		// blocks box
		this._createBox(undefined, false, {
			top: '75%',
			left: '55%',
			width: '20%',
			height: '100%',
			content: 'hh:mm:ss bbbbbbb nns mmmms',
			scrollable: true,
			tags: true,
		})

		// output box
		this._createBox(undefined, false, {
			top: '75%',
			left: 0,
			width: '55%', // blocksBox ? '55%' : '75%',
			height: '100%',
			content:
				'{left}error and trace\noutput will appear here\nand scroll down{/left}',
			scrollable: true,
			tags: true,
		})

		// --- focus first box
		this._focusBox = 0
		this._boxes[this._focusBox].style.border.fg = 'green'
		this._screen.render()
	}

	// --- box creator helper
	private _createBox(
		title?: string,
		_border: boolean = true,
		options?: Widgets.BoxOptions
	): Widgets.BoxElement {
		const box = blessed.box({
			title: title,
			label: title,
			style: {
				...style,
			},
			border: _border ? border : undefined,
			mouse: true,
			...options,
		})

		// on click focus
		box.on('click', () => {
			// focus the box
			box.focus()

			this._boxes[this._focusBox].style.border.fg = 'white'
			this._focusBox = this._boxes.indexOf(box)
			this._boxes[this._focusBox].style.border.fg = 'green'
			this._screen.render()
		})

		this._boxes.push(box)
		this._screen.append(box)
		return box
	}

	// --- singleton method

	/**
	 * Get the singleton instance of the Ui class.
	 * @returns the singleton instance of the Ui class
	 */
	public static getInstance(): Ui {
		if (!Ui.instance) {
			Ui.instance = new Ui()
		}

		return Ui.instance
	}

	// --- public methods
	public lineSetterCallback(
		box: BOXES
	): (idx: number, text: string, when?: number) => void {
		return (idx: number, text: string, when?: number) => {
			this._boxes[box].setLine(idx, Ui.genText(text, when))
			// render the changes
			this._screen.render()
		}
	}

	public lineInserterCallback(
		box: BOXES
	): (idx: number, text: string, when?: number) => void {
		return (idx: number, text: string, when?: number) => {
			this._boxes[box].insertLine(idx, Ui.genText(text, when))
			// render the changes
			this._screen.render()
		}
	}

	public boxSetterCallback(box: BOXES): (text: string) => void {
		return (text: string) => {
			this._boxes[box].setContent(text)
			// render the changes
			this._screen.render()
		}
	}

	public boxLabelSetterCallback(box: BOXES): (text: string) => void {
		return (text: string) => {
			this._boxes[box].options.title = text
			this._boxes[box].options.label = text
		}
	}

	linePusherCallback(box: BOXES): (text: string, when?: number) => void {
		return (text: string, when?: number) => {
			this._boxes[box].pushLine(Ui.genText(text, when))
			// render the changes
			this._screen.render()
		}
	}

	updatePlayer(line: number, text: string, when: number) {
		this._boxes[BOXES.ALL_PLAYERS].setLine(line, Ui.genText(text, when))
	}

	private static genText(text: string, when?: number): string {
		if (when === undefined) return currentLocalTime() + ` ${text}`
		else if (when > 0) return specificLocalTime(when) + ` ${text}`
		else return text
	}
}

// --- styles
const style = {
	fg: 'brightwhite',
	bg: 'black', // Was magenta
	border: {
		fg: '#f0f0f0',
	},
	// hover: {
	// 	bg: 'green',
	// },
}

const border: Widgets.Border | 'line' | 'bg' | undefined = {
	type: 'line',
}
