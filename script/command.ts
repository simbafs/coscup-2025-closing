import groups from '../src/data.json' with { type: 'json' }
import { sponsorLevels_mapping, sponsorLevels } from '../src/core/constants.ts'

const cmdOptions = [
	...groups.data.map(g => ({
		label: g.name,
		value: g.tid,
	})),
	...sponsorLevels.map(level => ({
		label: sponsorLevels_mapping[level],
		value: level,
	})),
]

const cmd = [
	{
		name: 'pause',
		label: '暫停/繼續',
		type: 'button',
	},
	{
		name: 'restart',
		label: '重新開始',
		type: 'button',
	},
	{
		name: 'jump',
		label: '跳轉',
		type: 'select',
		options: cmdOptions,
	},
]

console.log(JSON.stringify(cmd))
