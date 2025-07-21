export const sponsorLevels = [
	'titanium',
	'gold',
	'silver',
	'bronze',
	'friend',
	'over-seas',
	'co-promotion-partner',
	'co-host',
	'co-organizer',
	'special-thanks',
]

export const sponsorLevels_mapping: Record<string, string> = {
	titanium: '鈦金級贊助',
	gold: '黃金級贊助',
	silver: '白銀級贊助',
	bronze: '青銅級贊助',
	friend: '好朋友級贊助',
	'over-seas': '海外講者旅遊補助',
	'co-promotion-partner': '共同推廣夥伴',
	'co-host': '共同主辦單位',
	'co-organizer': '協辦單位',
	'special-thanks': '特別感謝',
}

// Animation and Layout Constants
export const PAGE_WIDTH_OFFSET = 500 // px, right-side padding for calculating number of items
export const MEMBER_ELEMENT_WIDTH = 150 // px, width of a single member/sponsor element
export const ANIMATION_SPEED = 0.6 // px/ms, speed of the slide animation
export const SLIDE_DELAY = 1000 // ms, delay before a slide animates out
