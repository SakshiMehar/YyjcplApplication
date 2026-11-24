/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Must be registered before React mounts. Android displays notification-payload
// messages itself while the app is in the background or has been quit.
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.info('[FCM] Background message received.', remoteMessage.messageId);
});

AppRegistry.registerComponent(appName, () => App);
