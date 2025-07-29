import { engine, Timeline } from 'animejs'
import type { Label, Sponsor, Group as GroupType } from './types'
import { sponsorLevels, sponsorLevels_mapping } from './core/constants'
import { getNumberInGroup } from './core/utils'
import { appendSlides, onNextChange } from './core/animation'
import { createGroupSlides } from './components/Group'
import { createSponsorSlides } from './components/Sponsor'
import { setupControlPanel, type ControlPanel } from './components/ControlPanel'
import { Display } from 'controly'

// Import data
import groupData from './member.json'
import _sponsorData from './sponsor.json'

const sponsorData: Partial<Record<string, Sponsor[]>> = _sponsorData

const $ = document.querySelector.bind(document)

const serverURL = import.meta.env.PROD ? 'wss://controly.1li.tw/ws' : 'ws://localhost:8080/ws'

type SlideData = {
	id: string
	data: GroupType | Sponsor[]
	type: 'group' | 'sponsor'
}

function setupDOM() {
	engine.pauseOnDocumentHidden = false
	const titleContainer = $('#title')
	const membersContainer = $('#members')

	if (!titleContainer || !membersContainer) {
		throw new Error('Required DOM containers #title or #members not found. Aborting.')
	}
	return { titleContainer, membersContainer }
}

function generateSlides(
	slidesData: SlideData[],
	membersPerSlide: number,
	titleContainer: Element,
	membersContainer: Element,
	controlPanel: ControlPanel,
) {
	const allSlideLabels = slidesData.map(s => s.id)
	let firstSlide: Timeline | null = null

	for (const slideInfo of slidesData) {
		const s =
			slideInfo.type === 'group'
				? createGroupSlides(slideInfo.data as GroupType, membersPerSlide)
				: createSponsorSlides(slideInfo.id, slideInfo.data as Sponsor[], membersPerSlide)

		if (!s) continue

		titleContainer.appendChild(s.title)
		s.slides.forEach(slide => membersContainer.appendChild(slide))

		const currentIndex = allSlideLabels.indexOf(slideInfo.id)
		const nextLabel = allSlideLabels[(currentIndex + 1) % allSlideLabels.length]
		const tl = appendSlides(slideInfo.id, nextLabel, s, controlPanel.onBegin)

		if (!firstSlide) {
			firstSlide = tl
		}
		tl.pause()
	}

	return firstSlide
}

function setupRemoteControl(controlPanel: ControlPanel, labelMap: Record<string, string>, id?: string) {
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

	display.command('pause', controlPanel.pause)
	display.command('restart', controlPanel.restart)
	display.command('next', controlPanel.jump)

	const status = {
		current: '',
		next: '',
	}

	controlPanel.onLabelChange(label => {
		status.current = labelMap[label] || label
		display.updateStatus(status)
	})

	onNextChange(nextList => {
		status.next = nextList.map(l => labelMap[l] || l).join('、')
		display.updateStatus(status)
	})

	display.connect()
}

/**
 * Main function to initialize the application.
 */
function main() {
	try {
		const { titleContainer, membersContainer } = setupDOM()
		const membersPerSlide = getNumberInGroup()

		const groupLabels: Label[] = groupData.data.map(g => ({ name: g.name, value: g.tid }))
		const sponsorLabels: Label[] = Object.entries(sponsorLevels_mapping).map(([value, name]) => ({
			name,
			value,
		}))
		const allLabels = [...groupLabels, ...sponsorLabels]
		const labelMap = Object.fromEntries(allLabels.map(l => [l.value, l.name]))

		const controlPanel = setupControlPanel(allLabels)

		const slidesData: SlideData[] = [
			...groupData.data.map(g => ({ id: g.tid, data: g, type: 'group' as const })),
			...sponsorLevels
				.filter(level => sponsorData[level] && sponsorData[level]!.length > 0)
				.map(level => ({ id: level, data: sponsorData[level]!, type: 'sponsor' as const })),
		]

		const firstSlide = generateSlides(slidesData, membersPerSlide, titleContainer, membersContainer, controlPanel)

		firstSlide?.play()

		const param = new URLSearchParams(window.location.search)
		setupRemoteControl(controlPanel, labelMap, param.get('id') || undefined)
	} catch (error) {
		console.error(error)
		const $id = $('#id')
		if ($id) $id.innerHTML = `無法載入應用程式`
	}
}

// Run the application
main()
