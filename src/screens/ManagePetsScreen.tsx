import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserPets, deletePet } from '../api/petsApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { COLORS } from '../theme/colors';
import { Pet } from '../types';

export default function ManagePetsScreen({ navigation }: any) {
  const { auth } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!auth) return;
      let active = true;
      const load = async () => {
        const { data } = await getUserPets(auth.userId);
        if (active) { setPets(data); setLoading(false); }
      };
      load();
      return () => { active = false; };
    }, [auth])
  );

  const handleDelete = (pet: Pet) => {
    Alert.alert(`Usuń ${pet.name}`, 'Czy na pewno chcesz usunąć tego pupila?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń', style: 'destructive',
        onPress: async () => {
          await deletePet(pet.id);
          if (auth) {
            const { data } = await getUserPets(auth.userId);
            setPets(data);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Zarządzaj zwierzętami</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading
        ? <ActivityIndicator style={styles.loader} color={COLORS.primary} />
        : (
          <FlatList
            data={pets}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={item.photoUrl
                    ? { uri: item.photoUrl }
                    : require('../assets/pet-placeholder.png')}
                  style={styles.petImage}
                />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petBreed}>{item.breed}</Text>
                  <Text style={styles.petMeta}>
                    {item.ageDisplay} • {item.weightKg} kg
                  </Text>
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.navigate('EditPet', { petId: item.id })}>
                      <Text style={styles.editBtnText}>Edytuj</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item)}>
                      <Text style={styles.deleteBtnText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.footerBtn}>
                <Button
                  title="Dodaj nowego zwierzaka"
                  onPress={() => navigation.navigate('AddPet')}
                />
              </View>
            }
          />
        )
      }
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
  headerPlaceholder: { width: 24 },
  loader: { flex: 1 },
  listContent: { padding: 16 },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 20, marginBottom: 16,
    overflow: 'hidden', elevation: 2,
  },
  petImage: { width: 110, height: 140, resizeMode: 'cover' },
  petInfo: { flex: 1, padding: 14, justifyContent: 'center' },
  petName: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  petBreed: { fontSize: 12, color: COLORS.textGray },
  petMeta: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.primary,
    alignItems: 'center',
  },
  editBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  deleteBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.danger,
    alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.danger, fontWeight: '600', fontSize: 13 },
  footerBtn: { marginTop: 8 },
});