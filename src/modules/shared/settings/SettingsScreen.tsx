import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { clearToken } from '../../../services/secureStorage';
import { signOutFirebase } from '../../../services/firebase/auth';
import { baseApi } from '../../../store/api/baseApi';
import { logout } from '../../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

/**
 * Settings
 * Account, privacy, help, complaints and logout.
 */
export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const user = useAppSelector(s => s.auth.user);

  const onLogout = async () => {
    await clearToken();
    await signOutFirebase().catch(() => {});
    dispatch(baseApi.util.resetApiState());
    dispatch(logout());
  };

  return (
    <ScreenLayout
      title="Settings"
      footer={<AppButton title="Logout" variant="outline" onPress={onLogout} style={styles.flex} />}>
      <Card>
        <AppText variant="h3">{user?.name}</AppText>
        <AppText color="textSecondary">+91 {user?.phone}</AppText>
      </Card>
      <Card onPress={() => navigation.navigate('RaiseComplaint' as never)}>
        <AppText variant="bodyBold">Raise a complaint</AppText>
        <AppText color="textSecondary">Report an issue to YYJCPL support</AppText>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
