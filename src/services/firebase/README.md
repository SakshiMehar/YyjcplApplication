# Firebase services

Install when `android/app/google-services.json` is ready (see PROJECT_GUIDE.md, step 8):

    npm i @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/messaging \
          @react-native-firebase/storage @react-native-firebase/analytics @react-native-firebase/crashlytics

Files in this folder are the single entry point for each Firebase product, so
screens never import `@react-native-firebase/*` directly.
