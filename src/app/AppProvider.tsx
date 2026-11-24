import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { CelebrateProvider } from '../components/animated';
import { store } from '../store';
import { colors } from '../theme';
import PushNotificationManager from '../services/firebase/PushNotificationManager';
import RootNavigator from './RootNavigator';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

export default function AppProvider() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <Provider store={store}>
        <PushNotificationManager />
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <CelebrateProvider>
            <NavigationContainer theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
          </CelebrateProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
