import React, { useState } from 'react';
import {
  View, TextInput, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: any;
  editable?: boolean;
}

export default function Input({
  label, value, onChangeText, placeholder,
  secureTextEntry, icon, multiline, maxLength,
  keyboardType, editable = true,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        {icon && (
          <Icon name={icon} size={18} color={COLORS.textLight} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20} color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {maxLength && (
        <Text style={styles.counter}>{value.length}/{maxLength}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 11, fontWeight: '600',
    color: COLORS.textGray, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.inputBorder,
    borderRadius: 12, backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14, minHeight: 50,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: COLORS.textDark },
  multiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  counter: {
    fontSize: 11, color: COLORS.textLight,
    textAlign: 'right', marginTop: 4,
  },
});