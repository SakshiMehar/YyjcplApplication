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
      fieldStyle={multiline ? styles.multilineField : undefined}
      style={multiline ? styles.multiline : undefined}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // AppInput has a fixed single-line field height. Expand that container as
  // well as the TextInput so a multiline field cannot overlap following text.
  multilineField: { height: undefined, minHeight: 112, alignItems: 'stretch', paddingVertical: 12 },
  multiline: { minHeight: 88, paddingTop: 0, paddingBottom: 0 },
});
