import React, { Component, WebView } from 'react-native'

var script = '<script>location.hash = 1; document.title = document.body.scrollHeight</script>'

// https://github.com/danrigsby/react-native-web-container/blob/master/index.js
export default class AutoHeightWebView extends Component {
	state = {
		height: 0,
	}

	onNavigationStateChange(doc) {
		var height = parseInt(doc.title) || 0
		if (height > 0) this.setState({ height })
	}

	getHTML(html) {
		// FIXME: disable other scripts and navigation
		if (html !== undefined)
			return html + script
	}

	render() {
		return <WebView { ...this.props }
			style={[ this.props.style, { height:this.state.height } ]}
			html={ this.getHTML(this.props.html) }
			javaScriptEnabled={ true }
			scrollEnabled={ false }
			onNavigationStateChange={ (doc) => this.onNavigationStateChange(doc) }/>
	}
}