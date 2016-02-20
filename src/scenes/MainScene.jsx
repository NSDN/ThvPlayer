import React, {
	Component,
	DrawerLayoutAndroid, 
	TouchableNativeFeedback,
	ScrollView, View, Text, Image,

	IntentAndroid,
	ToastAndroid,
} from 'react-native'

import {
	Avatar, Drawer, Divider, Toolbar, Subheader, Card, Button,
	COLOR, TYPO
} from 'react-native-material-design'

import ViewPager from 'react-native-viewpager'

import ThemedScene from '../utils/ThemedScene'

import Center from '../utils/Center'

import * as app from '../app'

import lang from '../lang'

const IMG = src => <Image source={ src } />

const styles = {
	drawerHeader: {
		paddingTop: 16,
	},
	drawerText: [
		{
			marginTop: 20,
		},
		TYPO.paperFontSubhead
	],
	slider: {
		flex: 1,
		height: 200,
	},
	sliderImage: {
		flex: 1,
		height: 200,
	},
	sliderTitle: {
		position: 'absolute',
		color: '#eeeeee',
		left: 8,
		top: 8,
		textShadowColor: '#888888',
		textShadowOffset: {
			width: 1,
			height: 1,
		},
		textShadowRadius: 3
	},
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
	nav: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	drawerAvatarSize: 80,
	navImage: require('../../res/imgs/nav.jpg'),
	avatarImage: require('../../res/imgs/avatar.png'),
}

export default class MainScene extends Component {
	state = {
		sliderDataSource: new ViewPager.DataSource({
			pageHasChanged: (p1, p2) => p1 !== p2,
		}),
		sections: [ ],
	};

	openURL(url) {
		this.refs.drawer.closeDrawer()
		url && setTimeout(() => IntentAndroid.openURL(url), 200)
	}

	load() {
		if (this.state.loadDone !== undefined)
			this.setState({ loadDone:undefined })

		app.get('/').then(data => {
			this.setState(Object.assign(data, {
				sliderDataSource: this.state.sliderDataSource.cloneWithPages(data.focus),
				loadDone: true,
			}))
		}).catch(err => {
			ToastAndroid.show('network error', ToastAndroid.SHORT)
			this.setState({
				loadDone: null,
			})
		})
	}

	renderNavigationView() {
		return <Drawer>
			<Drawer.Header image={ IMG(styles.navImage) }>
				<View style={ styles.drawerHeader }>
					<Avatar size={ styles.drawerAvatarSize } image={ IMG(styles.avatarImage) }></Avatar>
					<Text style={ styles.drawerText }>Hello</Text>
				</View>
			</Drawer.Header>

			<Drawer.Section items={[
				{
					icon: 'home',
					value: 'Welcome',
					active: true,
					onPress: () => this.refs.drawer.closeDrawer(),
				},
			]} />

			<Drawer.Section items={[
				{
					icon: 'face',
					value: 'Browse',
					onPress: () => this.openURL('thvbrowse://videocata/douga.html')
				},
				{
					icon: 'label',
					value: 'Browse2',
				},
			]} />

			<Divider />

			<Drawer.Section items={[
				{
					icon: 'help-outline',
					value: 'About',
				},
			]} />
		</Drawer>
	}

	renderSlideItem(pageData) {
		return <View style={{ flex:1 }}>
			<Image style={ styles.sliderImage } source={{ uri:pageData.img }} />
			<Text style={ styles.sliderTitle }>{ pageData.title }</Text>
		</View>
	}

	renderToolbar() {
		return <Toolbar
			primary={ app.getThemePrimary() }
			title={ lang('app title') }
			icon="menu"
			onIconPress={ () => this.refs.drawer.openDrawer() } />
	}

	renderFocus() {
		return <ViewPager style={ styles.slider }
			isLoop={ true }
			dataSource={ this.state.sliderDataSource }
			renderPage={ pageData => this.renderSlideItem(pageData) } />
	}

	renderNews() {
		// FIXME: display in a different way
		return this.renderSections([
			{
				name: 'Recommended in this week',
				list: this.state.news.week,
			},
			{
				name: 'Recommended in this month',
				list: this.state.news.month,
			},
		])
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

	renderSections(sections) {
		return sections.map((section, index) => <View key={ index }>
			<View style={ styles.nav }>
				<Subheader text={ section.name } color={ app.getThemePrimary() } />
				{
					section.path &&
					<Button text="more..." primary={ app.getThemePrimary() }
						onPress={ () => IntentAndroid.openURL('thvbrowse://videocata' + section.path) } />
				}
			</View>
			{ this.renderItems(section.list.slice(0, 6)) }
		</View>)
	}

	render() {
		return <DrawerLayoutAndroid
			ref="drawer"
			drawerWidth={ 300 }
			drawerPosition={ DrawerLayoutAndroid.positions.Left }
			renderNavigationView={ () => this.renderNavigationView() }>
			<ThemedScene
				navigationBar={ this.renderToolbar() }>
				{
					this.state.loadDone === undefined ?
					<Center><Text>{ lang('loading...') }</Text></Center> :

					this.state.loadDone ?
					<ScrollView>
						{ this.renderFocus() }
						{ this.renderNews() }
						{ this.renderSections(this.state.sections) }
					</ScrollView> :

					<Center>
						<Text>{ lang('load failed') }</Text>
						<Button text={ lang('retry') } primary={ app.getThemePrimary() }
							onPress={ () => this.load() } />
					</Center>
				}
			</ThemedScene>
		</DrawerLayoutAndroid>
	}

	componentDidMount() {
		this.load()
	}
}
