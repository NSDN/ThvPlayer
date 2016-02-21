react-native bundle ^
	--entry-file index.android.js ^
	--bundle-output android\app\src\main\assets\index.android.bundle ^
	--assets-dest android\app\src\main\res ^
	--platform android && ^
cd android && gradlew assembleDebug -PreactDevSupport=false && cd .. && ^
adb install -r android\app\build\outputs\apk\app-debug.apk