const jsdom = require('jsdom'),
	koa = require('koa'),
    router = require('koa-router')

String.prototype.extractMatch = function(patt) {
	var match = new RegExp(patt).exec(this)
	return match ? match.pop() : ''
}

String.prototype.toInt = function() {
	return parseInt(this)
}

function promisify(fn) {
    return function() {
        var args = Array.prototype.slice.call(arguments)
        return new Promise((resolve, reject) => {
            args.push(function(err, ret) {
                err ? reject(err) : resolve(ret)
            })
            fn.apply(null, args)
        })
    }
}

const ARRAY = key => e => e.get().map(c => extract(e.constructor(c), key))

function text(elem) {
	return elem !== null && elem !== undefined && elem.jquery ? elem.text() : elem
}

function extract(elem, key) {
	if (elem === null || elem === undefined)
		return
	else if (key[0] === '$')
		return (st => elem[st.shift()].apply(elem, st))(key.substr(1).split(':'))
	else if (typeof(key) === 'string')
		return elem.find(key)
	else if (typeof(key) === 'function')
		return key(elem)

	if (Array.isArray(key))
		return text(key.reduce(extract, elem))

	var data = { }
	for (var k in key)
		data[k] = text(extract(elem, key[k]))
	return data
}

const hostUrl = 'http://thvideo.tv',
	jqueryUrl = 'http://cdn.bootcss.com/jquery/2.2.0/jquery.min.js'

const VIDEO_ITEM_KEYS = {
	id: ['$attr:href', '$extractMatch:/th(\\d+)'],
	img: '$attr:img',
	title: '$attr:titles',
	date: '$attr:time',
	stats: {
		hits: '$attr:play',
		danmakus: '$attr:dm',
		comments: '$attr:comment',
		favs: '$attr:fav',
	},
	uploader: {
		name: '$attr:user',
	},
}
const SECTION_KEYS = {
	name: '.name',
	path: ['.name', '$attr:href', '$extractMatch:thvideo\\.tv(/.*)'],
	list: ['+ .box a', ARRAY(VIDEO_ITEM_KEYS)],
}
const INDEX_KEYS = ['body > .main > .left', {
	focus: ['.pos_focus > a', ARRAY({
		img: ['img', '$attr:src'],
		title: '.t',
		id: ['$attr:href', '$extractMatch:/th(\\d+)'],
	})],
	news: ['.newpos', {
		week:  ['.list:eq(0) a', ARRAY(VIDEO_ITEM_KEYS)],
		month: ['.list:eq(1) a', ARRAY(VIDEO_ITEM_KEYS)],
	}],
	sections: ['.t_white:gt(0)', ARRAY(SECTION_KEYS)],
}]

const CATA_KEYS = {
	title: '.sub_nav .now a',
	sections: ['.t_white', ARRAY(SECTION_KEYS)],
}

const LIST_KEYS = {
	title: 'title',
	list: ['.box', '.lists', ARRAY({
		id: ['.t', '$attr:href', '$extractMatch:/th(\\d+)'],
		img: ['.p img', '$attr:data-original'],
		title: '.t',
		desc: '.d',
		datetime: '.u em:last',
		stats: ['.i', {
			hits: '.p',
			danmakus: '.dm',
			comments: '.co',
			favs: '.f',
		}],
		uploader: ['.u a', {
			name: '$text',
			id: ['$attr:href', '$extractMatch:/(\\d+)'],
		}],
	})],
	pages: ['.pages > :not(.a1):last', '$text', '$toInt'],
}

const VIDEO_KEYS = {
	title: '.show_title span',
	date: '.news_info dt span:first',
	img: ['.news_info img', '$attr:src'],
	desc: ['#content_code', '$html'],
	tags: ['#tagbox a.wiki +', ARRAY('$html')],
	parts: ['#player_code li', e => e.text().split('**')
		.map(s => s.split('|')).map(a => ({ code:a[0], title:a[1] }))],
	uploader: ['.show_user', {
		avatar: ['dd img', '$attr:src'],
		id: ['dd a', '$attr:href', '$extractMatch:/(\\d+)'],
		user: '.name a',
	}],
}

const app = new koa(),
    api = new router(),
	query = promisify((url, cb) => jsdom.env(url, [jqueryUrl], cb))

api.get('/', function *(next) {
	var window = yield query(hostUrl)
	this.body = extract(window.$('html'), INDEX_KEYS)
})

api.get('/cata/:path(.*)', function *(next) {
	var window = yield query(hostUrl + '/' + this.params.path)
	this.body = extract(window.$('html'), CATA_KEYS)
})

api.get('/list/:path(.*)', function *(next) {
	var window = yield query(hostUrl + '/' + this.params.path)
	this.body = extract(window.$('html'), LIST_KEYS)
})

api.get('/video/:cid', function *(next) {
	var window = yield query(hostUrl + '/v/th' + this.params.cid)
	this.body = extract(window.$('html'), VIDEO_KEYS)
})

app.use(api.routes())
    .use(api.allowedMethods())
    .listen(8082)
