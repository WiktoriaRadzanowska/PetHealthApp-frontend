import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { createPet } from '../api/petsApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS } from '../theme/colors';

const SPECIES = ['Pies', 'Kot', 'Królik', 'Chomik', 'Ptak', 'Inne'];
const FUR_COLORS = ['#F5CBA7', '#DC7633', '#922B21', '#6E2F1A', '#1C2833', '#F0F3F4'];

export default function AddPetScreen({ navigation }: any) {
  const { auth } = useAuth();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Pies');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Samiec');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [furColor, setFurColor] = useState(FUR_COLORS[0]);
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
          return;
        }
        const asset = response.assets?.[0];
        if (asset) setPhoto(asset);
      }
    );
  };

  const handleSave = async () => {
    if (!auth) { Alert.alert('Błąd', 'Brak autoryzacji'); return; }
    if (!name.trim()) { Alert.alert('Błąd', 'Podaj imię zwierzaka'); return; }
    if (!breed.trim()) { Alert.alert('Błąd', 'Podaj rasę'); return; }
    if (!dateOfBirth.trim()) { Alert.alert('Błąd', 'Podaj datę urodzenia'); return; }

    let parsedDate: Date;
    try {
      const parts = dateOfBirth.split('.');
      if (parts.length === 3) {
        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        parsedDate = new Date(dateOfBirth);
      }
      if (isNaN(parsedDate.getTime())) {
        Alert.alert('Błąd', 'Nieprawidłowy format daty. Użyj: DD.MM.RRRR');
        return;
      }
    } catch {
      Alert.alert('Błąd', 'Nieprawidłowy format daty. Użyj: DD.MM.RRRR');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('Name', name.trim());
      formData.append('Species', species);
      formData.append('Breed', breed.trim());
      formData.append('Gender', gender);
      formData.append('DateOfBirth', parsedDate.toISOString());
      formData.append('WeightKg', weight || '0');
      formData.append('FurColor', furColor);
      formData.append('UserId', auth.userId.toString());

      if (photo) {
        formData.append('photo', {
          uri: photo.uri,
          type: photo.type ?? 'image/jpeg',
          name: photo.fileName ?? 'photo.jpg',
        } as any);
      }

      await createPet(formData);
      Alert.alert('Sukces', 'Zwierzak został dodany!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Błąd', e.response?.data?.message ?? 'Nie udało się dodać zwierzaka');
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
        <Text style={styles.title}>Dodaj zwierzaka</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Anuluj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Zdjęcie */}
        <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-plus-outline" size={36} color={COLORS.textLight} />
              <Text style={styles.photoLabel}>Dodaj zdjęcie</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>PODSTAWOWE INFORMACJE</Text>
        <Input label="IMIĘ" value={name} onChangeText={setName}
          placeholder="Wpisz imię zwierzaka" />

        <Text style={styles.fieldLabel}>RODZAJ</Text>
        <View style={styles.chipRow}>
          {SPECIES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, species === s && styles.chipActive]}
              onPress={() => setSpecies(s)}>
              <Text style={[styles.chipText, species === s && styles.chipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="RASA" value={breed} onChangeText={setBreed}
          placeholder="np. Welsh Corgi Pembroke" />

        <Text style={styles.fieldLabel}>PŁEĆ</Text>
        <View style={styles.chipRow}>
          {['Samiec', 'Samica'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, gender === g && styles.chipActive]}
              onPress={() => setGender(g)}>
              <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="DATA URODZENIA" value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="DD.MM.RRRR" icon="calendar" />

        <Text style={styles.sectionLabel}>WYGLĄD I WAGA</Text>
        <Text style={styles.fieldLabel}>KOLOR SIERŚCI</Text>
        <View style={styles.colorRow}>
          {FUR_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                furColor === c && styles.colorDotActive,
              ]}
              onPress={() => setFurColor(c)}
            />
          ))}
        </View>

        <Input label="WAGA (KG)" value={weight} onChangeText={setWeight}
          placeholder="0.0" keyboardType="decimal-pad" icon="scale" />

        <View style={styles.spacer} />
        <Button title="Dodaj zwierzaka" onPress={handleSave} loading={loading} />
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
  photoBox: {
    alignSelf: 'center', marginBottom: 20,
  },
  photoPreview: {
    width: 120, height: 120, borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.inputBg,
    borderWidth: 2, borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  fieldLabel: {
    fontSize: 11, fontWeight: '600', color: COLORS.textGray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.white,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.textGray },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotActive: {
    borderWidth: 3, borderColor: COLORS.primary,
    transform: [{ scale: 1.15 }],
  },
  spacer: { height: 24 },
});