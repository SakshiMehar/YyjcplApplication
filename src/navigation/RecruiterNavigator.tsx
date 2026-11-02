import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ApplicantDetailsScreen from '../modules/recruiter/applications/ApplicantDetailsScreen';
import ApplicationsScreen from '../modules/recruiter/applications/ApplicationsScreen';
import CandidateDetailsScreen from '../modules/recruiter/candidates/CandidateDetailsScreen';
import CandidateSearchScreen from '../modules/recruiter/candidates/CandidateSearchScreen';
import CompanyProfileScreen from '../modules/recruiter/company/CompanyProfileScreen';
import EditCompanyScreen from '../modules/recruiter/company/EditCompanyScreen';
import RecruiterDashboardScreen from '../modules/recruiter/dashboard/RecruiterDashboardScreen';
import RecruiterInterviewsScreen from '../modules/recruiter/interviews/RecruiterInterviewsScreen';
import ScheduleInterviewScreen from '../modules/recruiter/interviews/ScheduleInterviewScreen';
import MyJobsScreen from '../modules/recruiter/jobs/MyJobsScreen';
import PostJobScreen from '../modules/recruiter/jobs/PostJobScreen';
import ShortlistScreen from '../modules/recruiter/shortlist/ShortlistScreen';
import { useSyncPendingCompany } from '../modules/recruiter/hooks/useSyncPendingCompany';
import SubscriptionScreen from '../modules/recruiter/subscription/SubscriptionScreen';
import RaiseComplaintScreen from '../modules/shared/complaints/RaiseComplaintScreen';
import NotificationsScreen from '../modules/shared/notifications/NotificationsScreen';
import SettingsScreen from '../modules/shared/settings/SettingsScreen';
import { BriefcaseBusiness, Building2, LayoutDashboard, Search, Users } from 'lucide-react-native';
import { tabOptions, useTabScreenOptions } from './tabBarOptions';
import { RecruiterStackParamList, RecruiterTabParamList } from './types';

const Tab = createBottomTabNavigator<RecruiterTabParamList>();
const Stack = createNativeStackNavigator<RecruiterStackParamList>();

function RecruiterTabs() {
  const tabScreenOptions = useTabScreenOptions();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="RecruiterDashboard"
        component={RecruiterDashboardScreen}
        options={tabOptions('Dashboard', LayoutDashboard)}
      />
      <Tab.Screen name="MyJobs" component={MyJobsScreen} options={tabOptions('Jobs', BriefcaseBusiness)} />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={tabOptions('Applicants', Users)}
      />
      <Tab.Screen
        name="CandidateSearch"
        component={CandidateSearchScreen}
        options={tabOptions('Search', Search)}
      />
      <Tab.Screen
        name="CompanyProfile"
        component={CompanyProfileScreen}
        options={tabOptions('Profile', Building2)}
      />
    </Tab.Navigator>
  );
}

export default function RecruiterNavigator() {
  useSyncPendingCompany();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecruiterTabs" component={RecruiterTabs} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="ApplicantDetails" component={ApplicantDetailsScreen} />
      <Stack.Screen name="CandidateDetails" component={CandidateDetailsScreen} />
      <Stack.Screen name="Shortlist" component={ShortlistScreen} />
      <Stack.Screen name="ScheduleInterview" component={ScheduleInterviewScreen} />
      <Stack.Screen name="RecruiterInterviews" component={RecruiterInterviewsScreen} />
      <Stack.Screen name="EditCompany" component={EditCompanyScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="RaiseComplaint" component={RaiseComplaintScreen} />
    </Stack.Navigator>
  );
}
