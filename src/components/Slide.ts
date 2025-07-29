import { chunk } from '../core/utils'

/**
 * Creates an array of slide elements from a list of items.
 * @param items The array of items to display.
 * @param itemsPerSlide The number of items to show per slide.
 * @param createElement A function that creates an HTMLElement for a single item.
 * @returns An array of HTMLDivElement, where each element is a slide.
 */
export function createSlides<T>(
	items: T[],
	itemsPerSlide: number,
	createElement: (item: T) => HTMLElement,
): HTMLDivElement[] {
	const chunkedItems = chunk(items, itemsPerSlide || 1)
	const slides = chunkedItems.map(chunk => {
		const slide = document.createElement('div')
		slide.classList.add('slide')
		chunk.forEach(item => {
			slide.appendChild(createElement(item))
		})
		return slide
	})
	return slides
}
