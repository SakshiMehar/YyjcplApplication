import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, sizes, spacing } from '../../theme';
import AppText from './AppText';
import Pressable from './InteractivePressable';

type Props = Omit<TextInputProps, 'style'> & {
  /** Shows the filter button on the right. */
  onFilterPress?: () => void;
  /**
   * Turns the bar into a button (no typing) – e.g. on Home it opens the Search screen.
   */
  onPress?: () => void;
};

/** Rounded search field with a search icon and an optional filter button. */
export default function SearchBar({ onFilterPress, onPress, placeholder, ...inputProps }: Props) {
  const filter = onFilterPress ? (
    <Pressable
      onPress={onFilterPress}
      hitSlop={scale(8)}
      accessibilityRole="button"
      accessibilityLabel="Filters"
      style={styles.filter}>
      <SlidersHorizontal size={sizes.iconSm} color={colors.primary} />
    </Pressable>
  ) : null;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="search"
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
        <Search size={sizes.iconSm} color={colors.textMuted} />
        <AppText color="textMuted" numberOfLines={1} style={styles.placeholder}>
          {placeholder}
        </AppText>
        {filter}
      </Pressable>
    );
  }

  return (
    <View style={styles.bar}>
      <Search size={sizes.iconSm} color={colors.textMuted} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        returnKeyType="search"
        style={styles.input}
        {...inputProps}
      />
      {filter}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: sizes.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.8 },
  placeholder: { flex: 1 },
  input: { flex: 1, height: '100%', padding: 0, fontSize: font(15), color: colors.text },
  filter: {
    width: sizes.inputHeight - spacing.sm * 2,
    height: sizes.inputHeight - spacing.sm * 2,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
});
