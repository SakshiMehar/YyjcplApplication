import React from 'react';
import { StyleSheet, type TextInputProps } from 'react-native';
import { AppInput } from '../../../components/common';

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'multiline'> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
};

export default function FormInput({
  label,
  value,
  onChangeText,
  multiline,
  placeholder,
  ...rest
}: Props) {
  return (
    <AppInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      placeholder={placeholder ?? label}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={multiline ? styles.multiline : undefined}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 112, paddingTop: 12 },
});
