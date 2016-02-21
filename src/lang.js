const TRANS = {
	'app title': {
		zh: 'THVideo Demo 495514',
	},

	'play': {
		zh: '播放',
	},

	'retry': {
		zh: '重试',
	},

	'load failed': {
		zh: '载入失败',
	},

	'loading...': {
		zh: '载入中...',
	},

	'Recommended in this week': {
		zh: '本周推荐',
	},

	'Recommended in this month': {
		zh: '本月推荐',
	},
}

export default function lang(text, args) {
	var local = 'zh',
		trans = TRANS[text],
		content = trans ? (trans[local] || trans.en) : 'TRANS_MISSING: ' + text
	return content.replace(/{{([^}]+)}}/g, (c, m) => args[m])
}