import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BriefcaseBusiness, GraduationCap, LayoutDashboard, Menu, UserSearch } from 'lucide-react-native';
import AdminApplicationsScreen from '../modules/admin/applications/AdminApplicationsScreen';
import AdminAuditLogsScreen from '../modules/admin/audit/AdminAuditLogsScreen';
import AdminCompaniesScreen from '../modules/admin/companies/AdminCompaniesScreen';
import AdminComplaintsScreen from '../modules/admin/complaints/AdminComplaintsScreen';
import AdminDashboardScreen from '../modules/admin/dashboard/AdminDashboardScreen';
import { AdminDataProvider } from '../modules/admin/data/AdminDataProvider';
import AdminJobsScreen from '../modules/admin/jobs/AdminJobsScreen';
import AdminMoreScreen from '../modules/admin/more/AdminMoreScreen';
import AdminNotificationsScreen from '../modules/admin/notifications/AdminNotificationsScreen';
import AdminPaymentsScreen from '../modules/admin/payments/AdminPaymentsScreen';
import AdminPlacementsScreen from '../modules/admin/placements/AdminPlacementsScreen';
import AdminReportsScreen from '../modules/admin/reports/AdminReportsScreen';
import AdminStaffUsersScreen from '../modules/admin/staff/AdminStaffUsersScreen';
import AdminSubscriptionsScreen from '../modules/admin/subscriptions/AdminSubscriptionsScreen';
import { useAdminBadges } from '../modules/admin/useAdminModules';
import AdminCandidatesScreen from '../modules/admin/users/AdminCandidatesScreen';
import AdminRecruitersScreen from '../modules/admin/users/AdminRecruitersScreen';
import AdminUserDetailsScreen from '../modules/admin/users/AdminUserDetailsScreen';
import AdminVerificationScreen from '../modules/admin/verification/AdminVerificationScreen';
import { colors } from '../theme';
import { tabOptions, useTabScreenOptions } from './tabBarOptions';
import { AdminStackParamList, AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();
const badgeStyle = { backgroundColor: colors.danger };

function AdminTabs() {
  const tabScreenOptions = useTabScreenOptions();
  const badges = useAdminBadges();
  // everything reached through the Menu tab
  const menuBadge =
    (badges.verification ?? 0) +
    (badges.complaints ?? 0) +
    (badges.applications ?? 0) +
    (badges.payments ?? 0) +
    (badges.subscriptions ?? 0);

  return (
    <Tab.Navigator
      screenOptions={{ ...tabScreenOptions, sceneStyle: { backgroundColor: colors.surface } }}>
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={tabOptions('Dashboard', LayoutDashboard)} />
      <Tab.Screen name="AdminCandidates" component={AdminCandidatesScreen} options={tabOptions('Candidates', GraduationCap)} />
      <Tab.Screen name="AdminRecruiters" component={AdminRecruitersScreen} options={tabOptions('Recruiters', UserSearch)} />
      <Tab.Screen
        name="AdminJobs"
        component={AdminJobsScreen}
        options={{ ...tabOptions('Jobs', BriefcaseBusiness), tabBarBadge: badges.jobs || undefined, tabBarBadgeStyle: badgeStyle }}
      />
      <Tab.Screen
        name="AdminMore"
        component={AdminMoreScreen}
        options={{ ...tabOptions('Menu', Menu), tabBarBadge: menuBadge || undefined, tabBarBadgeStyle: badgeStyle }}
      />
    </Tab.Navigator>
  );
}

/**
 * Admin panel (role ADMIN, entered from "Admin Login" on the Login screen).
 *
 *   Tabs:  Dashboard · Candidates · Recruiters · Jobs · Menu
 *   Menu:  Companies, Applications, Verification, Placements, Complaints,
 *          Notifications, Reports, Subscriptions, Payments, Users (admin staff),
 *          Audit Logs  (+ shortcuts to the tab sections)
 */
export default function AdminNavigator() {
  return (
    <AdminDataProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
        <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen} />
        <Stack.Screen name="AdminCompanies" component={AdminCompaniesScreen} />
        <Stack.Screen name="AdminApplications" component={AdminApplicationsScreen} />
        <Stack.Screen name="AdminVerification" component={AdminVerificationScreen} />
        <Stack.Screen name="AdminPlacements" component={AdminPlacementsScreen} />
        <Stack.Screen name="AdminComplaints" component={AdminComplaintsScreen} />
        <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
        <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
        <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptionsScreen} />
        <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
        <Stack.Screen name="AdminStaffUsers" component={AdminStaffUsersScreen} />
        <Stack.Screen name="AdminAuditLogs" component={AdminAuditLogsScreen} />
      </Stack.Navigator>
    </AdminDataProvider>
  );
}
