import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { registerApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS } from '../../theme/colors';

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }
    try {
      setLoading(true);
      const { data } = await registerApi(email, password, firstName, lastName);
      await login({
        userId: data.userId, email: data.email,
        firstName: data.firstName, token: data.token,
      });
    } catch (e: any) {
      Alert.alert('Błąd', e.response?.data?.message ?? 'Nie udało się zarejestrować');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Icon name="heart-outline" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.appName}>PetHealth</Text>
        <Text style={styles.tagline}>Dołącz do nas</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.hint}>Zarejestruj się, aby zobaczyć swojego pupila</Text>

        <Input value={firstName} onChangeText={setFirstName}
          placeholder="Imię" icon="account-outline" />
        <Input value={lastName} onChangeText={setLastName}
          placeholder="Nazwisko" icon="account-outline" />
        <Input value={email} onChangeText={setEmail}
          placeholder="Adres e-mail" icon="email-outline"
          keyboardType="email-address" />
        <Input value={password} onChangeText={setPassword}
          placeholder="Hasło" icon="lock-outline" secureTextEntry />
        <Input value={confirmPassword} onChangeText={setConfirmPassword}
          placeholder="Powtórz hasło" icon="lock-outline" secureTextEntry />

        <View style={styles.spacer} />
        <Button title="Zarejestruj się" onPress={handleRegister} loading={loading} />
        <View style={styles.spacerSm} />
        <Button
          title="Mam już konto"
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  appName: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  form: {
    flex: 1, backgroundColor: COLORS.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24,
  },
  hint: { fontSize: 13, color: COLORS.textGray, marginBottom: 20 },
  spacer: { height: 16 },
  spacerSm: { height: 12 },
});