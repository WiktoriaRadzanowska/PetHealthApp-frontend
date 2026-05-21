import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({
  title, onPress, variant = 'primary', loading, disabled
}: Props) {
  const variantStyle = {
    primary: {
      bg: COLORS.primary,
      text: COLORS.white,
      border: 'transparent',
    },
    secondary: {
      bg: COLORS.background,
      text: COLORS.textDark,
      border: COLORS.inputBorder,
    },
    danger: {
      bg: 'transparent',
      text: COLORS.danger,
      border: COLORS.danger,
    },
    outline: {
      bg: 'transparent',
      text: COLORS.primary,
      border: COLORS.primary,
    },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: variantStyle.bg, borderColor: variantStyle.border },
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={variantStyle.text} />
        : <Text style={[styles.text, { color: variantStyle.text }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1.5,          // ← przeniesione tutaj
  },
  text: { fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});