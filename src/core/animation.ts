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
		translateX: {
			from: width,
			to: 0,
			duration: duration,
			ease: 'linear',
		},
	}

	const slideout = {
		delay: SLIDE_DELAY,
		translateX: {
			from: 0,
			to: -width,
			duration: duration,
			ease: 'linear',
		},
	}

	// Set initial position off-screen
	title.style.transform = `translateX(${width}px)`
	slides.forEach(s => (s.style.transform = `translateX(${width}px)`))

	// Add animations to the timeline
	tl.label(label)
	tl.add(title, slidein, '<<')
	slides.forEach(s => {
		tl.add(s, slidein, '<<').add(s, slideout)
	})
	tl.add(title, slideout, '<<')
}
