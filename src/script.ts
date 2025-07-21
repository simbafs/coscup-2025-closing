import { createTimeline, engine } from 'animejs'
import type { Label, Sponsor } from './types'
import { sponsorLevels, sponsorLevels_mapping, ANIMATION_SPEED } from './core/constants'
import { getNumberInGroup } from './core/utils'
import { appendSlides } from './core/animation'
import { createGroupSlides } from './components/Group'
import { createSponsorSlides } from './components/Sponsor'
import { setupControlPanel } from './components/ControlPanel'
import { Display } from 'controly'

// Import data
import groupData from './data.json'
import _sponsorData from './sponsor.json'

const sponsorData: Partial<Record<string, Sponsor[]>> = _sponsorData

const $ = document.querySelector.bind(document)

/**
 * Main function to initialize the application.
 */
async function main() {
	// --- 1. Setup and Guards ---
	engine.pauseOnDocumentHidden = false

	const titleContainer = $('#title')
	const membersContainer = $('#members')

	if (!titleContainer || !membersContainer) {
		console.error('Required DOM containers #title or #members not found. Aborting.')
		return
	}

	const tl = createTimeline({
		loop: true,
	})

	// Add an initial delay equal to one slide duration
	const initialDelay = document.body.offsetWidth / ANIMATION_SPEED
	tl.add({
		duration: initialDelay,
	})

	// --- 2. Slide Generation and DOM Population ---
	const membersPerSlide = getNumberInGroup()

	// Process and append group slides
	for (const group of groupData.data) {
		const { title, slides } = createGroupSlides(group, membersPerSlide)
		titleContainer.appendChild(title)
		slides.forEach(slide => membersContainer.appendChild(slide))
		appendSlides(tl, group.tid, title, slides)
	}

	// Process and append sponsor slides
	for (const level of sponsorLevels) {
		const result = createSponsorSlides(level, sponsorData[level] || [], membersPerSlide)
		if (result) {
			const { title, slides } = result
			titleContainer.appendChild(title)
			slides.forEach(slide => membersContainer.appendChild(slide))
			appendSlides(tl, level, title, slides)
		}
	}

	// --- 3. UI Controls ---
	const labels: Label[] = [
		...groupData.data.map(g => ({
			name: g.name,
			value: g.tid,
		})),
		...Object.entries(sponsorLevels_mapping).map(([value, name]) => ({
			name,
			value,
		})),
	]

	const cmd = setupControlPanel(tl, labels)

	if (!cmd) {
		const $id = $('#id')
		if ($id) $id.innerHTML = `無法載入控制面板`
	} else {
		const param = new URLSearchParams(window.location.search)
		const id = param.get('id') || undefined
		console.log('id', id)
		const display = new Display({
			serverUrl: 'wss://controly.1li.tw/ws',
			commandUrl: `${window.location.origin}${window.location.pathname}/command.json`,
			id,
		})

		display.on('open', id => {
			const $id = $('#id')
			if ($id) {
				$id.textContent = id
			}
		})

		display.command('pause', cmd.pause)
		display.command('restart', cmd.restart)
		display.command('jump', cmd.jump)

		cmd.onLabelChange(label => {
			display.updateStatus({
				current: label,
			})
		})

		display.connect()
	}
}

// Run the application
main()
