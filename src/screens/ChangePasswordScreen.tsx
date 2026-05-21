import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { changePassword } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS } from '../theme/colors';

export default function ChangePasswordScreen({ navigation }: any) {
  const { auth } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!auth) return;
    if (!current || !newPass || !confirm) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola'); return;
    }
    if (newPass !== confirm) {
      Alert.alert('Błąd', 'Nowe hasła nie są identyczne'); return;
    }
    try {
      setLoading(true);
      await changePassword(auth.userId, current, newPass);
      Alert.alert('Sukces', 'Hasło zostało zmienione');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Błąd', e.response?.data?.message ?? 'Nie udało się zmienić hasła');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Zmień hasło</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Anuluj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="AKTUALNE HASŁO"
          value={current} onChangeText={setCurrent}
          placeholder="Wpisz aktualne hasło"
          secureTextEntry icon="lock-outline"
        />
        <Input
          label="NOWE HASŁO"
          value={newPass} onChangeText={setNewPass}
          placeholder="Wpisz nowe hasło"
          secureTextEntry icon="lock-outline"
        />
        <Input
          label="POWTÓRZ NOWE HASŁO"
          value={confirm} onChangeText={setConfirm}
          placeholder="Powtórz nowe hasło"
          secureTextEntry icon="lock-outline"
        />
        <View style={styles.spacer} />
        <Button title="Zapisz nowe hasło" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16, paddingTop: 52,
  },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  cancelText: { color: COLORS.primary, fontSize: 15 },
  scrollContent: { padding: 16 },
  spacer: { height: 24 },
});