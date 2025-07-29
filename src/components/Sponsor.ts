import type { Sponsor, Slide } from '../types'
import { sponsorLevels_mapping } from '../core/constants'
import { createSlides } from './Slide'

/**
 * Creates a DOM element for a single sponsor.
 * @param sponsor The sponsor object.
 * @returns An HTMLDivElement representing the sponsor.
 */
export function createSponsorElement(sponsor: Sponsor): HTMLDivElement {
	const sDiv = document.createElement('div')
	sDiv.classList.add('sponsor')

	const img = document.createElement('img')
	img.src = sponsor.image
	img.alt = sponsor.name

	const name = document.createElement('h2')
	name.textContent = sponsor.name

	sDiv.appendChild(img)
	sDiv.appendChild(name)

	return sDiv
}

/**
 * Creates the title and slide elements for a sponsor level.
 * @param level The sponsor level (e.g., 'gold').
 * @param sponsors The array of sponsors for that level.
 * @param sponsorsPerSlide The number of sponsors to show per slide.
 * @returns An object containing the title element and an array of slide elements.
 */
export function createSponsorSlides(level: string, sponsors: Sponsor[], sponsorsPerSlide: number): Slide {
	const title = document.createElement('h1')
	title.textContent = sponsorLevels_mapping[level] || level

	const slides = createSlides(sponsors, sponsorsPerSlide, createSponsorElement)

	return {
		title,
		slides,
	}
}
