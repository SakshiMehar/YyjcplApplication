import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { colors, scale, sizes } from '../../theme';
import AppInput, { AppInputProps } from './AppInput';
import Pressable from './InteractivePressable';

type Props = Omit<AppInputProps, 'secureTextEntry' | 'leftElement' | 'rightElement'> & {
  leftElement?: React.ReactNode;
};

/** Password field with a lock icon and a show / hide (eye) toggle. */
export default function PasswordInput({ leftElement, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <AppInput
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      {...props}
      secureTextEntry={!visible}
      leftElement={
        leftElement === undefined ? (
          <Lock size={sizes.iconSm} color={colors.textMuted} />
        ) : (
          leftElement
        )
      }
      rightElement={
        <Pressable
          onPress={() => setVisible(v => !v)}
          hitSlop={scale(10)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
          <ToggleIcon size={sizes.iconSm} color={colors.textMuted} />
        </Pressable>
      }
    />
  );
}
