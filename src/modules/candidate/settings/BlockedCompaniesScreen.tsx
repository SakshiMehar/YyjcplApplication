import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SkeletonList } from '../../../components/animated';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  Building2,
  ChevronLeft,
  Search,
  ShieldOff,
  X,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { SharedRoutes } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { USER_ROLES } from '../../../constants/roles';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, spacing, vs } from '../../../theme';
import {
  useGetBlockedCompaniesQuery,
  useBlockCompanyMutation,
  useUnblockCompanyMutation,
  useGetJobSeekerJobsQuery,
  BlockedCompanyEntry,
} from '../api/candidateApi';

export default function BlockedCompaniesScreen() {
  const navigation = useNavigation<NavigationProp<SharedRoutes>>();
  const userRole = useAppSelector(state => state.auth.user?.role);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: blocked = [], isLoading: blockedLoading } = useGetBlockedCompaniesQuery();
  const { data: jobs = [] } = useGetJobSeekerJobsQuery();
  const [blockCompany, { isLoading: isBlocking }] = useBlockCompanyMutation();
  const [unblockCompany] = useUnblockCompanyMutation();

  // Build unique company list from jobs for search suggestions
  // Use recruiterId (the recruiter's user ID) — NOT the job ID
  const allCompanies = useMemo(() => {
    const seen = new Set<string>();
    return jobs
      .filter(j => j.companyName && j.recruiterId && !seen.has(j.companyName) && seen.add(j.companyName))
      .map(j => ({ name: j.companyName, id: Number(j.recruiterId) }));
  }, [jobs]);

  // Resolve the recruiter ID from whichever field the backend sends
  const resolveId = (entry: BlockedCompanyEntry): number | undefined =>
    entry.targetUserId ?? entry.recruiterId ?? entry.userId ?? entry.id;

  // Filter suggestions based on search text, excluding already blocked
  const blockedIds = new Set(blocked.map(b => resolveId(b)).filter(Boolean) as number[]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allCompanies
      .filter(c => c.name.toLowerCase().includes(q) && !blockedIds.has(c.id))
      .slice(0, 8);
  }, [search, allCompanies, blockedIds]);

  const handleBlock = (recruiterId: number, companyName: string) => {
    Alert.alert(
      `Block ${companyName}?`,
      'Recruiters from this company will not be able to see your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[BlockedCompanies] Blocking recruiterId:', recruiterId);
              await blockCompany({ recruiterId }).unwrap();
              setSearch('');
              setShowSuggestions(false);
            } catch (e) {
              console.error('[BlockedCompanies] Block failed:', JSON.stringify(e, null, 2));
              Alert.alert('Could not block', 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleUnblock = (entry: BlockedCompanyEntry) => {
    const rid = resolveId(entry);
    const name = entry.companyName ?? entry.recruiterName ?? `Company #${rid}`;
    Alert.alert(
      `Unblock ${name}?`,
      'They will be able to see your profile again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            if (!rid) {
              Alert.alert('Error', 'Could not identify the company to unblock.');
              return;
            }
            try {
              console.log('[BlockedCompanies] Unblocking recruiterId:', rid);
              await unblockCompany({ recruiterId: rid }).unwrap();
            } catch (e) {
              console.error('[BlockedCompanies] Unblock failed:', JSON.stringify(e, null, 2));
              Alert.alert('Could not unblock', 'Please try again.');
            }
          },
        },
      ],
    );
  };

  if (userRole !== USER_ROLES.CANDIDATE) {
    return (
      <ScreenLayout showHeader={false} padded={false}>
        <View style={styles.restricted}>
          <ShieldOff size={scale(40)} color={colors.textMuted} />
          <AppText variant="body" color="textSecondary">
            Blocked companies is only available for job seekers.
          </AppText>
          <Pressable onPress={navigation.goBack} accessibilityRole="button">
            <AppText style={styles.linkText}>Go back</AppText>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <View style={styles.root}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={navigation.goBack}
          hitSlop={scale(12)}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={scale(22)} color={colors.text} />
        </Pressable>
        <AppText style={styles.headerTitle}>Blocked companies</AppText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Title ── */}
        <AppText style={styles.subtitle}>
          Recruiters from companies you block will not be able to see your profile.
        </AppText>

        {/* ── Search ── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Search size={scale(16)} color={colors.primary} />
            <TextInput
              value={search}
              onChangeText={t => { setSearch(t); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              returnKeyType="done"
              onSubmitEditing={() => setShowSuggestions(false)}
              placeholder="Search companies"
              placeholderTextColor={colors.textMuted}
              maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              style={styles.searchInput}
              accessibilityLabel="Search companies to block"
            />
            {search.length > 0 && (
              <Pressable onPress={() => { setSearch(''); setShowSuggestions(false); }} hitSlop={scale(8)}>
                <X size={scale(15)} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* ── Suggestions dropdown ── */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map(c => (
                <Pressable
                  key={c.id}
                  onPress={() => handleBlock(c.id, c.name)}
                  disabled={isBlocking}
                  style={({ pressed }) => [styles.suggestionItem, pressed && { backgroundColor: colors.surface }]}
                  accessibilityRole="button">
                  <View style={styles.suggestionIcon}>
                    <Building2 size={scale(14)} color={colors.primary} />
                  </View>
                  <AppText variant="body" numberOfLines={1} style={styles.suggestionText}>
                    {c.name}
                  </AppText>
                  <AppText variant="caption" style={styles.suggestionBlock}>Block</AppText>
                </Pressable>
              ))}
            </View>
          )}

          {showSuggestions && search.trim().length > 0 && suggestions.length === 0 && (
            <View style={styles.noSuggestions}>
              <AppText variant="caption" color="textMuted">No companies found for "{search}"</AppText>
            </View>
          )}
        </View>

        {/* ── Blocked list ── */}
        <AppText style={styles.blockedHeading}>Companies you blocked</AppText>

        {blockedLoading ? (
          <SkeletonList count={3} style={{ marginTop: vs(12) }} />
        ) : blocked.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <ShieldOff size={scale(28)} color={colors.textMuted} />
            </View>
            <AppText style={styles.emptyText}>
              No companies blocked yet. Search above to block a company.
            </AppText>
          </View>
        ) : (
          <View style={styles.chips}>
            {blocked.map((entry, i) => {
              const rid = resolveId(entry);
              const name = entry.companyName ?? entry.recruiterName ?? `Company #${rid ?? i}`;
              return (
                <View key={`${rid ?? i}-${i}`} style={styles.chip}>
                  <Building2 size={scale(13)} color={colors.text} />
                  <AppText style={styles.chipText} numberOfLines={1}>{name}</AppText>
                  <Pressable
                    onPress={() => handleUnblock(entry)}
                    hitSlop={scale(8)}
                    accessibilityRole="button"
                    accessibilityLabel={`Unblock ${name}`}>
                    <X size={scale(15)} color={colors.textSecondary} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Footer note ── */}
        <View style={styles.footerNote}>
          <AppText style={styles.footerNoteText}>
            💡 Profiles are hidden from blocked companies so they don't know when you search for a job.
          </AppText>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    height: vs(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.text, fontSize: font(20), fontWeight: '700', flex: 1 },
  backBtn: {
    width: scale(36), height: scale(36),
    alignItems: 'center', justifyContent: 'center',
    borderRadius: scale(18),
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: vs(32) },

  /* Title */
  subtitle: {
    color: colors.textSecondary,
    fontSize: font(14),
    lineHeight: vs(20),
    marginBottom: vs(28),
  },

  /* Search */
  searchSection: { marginBottom: vs(28) },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: vs(48),
  },
  searchInput: {
    flex: 1, fontSize: font(14), color: colors.text, padding: 0,
  },

  /* Suggestions */
  suggestions: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: vs(4),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionIcon: {
    width: scale(28), height: scale(28), borderRadius: scale(14),
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  suggestionText: { flex: 1 },
  suggestionBlock: {
    color: colors.primary, fontWeight: '700',
    fontSize: font(12),
  },
  noSuggestions: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: vs(4),
  },

  /* Blocked list */
  blockedHeading: {
    color: colors.text,
    fontSize: font(16),
    fontWeight: '700',
    marginBottom: vs(14),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginBottom: vs(24),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(7),
    borderRadius: scale(24),
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(7),
    maxWidth: '70%',
  },
  chipText: {
    color: colors.text,
    fontSize: font(13),
    fontWeight: '600',
    flexShrink: 1,
  },

  /* Empty */
  emptyWrap: { alignItems: 'center', paddingVertical: vs(24), gap: vs(10) },
  emptyIcon: {
    width: scale(60), height: scale(60), borderRadius: scale(30),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted, fontSize: font(14), lineHeight: vs(20),
    textAlign: 'center', paddingHorizontal: spacing.lg,
  },

  /* Footer note */
  footerNote: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.primarySoft,
    padding: spacing.md,
    marginTop: vs(8),
  },
  footerNoteText: {
    color: colors.textSecondary, fontSize: font(13), lineHeight: vs(18),
  },

  /* Misc */
  restricted: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: spacing.lg, padding: spacing.xl,
  },
  linkText: { color: colors.primary, fontSize: font(15), fontWeight: '600' },
});
