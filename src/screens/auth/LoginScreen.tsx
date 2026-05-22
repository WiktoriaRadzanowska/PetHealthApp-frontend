import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS } from '../../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }
    try {
      setLoading(true);
      const { data } = await loginApi(email, password);
      await login({
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        token: data.token,
      });
    } catch (e: any) {
      Alert.alert('Błąd', e.response?.data?.message ?? 'Nieprawidłowe dane logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Icon name="paw" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.appName}>PetHealth</Text>
        <Text style={styles.tagline}>Zdrowie Twojego pupila w jednym miejscu</Text>
      </View>

      <View style={styles.form}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Zaloguj się, aby zobaczyć swojego pupila</Text>
        </TouchableOpacity>

        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Adres e-mail"
          icon="email-outline"
          keyboardType="email-address"
        />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Hasło"
          icon="lock-outline"
          secureTextEntry
        />

        <View style={styles.buttonGroup}>
          <Button title="Zaloguj się" onPress={handleLogin} loading={loading} />
          <View style={styles.spacer} />
          <Button
            title="Nie masz konta? Zarejestruj się"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 80, paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32, fontWeight: '700', color: COLORS.white, marginBottom: 8,
  },
  tagline: {
    fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center',
  },
  form: {
    flex: 1, backgroundColor: COLORS.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24,
  },
  registerLink: {
    color: COLORS.accentGreen, fontSize: 13,
    textDecorationLine: 'underline', marginBottom: 24,
  },
  buttonGroup: { marginTop: 8 },
  spacer: { height: 12 },
});