import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Award, BriefcaseBusiness, FileText, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { AdminScreen, Panel, SectionTitle } from '../components/AdminUi';
import { PLATFORM_TOTALS } from '../data/sampleAdmin';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
const CHART_HEIGHT = vs(120);

function Kpi({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <Panel style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: `${color}1A` }]}>
        <Icon size={scale(18)} color={color} />
      </View>
      <AppText style={styles.kpiValue}>{value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </Panel>
  );
}

/** Simple bar chart drawn with Views (no chart library in the app). */
function BarChart({ values, labels, highlightLast }: { values: number[]; labels: string[]; highlightLast?: boolean }) {
  const max = Math.max(...values);
  return (
    <View>
      <View style={[styles.chart, { height: CHART_HEIGHT }]}>
        {values.map((v, i) => {
          const isPeak = highlightLast ? i === values.length - 1 : v === max;
          return (
            <View key={labels[i]} style={styles.barCol}>
              <AppText style={[styles.barValue, isPeak && { color: colors.primary }]}>
                {v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
              </AppText>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(vs(6), (v / max) * (CHART_HEIGHT - vs(20))) },
                  isPeak ? styles.barPeak : null,
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.axis}>
        {labels.map(l => (
          <AppText key={l} variant="caption" color="textMuted" align="center" style={styles.axisLabel}>
            {l}
          </AppText>
        ))}
      </View>
    </View>
  );
}

/** Reports & Analytics – platform totals, sign-up & application trends, top cities. */
export default function AdminReportsScreen() {
  const t = PLATFORM_TOTALS;
  const placementRate = ((t.placements / t.applications) * 100).toFixed(1);
  const weekTotal = t.weeklySignups.reduce((a, b) => a + b, 0);

  return (
    <AdminScreen title="Reports & Analytics" subtitle="Last updated just now">
      <View style={styles.kpiRow}>
        <Kpi icon={Users} label="Total users" value={(t.jobSeekers + t.recruiters).toLocaleString('en-IN')} color="#4F6EF7" />
        <Kpi icon={BriefcaseBusiness} label="Live jobs" value={t.liveJobs.toLocaleString('en-IN')} color="#A855F7" />
      </View>
      <View style={styles.kpiRow}>
        <Kpi icon={FileText} label="Applications" value={t.applications.toLocaleString('en-IN')} color={colors.info} />
        <Kpi icon={Award} label="Placements" value={t.placements.toLocaleString('en-IN')} color={colors.success} />
      </View>

      <SectionTitle title="New Sign-ups (this week)" />
      <Panel>
        <AppText variant="caption" color="textSecondary" style={styles.chartCaption}>
          {weekTotal.toLocaleString('en-IN')} new users • ↑ 14% vs last week
        </AppText>
        <BarChart values={t.weeklySignups} labels={DAYS} />
      </Panel>

      <SectionTitle title="Applications per Month" />
      <Panel>
        <AppText variant="caption" color="textSecondary" style={styles.chartCaption}>
          Placement rate {placementRate}% of all applications
        </AppText>
        <BarChart values={t.monthlyApplications} labels={MONTHS} highlightLast />
      </Panel>

      <SectionTitle title="Top Hiring Cities" />
      <Panel>
        {t.topLocations.map(loc => (
          <View key={loc.name} style={styles.cityRow}>
            <View style={styles.cityHead}>
              <AppText variant="bodyBold">{loc.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {Math.round(loc.share * 100)}%
              </AppText>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${loc.share * 100 / t.topLocations[0].share}%` }]} />
            </View>
          </View>
        ))}
      </Panel>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: spacing.md },
  kpi: { flex: 1, gap: vs(4) },
  kpiIcon: { width: scale(36), height: scale(36), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: font(20), fontWeight: '800', color: colors.text, marginTop: vs(4) },
  chartCaption: { marginBottom: vs(10) },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: vs(4) },
  barValue: { fontSize: font(9.5), fontWeight: '700', color: colors.textSecondary },
  bar: { width: '100%', maxWidth: scale(28), borderRadius: scale(6), backgroundColor: colors.primarySoft },
  barPeak: { backgroundColor: colors.primary },
  axis: { flexDirection: 'row', gap: spacing.sm, marginTop: vs(6) },
  axisLabel: { flex: 1 },
  cityRow: { marginBottom: vs(12) },
  cityHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: vs(6) },
  track: { height: vs(8), borderRadius: radius.pill, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
});
