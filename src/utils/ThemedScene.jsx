import React, { Component, Navigator, ScrollView, View, Text } from 'react-native'

import { COLOR } from 'react-native-material-design'

import StatusBarAndroid from 'react-native-android-statusbar'

import * as app from '../app'

export default class ThemedScene extends Component {
	render() {
		var marginTop = this.props.navigationBar ? 56 : 0
		return <Navigator { ...this.props }
			sceneStyle={ Object.assign({ flex:1, marginTop }, this.props.sceneStyle) }
			renderScene={ () => this.props.children } />
	}

	componentDidMount() {
		StatusBarAndroid.setHexColor(app.getThemeStyle(7).color)
	}
}
