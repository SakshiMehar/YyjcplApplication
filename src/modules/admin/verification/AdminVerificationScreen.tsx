import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Check, FileText, Globe, MapPin, RotateCcw, UserRound, Users, X } from 'lucide-react-native';
import { AppText, EmptyState, UserAvatar } from '../../../components/common';
import { AdminScreenProps } from '../../../navigation/types';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import { timeAgo } from '../../../utils/format';
import { ActionButton, AdminScreen, InfoRow, Panel, PillTabs, StatusPill, Tag, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { CompanyVerificationStatus } from '../data/sampleAdmin';

type Kind = 'COMPANIES' | 'CANDIDATES';
type Status = CompanyVerificationStatus;
const TONE: Record<Status, Tone> = { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'danger' };

function Decision({ status, onStatus }: { status: Status; onStatus: (s: Status) => void }) {
  if (status === 'PENDING') {
    return (
      <View style={styles.actions}>
        <ActionButton title="Reject" icon={X} tone="danger" style={styles.flex} onPress={() => onStatus('REJECTED')} />
        <ActionButton title="Verify" icon={Check} tone="success" variant="filled" style={styles.flex} onPress={() => onStatus('VERIFIED')} />
      </View>
    );
  }
  return <ActionButton title="Move back to Pending" icon={RotateCcw} style={styles.single} onPress={() => onStatus('PENDING')} />;
}

/** Verification – company documents (GSTIN, website) and candidate KYC (ID proofs). */
export default function AdminVerificationScreen({ route }: AdminScreenProps<'AdminVerification'>) {
  const { companies, candidateKyc, setCompanyStatus, setKycStatus } = useAdminData();
  const [kind, setKind] = useState<Kind>(route.params?.tab ?? 'COMPANIES');
  const [status, setStatus] = useState<Status>('PENDING');

  const items = kind === 'COMPANIES' ? companies : candidateKyc;
  const count = (s: Status) => items.filter(i => i.status === s).length;
  const pending = (k: Kind) => (k === 'COMPANIES' ? companies : candidateKyc).filter(i => i.status === 'PENDING').length;

  const confirm = (name: string, s: Status, apply: () => void) => {
    const verb = s === 'VERIFIED' ? 'Verify' : s === 'REJECTED' ? 'Reject' : 'Reopen';
    Alert.alert(`${verb} ${name}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: verb, style: s === 'REJECTED' ? 'destructive' : 'default', onPress: apply },
    ]);
  };

  return (
    <AdminScreen
      title="Verification"
      subtitle={`${pending('COMPANIES') + pending('CANDIDATES')} requests waiting`}
      toolbar={
        <>
          <PillTabs<Kind>
            value={kind}
            onChange={setKind}
            tabs={[
              { key: 'COMPANIES', label: 'Companies', count: pending('COMPANIES') },
              { key: 'CANDIDATES', label: 'Candidate KYC', count: pending('CANDIDATES') },
            ]}
          />
          <PillTabs<Status>
            value={status}
            onChange={setStatus}
            tabs={[
              { key: 'PENDING', label: 'Pending', count: count('PENDING') },
              { key: 'VERIFIED', label: 'Verified', count: count('VERIFIED') },
              { key: 'REJECTED', label: 'Rejected', count: count('REJECTED') },
            ]}
          />
        </>
      }>
      {kind === 'COMPANIES'
        ? companies
            .filter(c => c.status === status)
            .map(c => (
              <Panel key={c.id}>
                <View style={styles.head}>
                  <View style={styles.logo}>
                    <AppText style={styles.logoText}>{c.name.slice(0, 2).toUpperCase()}</AppText>
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="bodyBold" numberOfLines={1}>{c.name}</AppText>
                    <AppText variant="caption" color="textSecondary">
                      {c.industry} • submitted {timeAgo(c.submittedAt)}
                    </AppText>
                  </View>
                  <StatusPill label={c.status} tone={TONE[c.status]} />
                </View>
                <View style={styles.info}>
                  <InfoRow icon={UserRound} label="Recruiter" value={c.recruiterName} />
                  <InfoRow icon={MapPin} label="Location" value={c.location} />
                  <InfoRow icon={Users} label="Company Size" value={c.size} />
                  <InfoRow icon={FileText} label="GSTIN" value={c.gstin} />
                  <InfoRow icon={Globe} label="Website" value={c.website} />
                </View>
                <Decision status={c.status} onStatus={s => confirm(c.name, s, () => setCompanyStatus(c.id, s))} />
              </Panel>
            ))
        : candidateKyc
            .filter(k => k.status === status)
            .map(k => (
              <Panel key={k.id}>
                <View style={styles.head}>
                  <UserAvatar name={k.name} size={scale(46)} />
                  <View style={styles.flex}>
                    <AppText variant="bodyBold" numberOfLines={1}>{k.name}</AppText>
                    <AppText variant="caption" color="textSecondary">
                      Job seeker • submitted {timeAgo(k.submittedAt)}
                    </AppText>
                  </View>
                  <StatusPill label={k.status} tone={TONE[k.status]} />
                </View>
                <AppText variant="caption" color="textSecondary" style={styles.docsLabel}>
                  Documents submitted
                </AppText>
                <View style={styles.tags}>
                  {k.documents.map(d => (
                    <Tag key={d} label={d} />
                  ))}
                </View>
                <Decision status={k.status} onStatus={s => confirm(k.name, s, () => setKycStatus(k.id, s))} />
              </Panel>
            ))}
      {count(status) === 0 ? (
        <EmptyState title="Nothing here" message="New verification requests will appear in Pending." />
      ) : null}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: scale(46),
    height: scale(46),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.primary, fontWeight: '800' },
  info: { marginTop: vs(8) },
  docsLabel: { marginTop: vs(12), marginBottom: vs(8), fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: vs(12) },
  single: { marginTop: vs(12) },
});
