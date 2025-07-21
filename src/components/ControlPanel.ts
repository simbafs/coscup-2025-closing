import { Timeline } from 'animejs'
import type { Label } from '../types'
import { getCurrentLabel } from '../core/utils'

/**
 * Sets up the control panel UI (pause/restart buttons, timeline label dropdown).
 * @param tl The main timeline instance.
 * @param labels The array of labels for the dropdown.
 */
export function setupControlPanel(tl: Timeline, labels: Label[]) {
	const pauseButton = document.querySelector('#pause')
	const restartButton = document.querySelector('#restart')
	const labelSelect = document.querySelector('#label') as HTMLSelectElement | null

	if (!pauseButton || !restartButton || !labelSelect) {
		console.warn('Control panel elements not found. UI controls will be disabled.')
		return
	}

	const pause = () => {
		if (tl.paused) {
			tl.play()
		} else {
			tl.pause()
		}
	}

	const restart = () => tl.restart()

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
	labels
		.filter(l => l.value in tl.labels)
		.forEach(l => {
			const option = document.createElement('option')
			option.value = l.value
			option.textContent = l.name
			labelSelect.appendChild(option)
		})

	// Handle dropdown changes
	labelSelect.addEventListener('change', e => {
		const tid = (e.target as HTMLSelectElement).value
		if (tid) {
			tl.seek(tl.labels[tid])
		}
	})

	// Update dropdown based on timeline progress
	const getCurrent = getCurrentLabel(tl)
	tl.onUpdate = () => {
		const currentLabel = getCurrent(tl.iterationCurrentTime)
		if (currentLabel !== labelSelect.value) {
			labelSelect.value = currentLabel
		}
	}
}
