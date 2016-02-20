import React, {
	Component,
	TouchableOpacity,
	TouchableNativeFeedback,
	ScrollView,
	WebView, View, Text, Image,

	IntentAndroid,
	BackAndroid,
} from 'react-native'

import {
	Toolbar, List, Button,
	TYPO, COLOR,
} from 'react-native-material-design'

import Icon from 'react-native-vector-icons/MaterialIcons'

import URL from 'url-parse'

import ThemedScene from '../utils/ThemedScene'

import AutoHeightWebView from '../utils/AutoHeightWebView'

import * as app from '../app'

import lang from '../lang'

var styles = {
	videoTitle: [
		TYPO.paperFontSubhead,
	],
	videoItem: {
		flex: 1,
		flexDirection: 'row',
		padding: 16,
	},
	videoImage: {
		width: 120,
		height: 90,
	},
	videoInfo: {
		flex: 1,
		flexDirection: 'column',
		marginLeft: 8,
	},
	desc: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	tagbox: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	tag: {
		padding: 8,
	},
	parts: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	part: {
		flex: 0.25,
	},
	defaultVideoImage: require('../../res/imgs/avatar.png'),
}

export default class VideoInfoScene extends Component {
	state = {
		title: 'loading...',
		videoData: { },
	};

	renderToolbar() {
		return <Toolbar
			primary={ app.getThemePrimary() }
			title={ this.state.title }
			onIconPress={ () => BackAndroid.exitApp() }
			icon="keyboard-backspace" />
	}

	render() {
		var data = this.state.videoData
		return <ThemedScene
			navigationBar={ this.renderToolbar() }>
			<ScrollView>
				<TouchableNativeFeedback>
					<View style={ styles.videoItem }>
						<Image style={ styles.videoImage }
							source={ data.img ? { uri:data.img } : styles.defaultVideoImage } />
						<View style={ styles.videoInfo }>
							<Text style={ styles.videoTitle }>{ data.title }</Text>
							{
								data.parts && data.parts.length == 1 &&
								<View style={{ flex:1, flexDirection:'row', justifyContent:'flex-end' }}>
									<Button text={ lang('play') }
										primary={ app.getThemePrimary() } raised={ true }
										onPress={ () => IntentAndroid.openURL('thvplay://v/cid=' + this.state.id) } />
								</View>
							}
						</View>
					</View>
				</TouchableNativeFeedback>
				<View style={ styles.parts }>
				{
					data.parts && data.parts.length > 1 && data.parts.map((part, i) => <Button
						key={ i }
						raised={ true }
						primary={ app.getThemePrimary() }
						onPress={ () => IntentAndroid.openURL('thvplay://v/' + part.code) }
						text={ part.title }
						style={ styles.part } />)
				}
				</View>
				<AutoHeightWebView
					style={ styles.desc }
					html={ data.desc && '<div style="color:#888;font-size:90%;">' + data.desc + '</div>' } />
				<View style={ styles.tagbox }>
				{
					data.tags && data.tags.map((tag, i) => <TouchableOpacity
						key={ i }>
						<View style={ styles.tag }>
							<Text style={ app.getThemeStyle(5) }>
								<Icon name="grade" /> { tag }
							</Text>
						</View>
					</TouchableOpacity>)
				}
				</View>
			</ScrollView>
		</ThemedScene>
	}

	componentDidMount() {
		IntentAndroid.getInitialURL(url => {
			var uri = new URL(url, true)
			app.get('/video/' + uri.query.id).then(data => {
				this.setState({
					title: data.title,
					id: uri.query.id,
					videoData: data,
				})
			}).catch(err => {
				this.setState({
					title: 'load failed'
				})
			})
		})
	}
}
