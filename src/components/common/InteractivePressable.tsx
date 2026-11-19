import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable as NativePressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  /** Expanding circular fill used for primary actions. */
  radialFill?: boolean;
};

/** Shared interaction treatment for controls on touch and mouse devices. */
export default function InteractivePressable({
  style,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  onLayout,
  disabled,
  radialFill = false,
  children,
  ...props
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [diameter, setDiameter] = useState(0);
  const fillProgress = useRef(new Animated.Value(0)).current;

  const animateFill = (visible: boolean) => {
    Animated.timing(fillProgress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 220 : 160,
      useNativeDriver: true,
    }).start();
  };

  const fillStyle = diameter
    ? {
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        left: -diameter / 2,
        top: -diameter / 2,
        transform: [
          {
            scale: fillProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ],
      }
    : undefined;

  return (
    <NativePressable
      {...props}
      disabled={disabled}
      onHoverIn={event => {
        setHovered(true);
        if (radialFill) animateFill(true);
        onHoverIn?.(event);
      }}
      onHoverOut={event => {
        setHovered(false);
        if (radialFill && !pressed) animateFill(false);
        onHoverOut?.(event);
      }}
      onPressIn={event => {
        setPressed(true);
        if (radialFill) animateFill(true);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        setPressed(false);
        if (radialFill && !hovered) animateFill(false);
        onPressOut?.(event);
      }}
      onLayout={event => {
        if (radialFill) {
          const { width, height } = event.nativeEvent.layout;
          setDiameter(Math.hypot(width, height) * 2);
        }
        onLayout?.(event);
      }}
      style={state => [
        typeof style === 'function' ? style(state) : style,
        radialFill && styles.clipFill,
        !disabled && hovered && styles.hovered,
        !disabled && state.pressed && styles.pressed,
      ]}>
      {state => (
        <>
          {radialFill && diameter ? (
            <Animated.View pointerEvents="none" style={[styles.radialFill, fillStyle]} />
          ) : null}
          {typeof children === 'function' ? children(state) : children}
        </>
      )}
    </NativePressable>
  );
}

const styles = StyleSheet.create({
  clipFill: { overflow: 'hidden' },
  hovered: { opacity: 0.9 },
  pressed: { opacity: 0.78 },
  radialFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
});
