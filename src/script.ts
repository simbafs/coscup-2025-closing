import { engine, Timeline } from 'animejs'
import type { Label, Sponsor } from './types'
import { sponsorLevels, sponsorLevels_mapping } from './core/constants'
import { getNumberInGroup } from './core/utils'
import { appendSlides, onNextChange } from './core/animation'
import { createGroupSlides } from './components/Group'
import { createSponsorSlides } from './components/Sponsor'
import { setupControlPanel } from './components/ControlPanel'
import { Display } from 'controly'

// Import data
import groupData from './member.json'
import _sponsorData from './sponsor.json'

const sponsorData: Partial<Record<string, Sponsor[]>> = _sponsorData

const $ = document.querySelector.bind(document)

const serverURL = import.meta.env.RPDO ? 'wss://controly.1li.tw/ws' : 'ws://localhost:8080/ws'

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

	// --- 2. Slide Generation and DOM Population ---
	const membersPerSlide = getNumberInGroup()

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

	const labelMap = Object.fromEntries(labels.map(l => [l.value, l.name]))

	const allSlideLabels = labels.map(l => l.value)

	let firstSlide: Timeline | null = null

	// --- 3. UI Controls ---
	const cmd = setupControlPanel(labels)

	// Process and append group slides
	for (const group of groupData.data) {
		const s = createGroupSlides(group, membersPerSlide)
		titleContainer.appendChild(s.title)
		s.slides.forEach(slide => membersContainer.appendChild(slide))
		const currentIndex = allSlideLabels.indexOf(group.tid)
		const nextLabel = allSlideLabels[(currentIndex + 1) % allSlideLabels.length]
		const tl = appendSlides(group.tid, nextLabel, s, cmd.onBegin)
		if (!firstSlide) {
			firstSlide = tl // Store the first slide timeline
		}
		tl.pause()
	}

	// Process and append sponsor slides
	for (const level of sponsorLevels) {
		if (!sponsorData[level] || sponsorData[level].length === 0) {
			continue // Skip levels with no sponsors
		}
		const s = createSponsorSlides(level, sponsorData[level], membersPerSlide)
		if (s) {
			titleContainer.appendChild(s.title)
			s.slides.forEach(slide => membersContainer.appendChild(slide))
			const currentIndex = allSlideLabels.indexOf(level)
			const nextLabel = allSlideLabels[(currentIndex + 1) % allSlideLabels.length]
			const tl = appendSlides(level, nextLabel, s, cmd.onBegin)
			tl.pause()
		}
	}

	firstSlide?.play()

	if (!cmd) {
		const $id = $('#id')
		if ($id) $id.innerHTML = `無法載入控制面板`
	} else {
		const param = new URLSearchParams(window.location.search)
		const id = param.get('id') || undefined
		console.log('id', id)
		const display = new Display({
			serverUrl: serverURL,
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
		display.command('next', cmd.jump)

		const status = {
			current: '',
			next: '',
		}

		cmd.onLabelChange(label => {
			status.current = labelMap[label] || label
			display.updateStatus(status)
		})

		onNextChange(nextList => {
			status.next = nextList.map(l => labelMap[l] || l).join('、')
			display.updateStatus(status)
		})

		display.connect()
	}
}

// Run the application
main()
