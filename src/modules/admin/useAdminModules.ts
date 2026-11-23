import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';
import { AdminModuleKey, moduleByKey } from './adminModules';
import { useAdminData } from './data/AdminDataProvider';

/** Opens any admin section, whether it is a bottom tab or a stack screen. */
export function useOpenAdminModule() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  return useCallback(
    (key: AdminModuleKey) => {
      const { route } = moduleByKey(key);
      if ('tab' in route) {
        navigation.navigate('AdminTabs', { screen: route.tab });
      } else {
        navigation.navigate(route.screen);
      }
    },
    [navigation],
  );
}

/** "Needs attention" counts shown as red badges on sections. */
export function useAdminBadges(): Partial<Record<AdminModuleKey, number>> {
  const { jobs, companies, candidateKyc, complaints, applications, subscriptions, payments } = useAdminData();
  return useMemo(
    () => ({
      jobs: jobs.filter(j => j.status === 'PENDING').length,
      verification:
        companies.filter(c => c.status === 'PENDING').length +
        candidateKyc.filter(k => k.status === 'PENDING').length,
      complaints: complaints.filter(c => c.status !== 'RESOLVED').length,
      applications: applications.filter(a => a.flagged).length,
      subscriptions: subscriptions.filter(s => s.status === 'EXPIRING').length,
      payments: payments.filter(p => p.status === 'FAILED' || p.status === 'PENDING').length,
    }),
    [jobs, companies, candidateKyc, complaints, applications, subscriptions, payments],
  );
}
