/* eslint-disable react-native/no-inline-styles -- every size is computed from the `size` prop */
import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';

type Props = { size: number; tone?: 'orange' | 'soft' };

/** Simple person avatar (head + shoulders) drawn with Views. */
export default function Avatar({ size: d, tone = 'orange' }: Props) {
  const bg = tone === 'orange' ? colors.primaryLight : colors.primarySoft;
  const ink = tone === 'orange' ? colors.primary : colors.primaryDark;

  return (
    <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: bg, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          width: d * 0.4,
          height: d * 0.4,
          borderRadius: d * 0.2,
          left: d * 0.3,
          top: d * 0.17,
          backgroundColor: ink,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: d * 0.8,
          height: d * 0.8,
          borderRadius: d * 0.4,
          left: d * 0.1,
          top: d * 0.62,
          backgroundColor: ink,
        }}
      />
    </View>
  );
}
