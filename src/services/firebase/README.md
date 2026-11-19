# Firebase services

Firebase App, Auth, and Messaging are installed. Android builds require
`android/app/google-services.json` (see PROJECT_GUIDE.md, step 8). Install other
Firebase services only when needed:

    npm i @react-native-firebase/storage @react-native-firebase/analytics @react-native-firebase/crashlytics

Files in this folder are the single entry point for each Firebase product, so
screens never import `@react-native-firebase/*` directly.
`messaging.ts` supplies the device token included in the login request.
