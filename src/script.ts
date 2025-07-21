import { createTimeline, engine, Timeline } from 'animejs'
import type { Group, Label, Sponsor } from './types'
import { sponsorLevels, sponsorLevels_mapping } from './core/constants'
import { getNumberInGroup } from './core/utils'
import { appendSlides } from './core/animation'
import { createGroupSlides } from './components/Group'
import { createSponsorSlides } from './components/Sponsor'
import { setupControlPanel } from './components/ControlPanel'

// Import data
import groupData from './data.json'
import _sponsorData from './sponsor.json'

const sponsorData: Partial<Record<string, Sponsor[]>> = _sponsorData

// DOM Containers
const titleContainer = document.querySelector('#title')!
const membersContainer: HTMLDivElement = document.querySelector('#members')!

/**
 * Adds group slides to the timeline.
 */
function addGroupSlides(tl: Timeline, group: Group) {
	const membersPerSlide = getNumberInGroup()
	const { title, slides } = createGroupSlides(group, membersPerSlide)

	// Append elements to the DOM
	titleContainer.appendChild(title)
	slides.forEach(slide => membersContainer.appendChild(slide))

	// Add animations to the timeline
	appendSlides(tl, group.tid, title, slides)
}

/**
 * Adds sponsor slides to the timeline.
 */
function addSponsorSlides(tl: Timeline, level: string, sponsors: Sponsor[]) {
	const sponsorsPerSlide = getNumberInGroup()
	const result = createSponsorSlides(level, sponsors, sponsorsPerSlide)

	if (!result) {
		return
	}

	const { title, slides } = result

	// Append elements to the DOM
	titleContainer.appendChild(title)
	slides.forEach(slide => membersContainer.appendChild(slide))

	// Add animations to the timeline
	appendSlides(tl, level, title, slides)
}

/**
 * Main function to initialize the application.
 */
async function main() {
	engine.pauseOnDocumentHidden = false

	const tl = createTimeline({
		loop: true,
	})

	// Add all group and sponsor slides to the timeline
	for (const group of groupData.data) {
		addGroupSlides(tl, group)
	}

	for (const level of sponsorLevels) {
		addSponsorSlides(tl, level, sponsorData[level] || [])
	}

	// Prepare labels for the control panel
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

	// Setup UI controls
	setupControlPanel(tl, labels)
}

// Run the application
main()