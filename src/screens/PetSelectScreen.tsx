import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserPets } from '../api/petsApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { COLORS } from '../theme/colors';
import { Pet } from '../types';

export default function PetSelectScreen({ navigation }: any) {
  const { auth } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!auth) return;
      let active = true;
      const load = async () => {
        try {
          const { data } = await getUserPets(auth.userId);
          if (active) setPets(data);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => { active = false; };
    }, [auth])
  );

  const goToDashboard = (petId: number) => {
    navigation.navigate('MainTabs', { petId });
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Cześć, {auth?.firstName}!</Text>
        <Text style={styles.subtitle}>Wybierz swojego pupila</Text>
      </View>

      <FlatList
        data={pets}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => goToDashboard(item.id)}
            activeOpacity={0.8}>
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
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <Button
            title="+ Dodaj nowego zwierzaka"
            onPress={() => navigation.navigate('AddPet')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 26, fontWeight: '700', color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },
  listContent: { padding: 16 },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 20, marginBottom: 16,
    overflow: 'hidden', elevation: 2,
  },
  petImage: { width: 110, height: 110, resizeMode: 'cover' },
  petInfo: { flex: 1, padding: 16, justifyContent: 'center' },
  petName: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  petBreed: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  petMeta: { fontSize: 13, color: COLORS.primary, fontWeight: '500', marginTop: 8 },
});