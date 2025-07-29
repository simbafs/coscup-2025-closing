import type { Sponsor, Slide } from '../types'
import { chunk } from '../core/utils'
import { sponsorLevels_mapping } from '../core/constants'

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

	const slides = chunk(sponsors, sponsorsPerSlide).map(s => {
		const slide = document.createElement('div')
		slide.classList.add('slide')

		s.forEach(sponsor => {
			const sDiv = document.createElement('div')
			sDiv.classList.add('sponsor')

			const img = document.createElement('img')
			img.src = sponsor.image
			img.alt = sponsor.name

			const name = document.createElement('h2')
			name.textContent = sponsor.name

			sDiv.appendChild(img)
			sDiv.appendChild(name)

			slide.appendChild(sDiv)
		})

		return slide
	})

	return {
		title,
		slides,
	}
}
