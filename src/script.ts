import { createTimeline, engine } from 'animejs'
import type { Label, Sponsor } from './types'
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

/**
 * Main function to initialize the application.
 */
async function main() {
	// --- 1. Setup and Guards ---
	engine.pauseOnDocumentHidden = false

	const titleContainer = document.querySelector('#title')
	const membersContainer = document.querySelector('#members')

	if (!titleContainer || !membersContainer) {
		console.error('Required DOM containers #title or #members not found. Aborting.')
		return
	}

	const tl = createTimeline({
		loop: true,
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

	setupControlPanel(tl, labels)
}

// Run the application
main()
