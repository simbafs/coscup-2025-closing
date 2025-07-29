import type { Label } from '../types'
import { currentTL, pushNext } from '../core/animation'

/**
 * Sets up the control panel UI (pause/restart buttons, timeline label dropdown).
 * @param tl The main timeline instance.
 * @param labels The array of labels for the dropdown.
 */
export function setupControlPanel(labels: Label[]) {
	const pauseButton = document.querySelector('#pause')
	const restartButton = document.querySelector('#restart')
	const labelSelect = document.querySelector('#label') as HTMLSelectElement | null

	if (!pauseButton || !restartButton || !labelSelect) {
		console.warn('Control panel elements not found. UI controls will be disabled.')
		const noFunc = () => {}
		return {
			pause: noFunc,
			restart: noFunc,
			jump: noFunc,
			onLabelChange: noFunc,
			onBegin: noFunc,
		}
	}

	const pause = () => {
		if (currentTL?.paused) {
			currentTL?.play()
		} else {
			currentTL?.pause()
		}
	}

	const restart = () => currentTL?.restart()

	const jump = ({ value = '' } = {}) => {
		console.log(`jump to ${value}`)
		pushNext(value)
	}

	pauseButton.addEventListener('click', pause)
	restartButton.addEventListener('click', restart)

	document.addEventListener('keydown', e => {
		switch (e.code) {
			case 'Space': // Note: e.code for space is 'Space'
				e.preventDefault()
				pause()
				break
			case 'KeyR':
				restart()
				break
		}
	})

	// Populate the label dropdown
	labels.forEach(l => {
		const option = document.createElement('option')
		option.value = l.value
		option.textContent = l.name
		labelSelect.appendChild(option)
	})

	// Handle dropdown changes
	labelSelect.addEventListener('change', e => {
		const tid = (e.target as HTMLSelectElement).value
		if (tid) {
			jump({ value: tid })
		}
	})

	let handleLabelChange: (label: string) => void

	const onLabelChange = (callback: (label: string) => void) => {
		handleLabelChange = callback
	}

	const onBegin = (label: string) => {
		// TODO:
		console.log(`Timeline started at label: ${label}`)
		labelSelect.value = label
		handleLabelChange?.(label)
	}

	return {
		pause,
		restart,
		jump,
		onLabelChange,
		onBegin,
	}
}
