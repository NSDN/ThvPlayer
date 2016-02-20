import React, {
	IntentAndroid,
	ToastAndroid,
	BackAndroid,

	PullToRefreshViewAndroid,
	DrawerLayoutAndroid,
	ViewPagerAndroid,

	Component,
	TouchableNativeFeedback,
	ScrollView, View, Text, Image,
} from 'react-native'

import {
	Avatar, Drawer, Divider, Toolbar, Subheader, Card, Button,
	COLOR, TYPO
} from 'react-native-material-design'

import URL from 'url-parse'

import ThemedScene from '../utils/ThemedScene'

import Center from '../utils/Center'

import * as app from '../app'

import lang from '../lang'

const IMG = src => <Image source={ src } />

const REDIRECT_LIST = { }
;[
	'/douga/2d/tegaki.html',
	'/douga/2d/mad.html',
	'/douga/3d.html',
	'/douga/info.html',
	'/music/song.html',
	'/music/perform.html',
	'/music/otomad.html',
	'/game/official/stg.html',
	'/game/official/ftg.html',
	'/game/fangame/pv.html',
	'/game/fangame/play.html',
	'/game/mugen.html',
	'/misc/reallife.html',
	'/misc/otherworks/source.html',
	'/misc/otherworks/crossover.html',
].forEach(url => REDIRECT_LIST[url] = url.replace('.html', '-{page}.html'))

var styles = {
	card: {
		flex: 0.5,
		paddingLeft: 8,
		paddingRight: 8,
	},
	cardBody: {
		paddingTop: 8,
		paddingBottom: 8,
	},
	cardText: {
	},
}

export default class VideoCataScene extends Component {
	state = {
		sections: [ ],
		selectedIndex: 0,
	};

	load() {
		if (this.state.loadDone !== undefined)
			this.setState({ loadDone:undefined })

		IntentAndroid.getInitialURL(url => {
			var uri = new URL(url, true)
			app.get('/cata' + uri.pathname).then(data => {
				this.setState({
					title: data.title || 'untitled',
					sections: data.sections,
					loadDone: true,
				})
			}).catch(err => {
				ToastAndroid.show('network error', ToastAndroid.SHORT)
				this.setState({
					loadDone: null,
				})
			})
		})
	}

	setSelectedIndex(selectedIndex) {
		this.setState({ selectedIndex })
		this.refs.pager.setPage(selectedIndex)
	}

	renderToolbar() {
		return <Toolbar
			primary={ app.getThemePrimary() }
			title={ this.state.title }
			onIconPress={ () => BackAndroid.exitApp() }
			icon="keyboard-backspace" />
	}

	renderItems(items) {
		if (items.length % 2)
			return this.renderItems([null].concat(items))

		return Array(items.length / 2).fill(0).map((x, i) => <View key={ i } style={{ flexDirection:'row', flex:1 }}>
		{
			items.slice(i * 2, i * 2 + 2).map((item, i) => item &&
			<Card key={ i }
				onPress={ () => IntentAndroid.openURL('thvbrowse://videoinfo/?id=' + item.id) }
				style={ styles.card }>
				<Card.Media image={ IMG({ uri:item.img }) } overlay />
				<View style={ styles.cardBody }>
					<Text style={ styles.cardText }
						numberOfLines={ 2 }>
						{ /* FIXME: to keep height match */ }
						{ item.title + '\n ' }
					</Text>
				</View>
			</Card>)
		}
		</View>)
	}

	renderNav(section) {
		var url = REDIRECT_LIST[section.path] ?
			'thvbrowse://videolist' + section.path.replace(/\.html$/, '-{page}.html') :
			'thvbrowse://videocata' + section.path
		return <View style={{ flex:1, flexDirection:'row', justifyContent:'flex-end' }}>
			<Button text="more..." primary={ app.getThemePrimary() }
				onPress={ () => IntentAndroid.openURL(url) } />
		</View>
	}

	render() {
		return <ThemedScene
			navigationBar={ this.renderToolbar() }>
			<View style={{ flexDirection:'row', backgroundColor:app.getThemeStyle(1).color }}>
			{
				/* FIXME: enable auto scroll */
				(this.state.sections || [ ]).map((s, i) => <Button key={ i }
					raised={ i === this.state.selectedIndex }
					onPress={ () => this.setSelectedIndex(i) }
					text={ s.name } primary={ app.getThemePrimary() } />)
			}
			</View>
			<ViewPagerAndroid style={{ flex:1 }} ref="pager"
				onPageSelected={ e => this.setState({ selectedIndex:e.nativeEvent.position }) }>
			{
				this.state.sections.map((section, index) => <View key={ index }>
					<ScrollView>
					{ this.renderItems(section.list) }
					{ section.path && this.renderNav(section) }
					</ScrollView>
				</View>)
			}
			</ViewPagerAndroid>
		</ThemedScene>
	}

	componentDidMount() {
		this.load()
	}
}