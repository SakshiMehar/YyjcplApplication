import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Search,
  ShieldOff,
  UserRound,
  X,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { SharedRoutes } from '../../../navigation/types';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, spacing, vs } from '../../../theme';
import {
  useGetBlockedJobSeekersQuery,
  useBlockJobSeekerMutation,
  useUnblockJobSeekerMutation,
  BlockedJobSeekerEntry,
} from '../api/recruiterApi';
import { useGetJobApplicationsQuery } from '../api/recruiterApi';

export default function BlockedJobSeekersScreen() {
  const navigation = useNavigation<NavigationProp<SharedRoutes>>();
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: blocked = [], isLoading } = useGetBlockedJobSeekersQuery();
  const { data: applications = [] } = useGetJobApplicationsQuery();
  const [blockJobSeeker, { isLoading: isBlocking }] = useBlockJobSeekerMutation();
  const [unblockJobSeeker] = useUnblockJobSeekerMutation();

  // Build unique applicant list from applications for suggestions
  const allApplicants = useMemo(() => {
    const seen = new Set<number>();
    return applications
      .filter(a => {
        const id = a.jobSeekerId;
        return id && !seen.has(id) && seen.add(id);
      })
      .map(a => ({
        id: a.jobSeekerId,
        name: a.jobSeekerProfile?.name ?? a.applicantName ?? a.jobSeekerName ?? `Applicant #${a.jobSeekerId}`,
      }));
  }, [applications]);

  const blockedIds = new Set(blocked.map(b => b.targetUserId));

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allApplicants
      .filter(a => a.name.toLowerCase().includes(q) && !blockedIds.has(a.id))
      .slice(0, 8);
  }, [search, allApplicants, blockedIds]);

  const handleBlock = (jobSeekerId: number, name: string) => {
    Alert.alert(
      `Block ${name}?`,
      'This job seeker will not be able to see your job posts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block', style: 'destructive',
          onPress: async () => {
            try {
              await blockJobSeeker({ jobSeekerId }).unwrap();
              setSearch('');
              setShowSuggestions(false);
            } catch {
              Alert.alert('Could not block', 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleUnblock = (entry: BlockedJobSeekerEntry) => {
    const name = entry.jobSeekerName ?? `Job Seeker #${entry.targetUserId}`;
    Alert.alert(
      `Unblock ${name}?`,
      'They will be able to see your job posts again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await unblockJobSeeker({ jobSeekerId: entry.targetUserId }).unwrap();
            } catch {
              Alert.alert('Could not unblock', 'Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={navigation.goBack}
          hitSlop={scale(12)}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={scale(22)} color={colors.text} />
        </Pressable>
        <AppText style={styles.headerTitle}>Blocked Job Seekers</AppText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <AppText style={styles.subtitle}>
          Job seekers you block will not be able to see your job listings or contact you.
        </AppText>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Search size={scale(16)} color={colors.primary} />
            <TextInput
              value={search}
              onChangeText={t => { setSearch(t); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              returnKeyType="done"
              onSubmitEditing={() => setShowSuggestions(false)}
              placeholder="Search applicants"
              placeholderTextColor={colors.textMuted}
              maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => { setSearch(''); setShowSuggestions(false); }} hitSlop={scale(8)}>
                <X size={scale(15)} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map(a => (
                <Pressable
                  key={a.id}
                  onPress={() => handleBlock(a.id, a.name)}
                  disabled={isBlocking}
                  style={({ pressed }) => [styles.suggestionItem, pressed && { backgroundColor: colors.surface }]}>
                  <View style={styles.suggestionIcon}>
                    <UserRound size={scale(14)} color={colors.primary} />
                  </View>
                  <AppText variant="body" numberOfLines={1} style={styles.suggestionText}>
                    {a.name}
                  </AppText>
                  <AppText variant="caption" style={styles.suggestionBlock}>Block</AppText>
                </Pressable>
              ))}
            </View>
          )}

          {showSuggestions && search.trim().length > 0 && suggestions.length === 0 && (
            <View style={styles.noSuggestions}>
              <AppText variant="caption" color="textMuted">No applicants found for "{search}"</AppText>
            </View>
          )}
        </View>

        {/* Blocked list */}
        <AppText style={styles.blockedHeading}>Job seekers you blocked</AppText>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: vs(20) }} />
        ) : blocked.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <ShieldOff size={scale(28)} color={colors.textMuted} />
            </View>
            <AppText style={styles.emptyText}>
              No job seekers blocked yet. Search above to block someone.
            </AppText>
          </View>
        ) : (
          <View style={styles.chips}>
            {blocked.map((entry, i) => {
              const name = entry.jobSeekerName ?? `Job Seeker #${entry.targetUserId}`;
              return (
                <View key={`${entry.targetUserId ?? i}-${i}`} style={styles.chip}>
                  <UserRound size={scale(13)} color={colors.text} />
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

        <View style={styles.footerNote}>
          <AppText style={styles.footerNoteText}>
            💡 Blocked job seekers cannot view your job listings or apply to your positions.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    height: vs(56), flexDirection: 'row', alignItems: 'center',
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
  subtitle: {
    color: colors.textSecondary, fontSize: font(14),
    lineHeight: vs(20), marginBottom: vs(28),
  },
  searchSection: { marginBottom: vs(28) },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.primary,
    paddingHorizontal: spacing.md, height: vs(48),
  },
  searchInput: { flex: 1, fontSize: font(14), color: colors.text, padding: 0 },
  suggestions: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    marginTop: vs(4), overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.08, shadowRadius: scale(8), elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  suggestionIcon: {
    width: scale(28), height: scale(28), borderRadius: scale(14),
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  suggestionText: { flex: 1 },
  suggestionBlock: { color: colors.primary, fontWeight: '700', fontSize: font(12) },
  noSuggestions: {
    padding: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, marginTop: vs(4),
  },
  blockedHeading: {
    color: colors.text, fontSize: font(16),
    fontWeight: '700', marginBottom: vs(14),
  },
  chips: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: scale(10), marginBottom: vs(24),
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: scale(7),
    borderRadius: scale(24), borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: vs(7),
    maxWidth: '70%',
  },
  chipText: {
    color: colors.text, fontSize: font(13),
    fontWeight: '600', flexShrink: 1,
  },
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
  footerNote: {
    backgroundColor: colors.primaryLight, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.primarySoft, padding: spacing.md,
  },
  footerNoteText: { color: colors.textSecondary, fontSize: font(13), lineHeight: vs(18) },
});
