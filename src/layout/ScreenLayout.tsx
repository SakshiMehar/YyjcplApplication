import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import AppHeader, { AppHeaderProps } from './header/AppHeader';
import MainContent from './main/MainContent';
import AppFooter from './footer/AppFooter';

type Props = AppHeaderProps & {
  showHeader?: boolean;
  footer?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Screens inside a bottom-tab navigator don't need the bottom inset. */
  edges?: Edge[];
  /** Background of the MAIN area (default: light grey surface). */
  mainBackground?: string;
  /** Style for the full-screen root, e.g. a gradient `backgroundImage`. */
  rootStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Every screen = HEADER + MAIN + FOOTER
 *
 *   <ScreenLayout title="Jobs" footer={<AppButton title="Apply" />}>
 *     ...main content...
 *   </ScreenLayout>
 */
export default function ScreenLayout({
  title,
  showBack,
  right,
  showHeader = true,
  footer,
  scroll,
  padded,
  edges = ['top', 'bottom'],
  mainBackground,
  rootStyle,
  children,
}: Props) {
  return (
    <SafeAreaView style={[styles.root, rootStyle]} edges={edges}>
      {showHeader && <AppHeader title={title} showBack={showBack} right={right} />}
      <MainContent scroll={scroll} padded={padded} backgroundColor={mainBackground}>
        {children}
      </MainContent>
      {footer ? <AppFooter>{footer}</AppFooter> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
