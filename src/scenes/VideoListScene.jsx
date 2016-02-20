import React, {
	Component,
	PullToRefreshViewAndroid,
	RecyclerViewBackedScrollView,
	TouchableNativeFeedback,
	ScrollView, ListView,
	View, Text, Image,

	IntentAndroid,
	ToastAndroid,
	BackAndroid,
} from 'react-native'

import {
	Toolbar, List,
	TYPO, COLOR,
} from 'react-native-material-design'

import URL from 'url-parse'

import ThemedScene from '../utils/ThemedScene'

import * as app from '../app'

// https://github.com/react-native-material-design/...
//         react-native-material-design/blob/master/lib/List.js
var styles = {
	rowItem: {
		flex: 1,
		flexDirection: 'row',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        marginTop: 2,
		backgroundColor: '#ffffff',
	},
	rowImage: {
		width: 120,
		height: 90,
	},
	rowText: {
		flex: 1,
		flexDirection: 'column',
		marginLeft: 8,
	},
	rowPrimaryText: [
		TYPO.paperFontBody2,
		{
			fontSize: 14,
		},
	],
	rowSecondaryText: [
		TYPO.paperFontBody1,
		{
			fontSize: 12,
		}
	],
	rowCaptionText: [
		TYPO.paperFontCaption,
		COLOR.paperGrey500,
		{
			fontSize: 12,
		}
	],
	listFooter: {
		flex: 1,
		alignItems: 'center',
		marginTop: 16,
		marginBottom: 16,
	},
	defaultRowImage: require('../../res/imgs/avatar.png'),
}

export default class VideoListScene extends Component {
	state = {
		dataSource: new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		}),
		isRefreshing: false,
		totalPages: 0,
		pageIndex: 0,
	};

	loadPage(pageIndex) {
		if (this.state.isRefreshing) return
		this.setState({ isRefreshing:true })

		var { dataSource } = this.state,
			list = Array(dataSource.getRowCount()).fill(0)
				.map(dataSource.getRowData.bind(dataSource))
		IntentAndroid.getInitialURL(url => {
			var uri = new URL(url.replace(/{page}/, pageIndex), true)
			app.get('/list' + uri.pathname).then(data => {
				this.setState({
					title: data.title || 'untitled',
					dataSource: dataSource.cloneWithRows(list.concat(data.list)),
					isRefreshing: false,
					totalPages: data.pages,
					pageIndex,
				})
			}).catch(err => {
				ToastAndroid.show('network error', ToastAndroid.SHORT)
				this.setState({
					isRefreshing: false,
					totalPages: -1,
				})
			})
		})
	}

	loadMore() {
		this.loadPage(this.state.pageIndex + 1)
	}

	reloadAll() {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows([]),
			pageIndex: 0,
			totalPages: 0,
		})
		this.loadMore()
	}

	renderRow(rowData) {
	    return <TouchableNativeFeedback
	    	onPress={ () => IntentAndroid.openURL('thvbrowse://videoinfo/?id=' + rowData.id) }
	        background={TouchableNativeFeedback.SelectableBackground()}>
			<View style={ styles.rowItem }>
				<Image style={ styles.rowImage }
					source={ rowData.img ? { uri:rowData.img } : styles.defaultRowImage } />
				<View style={ styles.rowText }>
					<Text style={ styles.rowPrimaryText }
						numberOfLines={ 2 }>{ rowData.title }</Text>
					<Text style={ styles.rowSecondaryText }
						numberOfLines={ 2 }>{ rowData.desc }</Text>
					<Text style={ styles.rowCaptionText }>
						{ rowData.stats.hits }    { rowData.stats.comments }
					</Text>
				</View>
			</View>
		</TouchableNativeFeedback>
	}

	renderFooter() {
		return this.state.pageIndex <= this.state.totalPages &&
		<View style={ styles.listFooter }>
			<Text>Loading Items...</Text>
		</View>
	}

	renderToolbar() {
		return <Toolbar
			primary={ app.getThemePrimary() }
			title={ this.state.title }
			onIconPress={ () => BackAndroid.exitApp() }
			icon="keyboard-backspace" />
	}

	render() {
		return <ThemedScene
			navigationBar={ this.renderToolbar() }>
			<PullToRefreshViewAndroid
				style={{ flex:1 /* https://facebook.github.io/react-native/docs/pulltorefreshviewandroid.html#content */ }}
				colors={[ app.getThemeStyle(5).color ]}
				refreshing={ this.state.isRefreshing && this.state.pageIndex === 0 }
				onRefresh={ () => this.reloadAll() }>
				<ListView
					dataSource={ this.state.dataSource }
					renderRow={ rowData => this.renderRow(rowData) }
					renderFooter={ () => this.renderFooter() }
					onEndReached={ () => this.loadMore() } />
			</PullToRefreshViewAndroid>
		</ThemedScene>
	}

	componentDidMount() {
		this.loadMore()
	}
}
