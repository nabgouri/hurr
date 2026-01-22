import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';

// Force RTL BEFORE anything else loads
// This must be done at the entry point
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
