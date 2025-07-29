import type { Label } from '../types'
import { currentTL, pushNext } from '../core/animation'

type Callback = (label: string) => void

class ControlPanelClass {
	private pauseButton: HTMLElement
	private restartButton: HTMLElement
	private labelSelect: HTMLSelectElement
	private handleLabelChange?: Callback

	constructor(pauseButton: HTMLElement, restartButton: HTMLElement, labelSelect: HTMLSelectElement, labels: Label[]) {
		this.pauseButton = pauseButton
		this.restartButton = restartButton
		this.labelSelect = labelSelect

		this.setupEventListeners()
		this.populateLabels(labels)
	}

	private setupEventListeners() {
		this.pauseButton.addEventListener('click', this.pause)
		this.restartButton.addEventListener('click', this.restart)
		this.labelSelect.addEventListener('change', this.handleSelectChange)
		document.addEventListener('keydown', this.handleKeyDown)
	}

	private populateLabels(labels: Label[]) {
		labels.forEach(l => {
			const option = document.createElement('option')
			option.value = l.value
			option.textContent = l.name
			this.labelSelect.appendChild(option)
		})
	}

	private handleSelectChange = (e: Event) => {
		const tid = (e.target as HTMLSelectElement).value
		if (tid) {
			this.jump({ value: tid })
		}
	}

	private handleKeyDown = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'Space':
				e.preventDefault()
				this.pause()
				break
			case 'KeyR':
				this.restart()
				break
		}
	}

	public pause = () => {
		if (currentTL?.paused) {
			currentTL?.play()
		} else {
			currentTL?.pause()
		}
	}

	public restart = () => currentTL?.restart()

	public jump = ({ value = '' } = {}) => {
		console.log(`jump to ${value}`)
		pushNext(value)
	}

	public onLabelChange = (callback: Callback) => {
		this.handleLabelChange = callback
	}

	public onBegin = (label: string) => {
		console.log(`Timeline started at label: ${label}`)
		this.labelSelect.value = label
		this.handleLabelChange?.(label)
	}
}

const noOp = () => {}

const dummyControlPanel = {
	pause: noOp,
	restart: noOp,
	jump: noOp,
	onLabelChange: noOp,
	onBegin: noOp,
}

export type ControlPanel = ControlPanelClass | typeof dummyControlPanel

export function setupControlPanel(labels: Label[]): ControlPanel {
	const pauseButton = document.querySelector('#pause')
	const restartButton = document.querySelector('#restart')
	const labelSelect = document.querySelector('#label') as HTMLSelectElement | null

	if (!pauseButton || !restartButton || !labelSelect) {
		console.warn('Control panel elements not found. UI controls will be disabled.')
		return dummyControlPanel
	}

	return new ControlPanelClass(pauseButton as HTMLElement, restartButton as HTMLElement, labelSelect, labels)
}
