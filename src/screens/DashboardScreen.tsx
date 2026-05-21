import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getDashboard } from '../api/petsApi';
import { COLORS } from '../theme/colors';
import { Dashboard } from '../types';

const QUICK_ACTIONS = [
  { icon: 'medical-bag', label: 'Dodaj wizytę', screen: 'AddVisit', isTab: false },
  { icon: 'history', label: 'Historia', screen: 'Historia', isTab: true },
  { icon: 'paw', label: 'Dane pupila', screen: 'PetDetail', isTab: false },
  { icon: 'scale', label: 'Waga', screen: 'Wykres', isTab: true },
];

export default function DashboardScreen({ route, navigation }: any) {
  const petId = route.params?.petId;
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const { data } = await getDashboard(petId);
          if (active) setDashboard(data);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => { active = false; };
    }, [petId])
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  const pet = dashboard?.pet;
  const upcomingVacc = dashboard?.upcomingVaccinations?.[0];

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.heroContainer}>
          <Image
            source={pet?.photoUrl
              ? { uri: pet.photoUrl }
              : require('../assets/pet-placeholder.png')}
            style={styles.heroImage}
          />

          <LinearGradient
            colors={['transparent', 'rgba(6, 73, 36, 0.4)', 'rgba(6, 53, 27, 0.8)']}
            style={styles.heroOverlay}>
            <Text style={styles.heroName}>{pet?.name}</Text>
            <Text style={styles.heroBreed}>
              {pet?.breed} • ur. {pet?.dateOfBirth
                ? new Date(pet.dateOfBirth).toLocaleDateString('pl-PL') : ''}
            </Text>
            <View style={styles.weightBadge}>
              <Text style={styles.weightText}>{pet?.weightKg} kg</Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.bellBtn}>
            <Icon name="bell-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {upcomingVacc && (
            <View style={styles.alert}>
              <Icon name="alert" size={20} color={COLORS.white} />
              <Text style={styles.alertText}>
                🚨 Szczepienie za {upcomingVacc.daysRemaining} dni!{' '}
                {upcomingVacc.vaccineName} • {
                  new Date(upcomingVacc.dueDate).toLocaleDateString('pl-PL')
                }
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>SZYBKIE AKCJE</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                onPress={() => {
                  if (action.isTab) {
                    navigation.navigate(action.screen as never);
                  } else {
                    navigation.navigate(action.screen as never, { petId } as never);
                  }
                }}
                activeOpacity={0.8}>
                <Icon name={action.icon} size={28} color={COLORS.primary} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {dashboard?.lastVisit && (
            <>
              <Text style={styles.sectionTitle}>OSTATNIA WIZYTA</Text>
              <TouchableOpacity
                style={styles.lastVisitCard}
                onPress={() =>
                  navigation.navigate('VisitDetail' as never, {
                    visitId: dashboard.lastVisit!.id,
                  } as never)
                }>
                <View style={styles.lastVisitIcon}>
                  <Icon name="stethoscope" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.lastVisitInfo}>
                  <Text style={styles.lastVisitTitle}>
                    {dashboard.lastVisit.title}
                  </Text>
                  <Text style={styles.lastVisitDate}>
                    {new Date(dashboard.lastVisit.visitDate).toLocaleDateString('pl-PL')}
                  </Text>
                </View>
                <Text style={styles.lastVisitCost}>
                  {dashboard.lastVisit.cost} zł
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Przyciski poza ScrollView — zawsze widoczne */}
      <TouchableOpacity
        style={styles.changePetBtn}
        onPress={() => navigation.navigate('PetSelect' as never)}>
        <Icon name="swap-horizontal" size={20} color={COLORS.white} />
        <Text style={styles.changePetText}>Zmień pupila</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddVisit' as never, { petId } as never)}>
        <Icon name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, height: '100%' },
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroContainer: { height: 240, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 140,
    padding: 16, paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  heroName: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  heroBreed: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  weightBadge: {
    alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  weightText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  bellBtn: {
    position: 'absolute', top: 24, right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20, padding: 8,
  },
  content: { padding: 16 },
  alert: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.alertOrange,
    borderRadius: 14, padding: 14, marginBottom: 16,
    gap: 8,
  },
  alertText: { flex: 1, color: COLORS.white, fontSize: 13, fontWeight: '500' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 0.8, marginBottom: 12, marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  actionCard: {
    width: '47%', backgroundColor: COLORS.white,
    borderRadius: 16, padding: 16,
    alignItems: 'center', elevation: 1,
  },
  actionLabel: {
    marginTop: 8, fontSize: 13, fontWeight: '500', color: COLORS.textDark,
  },
  lastVisitCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16, padding: 14, elevation: 1,
  },
  lastVisitIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  lastVisitInfo: { flex: 1 },
  lastVisitTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  lastVisitDate: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
  lastVisitCost: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  changePetBtn: {
    position: 'absolute', bottom: 16, left: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 30, paddingHorizontal: 16, paddingVertical: 14,
    elevation: 4,
  },
  changePetText: {
    color: COLORS.white, fontSize: 14, fontWeight: '600',
  },
  fab: {
    position: 'absolute', bottom: 16, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
});