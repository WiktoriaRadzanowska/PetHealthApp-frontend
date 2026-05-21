import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getWeightHistory, addWeight } from '../api/weightsApi';
import { getPetById } from '../api/petsApi';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS } from '../theme/colors';
import { WeightEntry, Pet } from '../types';

const RANGES = ['1M', '6M', '1R'];
const screenWidth = Dimensions.get('window').width;

export default function WeightScreen({ route, navigation }: any) {
  const petId = route.params?.petId;
  const [pet, setPet] = useState<Pet | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [range, setRange] = useState('6M');
  const [newWeight, setNewWeight] = useState('');
  const [measureDate, setMeasureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const [petRes, weightRes] = await Promise.all([
      getPetById(petId),
      getWeightHistory(petId, range),
    ]);
    setPet(petRes.data);
    setEntries(weightRes.data);
  }, [petId, range]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!newWeight) { Alert.alert('Błąd', 'Podaj wagę'); return; }
    try {
      setSaving(true);
      await addWeight(petId, parseFloat(newWeight), new Date(measureDate).toISOString());
      setNewWeight('');
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const chartData = entries.length > 1 ? {
    labels: entries.map(e => {
      const d = new Date(e.measuredAt);
      return `${d.getDate()}.${d.getMonth() + 1}`;
    }),
    datasets: [{ data: entries.map(e => e.weightKg), strokeWidth: 2 }],
  } : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Image
          source={pet?.photoUrl
            ? { uri: pet.photoUrl }
            : require('../assets/pet-placeholder.png')}
          style={styles.heroImage}
        />
        <LinearGradient
        colors={['transparent', 'rgba(6, 73, 36, 0.4)', 'rgba(6, 53, 27, 0.8)']}
        style={styles.heroOverlay}>
        
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.heroName}>{pet?.name}</Text>
            <Text style={styles.heroBreed}>
              {pet?.breed} • ur. {pet?.dateOfBirth
                ? new Date(pet.dateOfBirth).toLocaleDateString('pl-PL') : ''}
            </Text>
          </View>
          <View style={styles.weightBadge}>
            <Text style={styles.weightBadgeText}>{pet?.weightKg} kg</Text>
          </View>
      
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.rangeRow}>
          <Text style={styles.sectionTitle}>HISTORIA WAGI</Text>
          <View style={styles.rangePicker}>
            {RANGES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
                onPress={() => setRange(r)}>
                <Text style={[
                  styles.rangeBtnText,
                  range === r && styles.rangeBtnTextActive,
                ]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {chartData ? (
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={180}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 1,
              color: () => COLORS.primary,
              labelColor: () => COLORS.textGray,
              propsForDots: {
                r: '5', strokeWidth: '2', stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataBox}>
            <Text style={styles.noDataText}>Brak danych dla tego zakresu</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>DODAJ POMIAR WAGI</Text>
        <Input
          label="WAGA (KG)"
          value={newWeight}
          onChangeText={setNewWeight}
          placeholder="0,0"
          keyboardType="decimal-pad"
          icon="scale"
        />
        <Input
          label="DATA POMIARU"
          value={measureDate}
          onChangeText={setMeasureDate}
          placeholder="DD.MM.RRRR"
          icon="calendar"
        />
        <Button title="Zapisz pomiar" onPress={handleSave} loading={saving} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 220, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop:50,
    paddingHorizontal: 16, paddingBottom: 20,
  },


  heroName: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  heroBreed: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  weightBadge: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  weightBadgeText: { color: COLORS.white, fontWeight: '700' },
  content: { padding: 16 },
  rangeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 0.8, marginBottom: 12, marginTop: 16,
  },
  rangePicker: { flexDirection: 'row', gap: 6 },
  rangeBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  rangeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rangeBtnText: { fontSize: 12, color: COLORS.textGray },
  rangeBtnTextActive: { color: COLORS.white, fontWeight: '600' },
  chart: { borderRadius: 16, marginBottom: 8 },
  noDataBox: {
    height: 180, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 8,
  },
  noDataText: { color: COLORS.textLight },
});