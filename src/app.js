import { COLOR } from 'react-native-material-design'

const SERVER_URL = 'http://u.ofr.me:8082'

export function getThemePrimary() {
	// see
	//    https://raw.githubusercontent.com/binggg/react-native-material-design-styles/master/allColors.jpg
	// for all colors
	return 'paperRed'
}

var STYLE_CACHE = { }
export function getThemeStyle(level) {
	if (!(level >= 1)) level = 1
	if (!(level <= 9)) level = 9

	var color = getThemePrimary()
	if (STYLE_CACHE[color + level])
		return STYLE_CACHE[color + level]

	while (color >= 1 && !COLOR[color + level + '00'])
		level --
	return STYLE_CACHE[color + level] = COLOR[color + level + '00']
}

export function getURL(path, query) {
	var qs = [ ]
	if (query) for (var k in query)
		qs.push(k + '=' + encodeURIComponent(query[k]))
	return qs.length ? path + '?' + qs.join('&') : path
}

export function get(path, query) {
	return fetch(SERVER_URL + getURL(path, query)).then(resp => resp.json())
}