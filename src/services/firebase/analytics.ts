/**
 * Firebase Analytics.
 * TODO: after installing @react-native-firebase/analytics:
 *   export const logScreen = (name: string) => analytics().logScreenView({ screen_name: name, screen_class: name });
 *   export const logEvent = (name: string, params?: object) => analytics().logEvent(name, params);
 */
export const logScreen = (_name: string) => {};
export const logEvent = (_name: string, _params?: Record<string, unknown>) => {};
