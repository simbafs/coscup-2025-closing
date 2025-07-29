import type { Group, MemberWithChief, Slide } from '../types'
import { chunk } from '../core/utils'
import { createMemberElement } from './Member'

/**
 * Creates the title and slide elements for a group.
 * @param group The group object.
 * @param membersPerSlide The number of members to show per slide.
 * @returns An object containing the title element and an array of slide elements.
 */
export function createGroupSlides(group: Group, membersPerSlide: number): Slide {
	const title = document.createElement('h1')
	title.textContent = group.name

	const chiefs: Set<string> = new Set()
	group.chiefs.forEach(chief => {
		chiefs.add(chief.email_hash)
	})

	const membersList: MemberWithChief[] = [
		...group.chiefs.map(c => ({ member: c, isChief: true })),
		...group.members.filter(m => !chiefs.has(m.email_hash)).map(m => ({ member: m, isChief: false })),
	]

	const chunkedMembers = chunk(membersList, membersPerSlide || 1)

	const slides = chunkedMembers.map(c => {
		const slide = document.createElement('div')
		slide.classList.add('slide')
		c.forEach(({ member, isChief }) => {
			slide.appendChild(createMemberElement(member, isChief))
		})
		return slide
	})

	return {
		title,
		slides,
	}
}
