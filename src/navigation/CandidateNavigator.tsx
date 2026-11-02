import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyApplicationsScreen from '../modules/candidate/applications/MyApplicationsScreen';
import ApplicationTrackerScreen from '../modules/candidate/applications/ApplicationTrackerScreen';
import CandidateHomeScreen from '../modules/candidate/home/CandidateHomeScreen';
import CandidateInterviewsScreen from '../modules/candidate/interviews/CandidateInterviewsScreen';
import ApplyJobScreen from '../modules/candidate/jobs/ApplyJobScreen';
import JobDetailsScreen from '../modules/candidate/jobs/JobDetailsScreen';
import JobSearchScreen from '../modules/candidate/jobs/JobSearchScreen';
import CandidateProfileScreen from '../modules/candidate/profile/CandidateProfileScreen';
import EditCandidateProfileScreen from '../modules/candidate/profile/EditCandidateProfileScreen';
import ResumeScreen from '../modules/candidate/resume/ResumeScreen';
import RaiseComplaintScreen from '../modules/shared/complaints/RaiseComplaintScreen';
import NotificationsScreen from '../modules/shared/notifications/NotificationsScreen';
import SettingsScreen from '../modules/shared/settings/SettingsScreen';
import { BriefcaseBusiness, CalendarDays, FileText, House, UserRound } from 'lucide-react-native';
import { tabOptions, useTabScreenOptions } from './tabBarOptions';
import { CandidateStackParamList, CandidateTabParamList } from './types';

const Tab = createBottomTabNavigator<CandidateTabParamList>();
const Stack = createNativeStackNavigator<CandidateStackParamList>();

function CandidateTabs() {
  const tabScreenOptions = useTabScreenOptions();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="CandidateHome" component={CandidateHomeScreen} options={tabOptions('Home', House)} />
      <Tab.Screen name="JobSearch" component={JobSearchScreen} options={tabOptions('Jobs', BriefcaseBusiness)} />
      <Tab.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={tabOptions('Applied', FileText)}
      />
      <Tab.Screen
        name="CandidateInterviews"
        component={CandidateInterviewsScreen}
        options={tabOptions('Interviews', CalendarDays)}
      />
      <Tab.Screen
        name="CandidateProfile"
        component={CandidateProfileScreen}
        options={tabOptions('Profile', UserRound)}
      />
    </Tab.Navigator>
  );
}

export default function CandidateNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CandidateTabs" component={CandidateTabs} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
      <Stack.Screen name="ApplicationTracker" component={ApplicationTrackerScreen} />
      <Stack.Screen name="EditCandidateProfile" component={EditCandidateProfileScreen} />
      <Stack.Screen name="Resume" component={ResumeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="RaiseComplaint" component={RaiseComplaintScreen} />
    </Stack.Navigator>
  );
}
