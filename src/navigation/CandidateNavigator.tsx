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
import SavedJobsScreen from '../modules/candidate/jobs/SavedJobsScreen';
import CandidateProfileScreen from '../modules/candidate/profile/CandidateProfileScreen';
import EditCandidateProfileScreen from '../modules/candidate/profile/EditCandidateProfileScreen';
import UploadedResumeScreen from '../modules/candidate/resume/ResumeScreen';
import MyResumesScreen from '../modules/resume/screens/MyResumesScreen';
import ResumeTemplatesScreen from '../modules/resume/screens/ResumeTemplatesScreen';
import PersonalDetailsScreen from '../modules/resume/screens/PersonalDetailsScreen';
import EducationScreen from '../modules/resume/screens/EducationScreen';
import ExperienceScreen from '../modules/resume/screens/ExperienceScreen';
import SkillsScreen from '../modules/resume/screens/SkillsScreen';
import ProjectsScreen from '../modules/resume/screens/ProjectsScreen';
import CertificationsScreen from '../modules/resume/screens/CertificationsScreen';
import ResumePreviewScreen from '../modules/resume/screens/ResumePreviewScreen';
import RaiseComplaintScreen from '../modules/shared/complaints/RaiseComplaintScreen';
import NotificationsScreen from '../modules/shared/notifications/NotificationsScreen';
import SettingsScreen from '../modules/shared/settings/SettingsScreen';
import AccountScreen from '../modules/shared/account/AccountScreen';
import ChangePasswordScreen from '../modules/shared/account/ChangePasswordScreen';
import CareerPreferencesScreen from '../modules/candidate/settings/CareerPreferencesScreen';
import CommunicationPrivacyScreen from '../modules/candidate/settings/CommunicationPrivacyScreen';
import BlockedCompaniesScreen from '../modules/candidate/settings/BlockedCompaniesScreen';
import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  House,
  UserRound,
} from 'lucide-react-native';
import { tabOptions, useTabScreenOptions } from './tabBarOptions';
import { CandidateStackParamList, CandidateTabParamList } from './types';

const Tab = createBottomTabNavigator<CandidateTabParamList>();
const Stack = createNativeStackNavigator<CandidateStackParamList>();

function CandidateTabs() {
  const tabScreenOptions = useTabScreenOptions();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="CandidateHome"
        component={CandidateHomeScreen}
        options={tabOptions('Home', House)}
      />
      <Tab.Screen
        name="JobSearch"
        component={JobSearchScreen}
        options={tabOptions('Jobs', BriefcaseBusiness)}
      />
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
      <Stack.Screen
        name="ApplicationTracker"
        component={ApplicationTrackerScreen}
      />
      <Stack.Screen
        name="EditCandidateProfile"
        component={EditCandidateProfileScreen}
      />
      <Stack.Screen name="Resume" component={MyResumesScreen} />
      <Stack.Screen name="UploadedResume" component={UploadedResumeScreen} />
      <Stack.Screen name="ResumeTemplates" component={ResumeTemplatesScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="Education" component={EducationScreen} />
      <Stack.Screen name="Experience" component={ExperienceScreen} />
      <Stack.Screen name="Skills" component={SkillsScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Certifications" component={CertificationsScreen} />
      <Stack.Screen name="ResumePreview" component={ResumePreviewScreen} />
      <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="CareerPreferences" component={CareerPreferencesScreen} />
      <Stack.Screen name="CommunicationPrivacy" component={CommunicationPrivacyScreen} />
      <Stack.Screen name="BlockedCompanies" component={BlockedCompaniesScreen} />
      <Stack.Screen name="RaiseComplaint" component={RaiseComplaintScreen} />
    </Stack.Navigator>
  );
}
