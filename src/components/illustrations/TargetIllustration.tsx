/* eslint-disable react-native/no-inline-styles -- every size is computed from the `size` prop */
import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';
import Chip from './Chip';

const COS = Math.cos((35 * Math.PI) / 180);
const SIN = Math.sin((35 * Math.PI) / 180);

/** Onboarding 1 – "Find your dream job": target with an arrow in the bullseye. */
export default function TargetIllustration({ size: s }: { size: number }) {
  const cx = s * 0.52;
  const cy = s * 0.54;
  const rings: [number, string][] = [
    [0.58, colors.primary],
    [0.46, colors.background],
    [0.34, colors.primary],
    [0.22, colors.background],
    [0.1, colors.primaryDark],
  ];

  // arrow: tip in the centre, tail up-right
  const len = s * 0.42;
  const thick = Math.max(2, s * 0.022);
  const midX = cx + (len / 2) * COS;
  const midY = cy - (len / 2) * SIN;
  const tailX = cx + len * COS;
  const tailY = cy - len * SIN;
  const fin = s * 0.075;

  return (
    <View style={{ width: s, height: s }}>
      <Circle d={s * 0.86} x={s * 0.5} y={s * 0.5} color={colors.primaryLight} />
      <Circle d={s * 0.05} x={s * 0.1} y={s * 0.22} color={colors.primarySoft} />
      <Circle d={s * 0.03} x={s * 0.88} y={s * 0.14} color={colors.primarySoft} />

      {rings.map(([r, color], i) => (
        <Circle
          key={r}
          d={s * r}
          x={cx}
          y={cy}
          color={color}
          shadow={i === 0 ? `0px ${s * 0.03}px ${s * 0.06}px rgba(226, 90, 11, 0.3)` : undefined}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          width: len,
          height: thick,
          left: midX - len / 2,
          top: midY - thick / 2,
          borderRadius: thick,
          backgroundColor: colors.text,
          transform: [{ rotate: '-35deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: fin,
          height: fin,
          left: tailX - fin / 2,
          top: tailY - fin / 2,
          borderRadius: s * 0.012,
          backgroundColor: colors.primaryDark,
          transform: [{ rotate: '10deg' }],
        }}
      />

      <Chip base={s} label="Top Companies" style={{ left: 0, top: s * 0.12 }} />
      <Chip base={s} label="1,200+ Jobs" style={{ right: 0, bottom: s * 0.06 }} />
    </View>
  );
}

function Circle({
  d,
  x,
  y,
  color,
  shadow,
}: {
  d: number;
  x: number;
  y: number;
  color: string;
  shadow?: string;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        width: d,
        height: d,
        borderRadius: d / 2,
        left: x - d / 2,
        top: y - d / 2,
        backgroundColor: color,
        boxShadow: shadow,
      }}
    />
  );
}
