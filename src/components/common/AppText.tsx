import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, ColorName, MAX_FONT_MULTIPLIER, typography, TypographyVariant } from '../../theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
};

export default function AppText({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: Props) {
  return (
    <Text
      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
