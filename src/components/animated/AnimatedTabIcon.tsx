import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

type Props = {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
};

export default function AnimatedTabIcon({ Icon, color, focused }: Props) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.12] }) }],
      }}>
      <Icon size={22} color={color} />
    </Animated.View>
  );
}
