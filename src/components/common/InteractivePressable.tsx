import React, { useState } from 'react';
import {
  Pressable as NativePressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

/** Shared interaction treatment for controls on touch and mouse devices. */
export default function InteractivePressable({ style, onHoverIn, onHoverOut, disabled, ...props }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <NativePressable
      {...props}
      disabled={disabled}
      onHoverIn={event => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={event => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={state => [
        typeof style === 'function' ? style(state) : style,
        !disabled && hovered && styles.hovered,
        !disabled && state.pressed && styles.pressed,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  hovered: { opacity: 0.9 },
  pressed: { opacity: 0.78 },
});
