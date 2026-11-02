import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from '../modules/auth/screens/ForgotPasswordScreen';
import LoginScreen from '../modules/auth/screens/LoginScreen';
import OnboardingEmployerScreen from '../modules/auth/screens/OnboardingEmployerScreen';
import OnboardingJobSeekerScreen from '../modules/auth/screens/OnboardingJobSeekerScreen';
import OtpScreen from '../modules/auth/screens/OtpScreen';
import RegisterScreen from '../modules/auth/screens/RegisterScreen';
import ResetPasswordScreen from '../modules/auth/screens/ResetPasswordScreen';
import RoleSelectScreen from '../modules/auth/screens/RoleSelectScreen';
import SplashScreen from '../modules/auth/screens/SplashScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Splash → Onboarding 1 → Onboarding 2 → Login
 *   Login (mobile)        → OTP → app
 *   Login (email)         → password → app            (Forgot Password → OTP → Reset Password)
 *   Create an account     → Select Role → Register → OTP → app
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="OnboardingJobSeeker" component={OnboardingJobSeekerScreen} />
      <Stack.Screen name="OnboardingEmployer" component={OnboardingEmployerScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
