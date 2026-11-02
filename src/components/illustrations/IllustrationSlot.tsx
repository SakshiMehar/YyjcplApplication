import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';

type Props = {
  /** Box size: the artwork fits inside `size × size`, keeping its own aspect ratio. */
  size: number;
  /** If set (a PNG from src/assets/illustrations), it replaces the drawn illustration. */
  image?: ImageSourcePropType | null;
  children: React.ReactNode;
};

export default function IllustrationSlot({ size, image, children }: Props) {
  if (image) {
    const asset = Image.resolveAssetSource(image);
    const ratio = asset?.width && asset?.height ? asset.width / asset.height : 1;
    const width = ratio >= 1 ? size : size * ratio;
    const height = ratio >= 1 ? size / ratio : size;
    return <Image source={image} style={{ width, height }} resizeMode="contain" />;
  }
  return <View style={{ width: size, height: size }}>{children}</View>;
}
