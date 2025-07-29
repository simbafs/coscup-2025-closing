import { createTimeline, Timeline } from 'animejs'
import { ANIMATION_SPEED, SLIDE_DELAY } from './constants'
import type { Slide } from '../types'

const timelines = new Map<string, Timeline>()

let handleNextChange: (nextList: string[]) => void = () => {}

export function onNextChange(callback: (nextList: string[]) => void) {
	handleNextChange = callback
}

const nextList: string[] = []

export function pushNext(label: string) {
	nextList.push(label)
	handleNextChange?.(nextList)
}

export function getNext(): string | undefined {
	const next = nextList.shift()
	handleNextChange?.(nextList)
	return next
}

export let currentTL: Timeline | null

/**
 * Appends a set of title and content slides to the main timeline.
 * @param tl The main timeline instance.
 * @param label The label for this section in the timeline.
 * @param title The title element for the section.
 * @param slides An array of slide elements to animate.
 */
export function appendSlides(label: string, next: string, s: Slide, onBegin: (label: string) => void): Timeline {
	const width = document.body.offsetWidth
	const duration = width / ANIMATION_SPEED

	const tl = createTimeline()
	tl.pause()

	tl.onBegin = () => {
		currentTL = tl
		onBegin(label)
	}

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
	s.title.style.transform = `translateX(${width}px)`
	s.slides.forEach(s => (s.style.transform = `translateX(${width}px)`))

	// Use the simpler (but less type-strict) `add(target, params)` overload
	// which the original code used and passed compilation.

	// Title In
	tl.add(s.title, slidein)

	// Slides In and Out
	s.slides.forEach(s => {
		tl.add(s, slidein, `-=${duration}`) // Align with title animation
		tl.add(s, slideout)
		tl.add(s, reset)
	})

	tl.call(() => {
		const nextSlide = timelines.get(getNext() || next)
		if (nextSlide) {
			nextSlide.restart()
		}
	}, `-=${duration}`)

	// Title Out
	tl.add(s.title, slideout, `-=${duration + SLIDE_DELAY}`) // Align with last slide's out animation
	tl.add(s.title, reset)

	timelines.set(label, tl)

	return tl
}
