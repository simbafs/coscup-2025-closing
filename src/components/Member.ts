import type { Member } from '../types'

/**
 * Creates a DOM element for a single member.
 * @param member The member object.
 * @param isChief Whether the member is a chief.
 * @returns An HTMLDivElement representing the member.
 */
export function createMemberElement(member: Member, isChief: boolean = false): HTMLDivElement {
	const m = document.createElement('div')
	m.classList.add('member')

	const avatar = document.createElement('img')
	avatar.src = `https://www.gravatar.com/avatar/${member.email_hash}?s=120&d=identicon&r=g&d=https://volunteer.coscup.org/img/nonavatar.png`
	avatar.alt = member.name
	avatar.height = 120
	avatar.width = 120

	const title = document.createElement('h3')
	title.textContent = isChief ? '組長' : '　'

	const name = document.createElement('h2')
	name.textContent = member.name

	m.appendChild(avatar)
	m.appendChild(title)
	m.appendChild(name)

	return m
}
