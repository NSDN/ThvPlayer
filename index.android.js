import { AppRegistry } from 'react-native'

var map = {
	main:      require('./src/scenes/MainScene'),
	videocata: require('./src/scenes/VideoCataScene'),
	videolist: require('./src/scenes/VideoListScene'),
	videoinfo: require('./src/scenes/VideoInfoScene'),
}

Object.keys(map).forEach(name => AppRegistry.registerComponent(name, () => map[name].default))
