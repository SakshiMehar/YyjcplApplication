import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../../theme';

type AnimatedContainerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type AppearProps = AnimatedContainerProps & {
  delay?: number;
  index?: number;
  from?: 'up' | 'down' | 'left' | 'right' | 'zoom';
};

export function Appear({ children, delay = 0, index = 0, from = 'up', style }: AppearProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 360,
      delay: delay + index * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, index, progress]);

  const distance = from === 'left' ? -14 : from === 'right' ? 14 : from === 'down' ? -14 : 14;
  const translateX = from === 'left' || from === 'right' ? distance : 0;
  const translateY = from === 'up' || from === 'down' ? distance : 0;

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [translateX, 0] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [translateY, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [from === 'zoom' ? 0.92 : 1, 1] }) },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

type FloatingProps = AnimatedContainerProps & { distance?: number };

export function Floating({ children, distance = 7, style }: FloatingProps) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [offset]);

  return (
    <Animated.View
      style={[
        style,
        { transform: [{ translateY: offset.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }] },
      ]}>
      {children}
    </Animated.View>
  );
}

type Tilt3DProps = AnimatedContainerProps & { float?: boolean };

export function Tilt3D({ children, float = false, style }: Tilt3DProps) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!float) return undefined;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, { toValue: 1, duration: 1700, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [float, offset]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: float ? offset.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) : 0 },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

type AnimatedNumberProps = {
  value: number;
  style?: StyleProp<TextStyle>;
};

export function AnimatedNumber({ value, style }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentValue = useRef(value);

  useEffect(() => {
    const startValue = currentValue.current;
    const progress = new Animated.Value(0);
    const listener = progress.addListener(({ value: nextProgress }) => {
      setDisplayValue(Math.round(startValue + (value - startValue) * nextProgress));
    });
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        currentValue.current = value;
        setDisplayValue(value);
      }
    });

    return () => {
      animation.stop();
      progress.removeListener(listener);
    };
  }, [value]);

  return <Text style={style}>{displayValue}</Text>;
}

type SkeletonProps = { style?: StyleProp<ViewStyle> };

function SkeletonBlock({ style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.skeletonBlock, style, { opacity }]} />;
}

export function SkeletonCard({ style }: SkeletonProps) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <SkeletonBlock style={styles.skeletonTitle} />
      <SkeletonBlock style={styles.skeletonLine} />
      <SkeletonBlock style={styles.skeletonShortLine} />
    </View>
  );
}

type SkeletonListProps = SkeletonProps & {
  count?: number;
  variant?: 'row' | 'card';
};

export function SkeletonList({ count = 3, variant = 'row', style }: SkeletonListProps) {
  return (
    <View style={[styles.skeletonList, style]}>
      {Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) =>
        variant === 'card' ? (
          <SkeletonCard key={index} />
        ) : (
          <View key={index} style={styles.skeletonRow}>
            <SkeletonBlock style={styles.skeletonAvatar} />
            <View style={styles.skeletonText}>
              <SkeletonBlock style={styles.skeletonTitle} />
              <SkeletonBlock style={styles.skeletonLine} />
            </View>
          </View>
        ),
      )}
    </View>
  );
}

type CelebrateContextValue = (message: string) => void;
const CelebrateContext = createContext<CelebrateContextValue | null>(null);

export function CelebrateProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(
    () => () => {
      activeAnimation.current?.stop();
    },
    [],
  );

  const celebrate = (nextMessage: string) => {
    activeAnimation.current?.stop();
    setMessage(nextMessage);
    opacity.setValue(0);
    const animation = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]);
    activeAnimation.current = animation;
    animation.start(({ finished }) => {
      if (finished) setMessage(null);
    });
  };

  return (
    <CelebrateContext.Provider value={celebrate}>
      <View style={styles.provider}>
        {children}
        {message ? (
          <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
            <Text style={styles.toastText}>{message}</Text>
          </Animated.View>
        ) : null}
      </View>
    </CelebrateContext.Provider>
  );
}

export function useCelebrate(): CelebrateContextValue {
  const celebrate = useContext(CelebrateContext);
  if (!celebrate) throw new Error('useCelebrate must be used within CelebrateProvider');
  return celebrate;
}

type LottieAnimationProps = { name: string; size?: number; style?: StyleProp<ViewStyle> };

// Animation assets are optional until files are added under src/assets/lottie.
export function LottieAnimation(_props: LottieAnimationProps) {
  return null;
}

type RiveAnimationProps = { name: string; style?: StyleProp<ViewStyle> };

// Animation assets are optional until files are added under src/assets/rive.
export function RiveAnimation(_props: RiveAnimationProps) {
  return null;
}

export { default as AnimatedTabIcon } from './AnimatedTabIcon';

const styles = StyleSheet.create({
  provider: { flex: 1 },
  toast: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    maxWidth: '90%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
  },
  toastText: { color: colors.textOnPrimary, fontWeight: '600' },
  skeletonList: { gap: spacing.md },
  skeletonCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  skeletonText: { flex: 1, gap: spacing.sm },
  skeletonBlock: { borderRadius: radius.sm, backgroundColor: colors.border },
  skeletonAvatar: { width: 42, height: 42, borderRadius: radius.pill },
  skeletonTitle: { width: '55%', height: 14 },
  skeletonLine: { width: '80%', height: 10 },
  skeletonShortLine: { width: '42%', height: 10 },
});
