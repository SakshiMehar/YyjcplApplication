/* eslint-disable react-native/no-inline-styles -- every size is computed from the `size` prop */
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

type Props = {
  /** Square box the whole scene fits in. */
  size: number;
  image: ImageSourcePropType;
  /** Floating tiles etc. drawn on top (use <FloatingTile />). */
  children?: React.ReactNode;
};

/**
 * Character artwork on a soft orange circle – used by onboarding screens
 * when a real 3D image is available.
 */
export default function ImageScene({ size: s, image, children }: Props) {
  const asset = Image.resolveAssetSource(image);
  const ratio = asset?.width && asset?.height ? asset.width / asset.height : 1;
  const imgW = ratio >= 1 ? s * 0.94 : s * 0.94 * ratio;
  const imgH = imgW / ratio;
  const circle = s * 0.84;

  return (
    <View style={{ width: s, height: s }}>
      <View
        style={[
          styles.abs,
          {
            width: circle,
            height: circle,
            borderRadius: circle / 2,
            left: (s - circle) / 2,
            top: (s - circle) / 2,
            backgroundColor: colors.primaryLight,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            width: circle * 0.7,
            height: circle * 0.7,
            borderRadius: circle * 0.35,
            left: (s - circle * 0.7) / 2,
            top: (s - circle * 0.7) / 2,
            backgroundColor: colors.primarySoft,
            opacity: 0.45,
          },
        ]}
      />
      <Image
        source={image}
        resizeMode="contain"
        style={[styles.abs, { width: imgW, height: imgH, left: (s - imgW) / 2, bottom: s * 0.08 }]}
      />
      {children}
    </View>
  );
}

type TileProps = {
  /** Scene size – the tile scales from it. */
  base: number;
  style: ViewStyle;
  children: React.ReactNode;
};

/** Small white rounded card floating over the scene. */
export function FloatingTile({ base: s, style, children }: TileProps) {
  const d = s * 0.17;
  return (
    <View
      style={[
        styles.abs,
        styles.center,
        {
          width: d,
          height: d,
          borderRadius: d * 0.28,
          backgroundColor: colors.background,
          boxShadow: `0px ${s * 0.015}px ${s * 0.045}px rgba(28, 25, 23, 0.14)`,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
