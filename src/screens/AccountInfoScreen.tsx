import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserProfile, updateProfile } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS } from '../theme/colors';

export default function AccountInfoScreen({ navigation }: any) {
  const { auth } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    getUserProfile(auth.userId).then(({ data }) => {
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhone(data.phone ?? '');
    });
  }, [auth]);

  const handleSave = async () => {
    if (!auth) return;
    try {
      setLoading(true);
      await updateProfile(auth.userId, {
        firstName, lastName, phone,
        notificationsEnabled: true,
      });
      Alert.alert('Sukces', 'Dane zostały zapisane');
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać danych');
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>DANE OSOBOWE</Text>
        <Input label="IMIĘ" value={firstName} onChangeText={setFirstName} />
        <Input label="NAZWISKO" value={lastName} onChangeText={setLastName} />
        <Input
          label="DATA URODZENIA"
          value={dateOfBirth} onChangeText={setDateOfBirth}
          placeholder="DD.MM.RRRR" icon="calendar"
        />

        <Text style={styles.sectionLabel}>DANE KONTAKTOWE</Text>
        <Input
          label="ADRES E-MAIL"
          value={email} onChangeText={setEmail}
          editable={false}
          keyboardType="email-address"
        />
        <Input
          label="NUMER TELEFONU"
          value={phone} onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <View style={styles.spacer} />
        <Button title="Zapisz zmiany" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, paddingTop: 52 },
  scrollContent: { padding: 16 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  spacer: { height: 24 },
});