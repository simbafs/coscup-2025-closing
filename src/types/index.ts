// App-specific types
export type Member = {
	name: string
	email_hash: string
}

export type Group = {
	name: string
	tid: string
	chiefs: Member[]
	members: Member[]
}

export type MemberWithChief = {
	member: Member
	isChief: boolean
}

export type Sponsor = {
	id: string
	name: string
	image: string
}

export type Label = {
	name: string
	value: string
}
