// some code copy from https://github.com/COSCUP/2025/blob/main/loaders/sponsor.data.ts

import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'

export interface Sponsor {
	id: string
	image: string
	'name:zh-TW': string
	'name:en': string
	'intro:zh-TW': string
	'intro:en': string
	link: string
	level: string
	canPublish: 'Y' | 'N'
}

// 轉換 Google Drive 圖片 URL
async function getDriveImageBase64(shareUrl: string): Promise<string> {
	if (!shareUrl) {
		return ''
	}

	const fileIdMatch = shareUrl.match(/(?:\/d\/|id=)([^/?]+)/)
	const fileId = fileIdMatch ? fileIdMatch[1] : null
	if (!fileId) return ''
	const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
	// console.log(directUrl)
	const response = await fetch(directUrl).catch(err => {
		console.error(`failed to fetch ${directUrl}: ${err}`)
	})
	if (!response) {
		return ''
	}

	if (!response.ok) {
		throw new Error(`Failed to fetch image from Google Drive: ${response.statusText}`)
	}

	const arrayBuffer = await response.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	return `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${buffer.toString('base64')}`
}

async function getSponsers(filename: string) {
	if (!filename) {
		throw new Error('Filename is required to fetch sponsors.')
	}
	try {
		fs.stat(filename)
	} catch (e) {
		throw new Error(`file not found: ${e}`)
	}

	const content = await fs.readFile(filename, 'utf-8')
	const records: Sponsor[] = parse(content, {
		columns: true,
	})

	return records.filter(s => s.canPublish === 'Y')
}

async function downloadImages(sponsers: Sponsor[]): Promise<Record<string, string>> {
	return Promise.all(sponsers.map(s => getDriveImageBase64(s.image)))
		.then(images => images.map((image, index) => [sponsers[index].id, image]))
		.then(Object.fromEntries)
}

async function main() {
	const filename = process.argv[2]
	if (!filename) {
		console.error('Usage: node script/sponsor.js <filename>')
		process.exit(1)
	}

	const sponsors = await getSponsers(filename)
	const images = await downloadImages(sponsors)

	const sponsorWithImage = sponsors.map(s => ({
		id: s.id,
		name: s['name:zh-TW'],
		image: images[s.id],
		level: s.level,
	}))

	const groupedSponsors = Object.groupBy(sponsorWithImage, s => s.level)

	const json = JSON.stringify(groupedSponsors)

	console.log(json)
}

main().catch(console.error)
