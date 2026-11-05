import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/common';
import { radius, spacing } from '../../../theme';
import type { ResumeDocument } from '../types/resume.types';

type Props = {
  resume: ResumeDocument;
  accent: string;
  variant: 'professional' | 'modern' | 'minimal' | 'creative';
};

function ResumeSection({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <View style={styles.section}>
      <AppText
        variant="caption"
        style={[styles.sectionTitle, { color: accent }]}
      >
        {title.toUpperCase()}
      </AppText>
      <View style={[styles.rule, { backgroundColor: accent }]} />
      {children}
    </View>
  );
}

export default function ResumeTemplateLayout({
  resume,
  accent,
  variant,
}: Props) {
  const sideBar = variant === 'modern';
  const headerStyle = { backgroundColor: sideBar ? accent : '#FFFFFF' };
  const nameStyle = { color: sideBar ? '#FFFFFF' : accent };
  const contactStyle = { color: sideBar ? '#E6FFFB' : '#57534E' };
  return (
    <View style={styles.paper}>
      <View style={[styles.header, headerStyle]}>
        <AppText variant="h2" style={nameStyle}>
          {resume.personal.fullName || 'Your name'}
        </AppText>
        <AppText variant="caption" style={contactStyle}>
          {[
            resume.personal.email,
            resume.personal.phone,
            resume.personal.location,
          ]
            .filter(Boolean)
            .join('  ·  ') || 'Email · Phone · Location'}
        </AppText>
      </View>
      {resume.personal.summary ? (
        <ResumeSection title="Profile" accent={accent}>
          <AppText variant="caption" color="textSecondary">
            {resume.personal.summary}
          </AppText>
        </ResumeSection>
      ) : null}
      {resume.experience.length ? (
        <ResumeSection title="Experience" accent={accent}>
          {resume.experience.map(item => (
            <View key={item.id} style={styles.entry}>
              <AppText variant="bodyBold">
                {item.role || item.title || 'Position'}
                {item.company ? ` · ${item.company}` : ''}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {[
                  item.duration,
                  [item.startDate, item.endDate].filter(Boolean).join(' — '),
                ]
                  .filter(Boolean)
                  .join(' — ')}
              </AppText>
              {item.description ? (
                <AppText variant="caption" color="textSecondary">
                  {item.description}
                </AppText>
              ) : null}
            </View>
          ))}
        </ResumeSection>
      ) : null}
      {resume.education.length ? (
        <ResumeSection title="Education" accent={accent}>
          {resume.education.map(item => (
            <View key={item.id} style={styles.entry}>
              <AppText variant="bodyBold">
                {item.degree || 'Degree'}
                {item.institution ? ` · ${item.institution}` : ''}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {[item.startYear, item.endYear].filter(Boolean).join(' — ')}
              </AppText>
            </View>
          ))}
        </ResumeSection>
      ) : null}
      {resume.skills.length ? (
        <ResumeSection title="Skills" accent={accent}>
          <AppText variant="caption" color="textSecondary">
            {resume.skills.join('  ·  ')}
          </AppText>
        </ResumeSection>
      ) : null}
      {resume.projects.length ? (
        <ResumeSection title="Projects" accent={accent}>
          {resume.projects.map(item => (
            <View key={item.id} style={styles.entry}>
              <AppText variant="bodyBold">
                {item.name || 'Project'}
                {item.link ? ` · ${item.link}` : ''}
              </AppText>
              {item.description ? (
                <AppText variant="caption" color="textSecondary">
                  {item.description}
                </AppText>
              ) : null}
            </View>
          ))}
        </ResumeSection>
      ) : null}
      {resume.certifications.length ? (
        <ResumeSection title="Certifications" accent={accent}>
          {resume.certifications.map(item => (
            <View key={item.id} style={styles.entry}>
              <AppText variant="bodyBold">
                {item.name || 'Certification'}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {[item.issuer, item.date].filter(Boolean).join(' · ')}
              </AppText>
            </View>
          ))}
        </ResumeSection>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 440,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  header: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.sm },
  section: { gap: spacing.xs },
  sectionTitle: { fontWeight: '700', letterSpacing: 0.8 },
  rule: { height: 1 },
  entry: { gap: 2, marginBottom: spacing.xs },
});
