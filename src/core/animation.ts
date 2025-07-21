import { Timeline } from 'animejs'
import { ANIMATION_SPEED, SLIDE_DELAY } from './constants'

/**
 * Appends a set of title and content slides to the main timeline.
 * @param tl The main timeline instance.
 * @param label The label for this section in the timeline.
 * @param title The title element for the section.
 * @param slides An array of slide elements to animate.
 */
export function appendSlides(tl: Timeline, label: string, title: HTMLElement, slides: HTMLElement[]) {
	const width = document.body.offsetWidth
	const duration = width / ANIMATION_SPEED

	const slidein = {
		translateX: [width, 0],
		duration: duration,
		ease: 'linear',
	}

	const slideout = {
		translateX: [0, -width],
		duration: duration,
		ease: 'linear',
		delay: SLIDE_DELAY,
	}

	const reset = {
		translateX: width,
		duration: 0,
		delay: 0,
	}

	// Set initial position off-screen
	title.style.transform = `translateX(${width}px)`
	slides.forEach(s => (s.style.transform = `translateX(${width}px)`))

	tl.label(label)

	// Use the simpler (but less type-strict) `add(target, params)` overload
	// which the original code used and passed compilation.

	// Title In
	tl.add(title, slidein, `-=${duration}`)

	// Slides In and Out
	slides.forEach(s => {
		tl.add(s, slidein, `-=${duration}`) // Align with title animation
		tl.add(s, slideout)
		tl.add(s, reset)
	})

	// Title Out
	tl.add(title, slideout, `-=${duration + SLIDE_DELAY}`) // Align with last slide's out animation
	tl.add(title, reset)
}
