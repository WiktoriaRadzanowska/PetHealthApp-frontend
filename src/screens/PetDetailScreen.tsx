import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getPetById } from '../api/petsApi';
import { COLORS } from '../theme/colors';
import { Pet } from '../types';

export default function PetDetailScreen({ route, navigation }: any) {
  const petId = route.params?.petId;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const { data } = await getPetById(petId);
          if (active) setPet(data);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => { active = false; };
    }, [petId])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const dob = pet?.dateOfBirth
    ? new Date(pet.dateOfBirth).toLocaleDateString('pl-PL')
    : '—';

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Image
          source={
            pet?.photoUrl
              ? { uri: pet.photoUrl }
              : require('../assets/pet-placeholder.png')
          }
          style={styles.heroImage}
        />
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('EditPet', { petId })}>
            <Icon name="pencil-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(6, 73, 36, 0.4)', 'rgba(6, 53, 27, 0.8)']}
          style={styles.bottomGradient}>
        
          <View style={styles.glassContainer}>
          <Text style={styles.heroName}>{pet?.name}</Text>
          <Text style={styles.heroBreed}>{pet?.breed} • ur. {dob}</Text>
          <View style={styles.weightBadge}>
            <Text style={styles.weightText}>{pet?.weightKg} kg</Text>
          </View>
        </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>DANE PUPILA</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>IMIĘ</Text>
            <Text style={styles.infoValue}>{pet?.name ?? '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>RASA</Text>
            <Text style={styles.infoValue}>{pet?.breed ?? '—'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PŁEĆ</Text>
            <View style={styles.genderRow}>
              <View style={[
                styles.genderChip,
                pet?.gender === 'Samiec' && styles.genderChipActive,
              ]}>
                <Text style={[
                  styles.genderChipText,
                  pet?.gender === 'Samiec' && styles.genderChipTextActive,
                ]}>Samiec</Text>
              </View>
              <View style={[
                styles.genderChip,
                pet?.gender === 'Samica' && styles.genderChipActive,
              ]}>
                <Text style={[
                  styles.genderChipText,
                  pet?.gender === 'Samica' && styles.genderChipTextActive,
                ]}>Samica</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATA URODZENIA</Text>
            <View style={styles.dateRow}>
              <Text style={styles.infoValue}>{dob}</Text>
              <Icon name="calendar-outline" size={18} color={COLORS.textLight} />
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KOLOR SIERŚCI</Text>
            {pet?.furColor
              ? <View style={[styles.colorDot, { backgroundColor: pet.furColor }]} />
              : <Text style={styles.infoValue}>—</Text>
            }
          </View>
        </View>

        <Text style={styles.sectionTitle}>STATYSTYKI</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="medical-bag" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{pet?.visitCount ?? 0}</Text>
            <Text style={styles.statLabel}>Wizyty</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="scale" size={24} color={COLORS.accentBlue} />
            <Text style={styles.statValue}>{pet?.weightKg ?? '—'}</Text>
            <Text style={styles.statLabel}>kg</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="clock-outline" size={24} color={COLORS.accentYellow} />
            <Text style={styles.statValue}>{pet?.ageDisplay ?? '—'}</Text>
            <Text style={styles.statLabel}>Wiek</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editFullBtn}
          onPress={() => navigation.navigate('EditPet', { petId })}>
          <Icon name="pencil" size={18} color={COLORS.white} />
          <Text style={styles.editFullBtnText}>Edytuj dane pupila</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 240, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  topActions: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 20, paddingHorizontal: 16,
  },

  iconBtn: { 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderRadius: 20, 
    padding: 8 
  },

  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 120, 
  },

  glassContainer: {
    flex: 1,
    justifyContent: 'flex-end', 
    padding: 16, paddingBottom: 20,
  },


  heroName: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  heroBreed: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  weightBadge: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  weightText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 0.8, marginBottom: 12, marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 4, elevation: 1, marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 11, fontWeight: '700',
    color: COLORS.textGray, letterSpacing: 0.5,
  },
  infoValue: { fontSize: 15, color: COLORS.textDark, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.inputBorder, marginHorizontal: 14 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.inputBorder, backgroundColor: COLORS.background,
  },
  genderChipActive: {
    backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary,
  },
  genderChipText: { fontSize: 13, color: COLORS.textGray },
  genderChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white,
    borderRadius: 16, padding: 14,
    alignItems: 'center', elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginTop: 8 },
  statLabel: { fontSize: 11, color: COLORS.textGray, marginTop: 2 },
  editFullBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 30, height: 52,
  },
  editFullBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});