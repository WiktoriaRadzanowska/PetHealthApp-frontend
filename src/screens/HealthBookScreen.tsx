import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, ScrollView, Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPetVisits } from '../api/visitsApi';
import VisitItem from '../components/VisitItem';
import { COLORS, VISIT_TYPES } from '../theme/colors';
import { Visit } from '../types';

interface Filters {
  visitType: string | null;
  costMin: string;
  costMax: string;
  dateFrom: string;
  dateTo: string;
  hasAttachments: boolean;
}

const DEFAULT_FILTERS: Filters = {
  visitType: null,
  costMin: '',
  costMax: '',
  dateFrom: '',
  dateTo: '',
  hasAttachments: false,
};

export default function HealthBookScreen({ route, navigation }: any) {
  const petId = route.params?.petId;
  const [visits, setVisits] = useState<Visit[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);

  const hasActiveFilters = (f: Filters) =>
    f.visitType !== null || f.costMin !== '' || f.costMax !== '' ||
    f.dateFrom !== '' || f.dateTo !== '' || f.hasAttachments;

  const loadVisits = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params: any = {};
      if (f.visitType) params.visitType = f.visitType;
      if (f.costMin) params.costMin = parseFloat(f.costMin);
      if (f.costMax) params.costMax = parseFloat(f.costMax);
      if (f.hasAttachments) params.hasAttachments = true;
      if (f.dateFrom) {
        const parts = f.dateFrom.split('.');
        if (parts.length === 3) params.dateFrom = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
      }
      if (f.dateTo) {
        const parts = f.dateTo.split('.');
        if (parts.length === 3) params.dateTo = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
      }
      const { data } = await getPetVisits(petId, params);
      setVisits(data);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      loadVisits(appliedFilters);
    }, [loadVisits, appliedFilters])
  );

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilters(false);
    loadVisits(filters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setShowFilters(false);
    loadVisits(DEFAULT_FILTERS);
  };

  const filtered = visits.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped: Record<string, Visit[]> = {};
  filtered.forEach(v => {
    const year = new Date(v.visitDate).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(v);
  });
  const years = Object.keys(grouped).sort((a, b) => +b - +a);

  return (
    <View style={styles.container}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Książeczka zdrowia</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Wyszukiwarka + filtr */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Szukaj w historii"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            hasActiveFilters(appliedFilters) && styles.filterBtnActive,
          ]}
          onPress={() => { setFilters(appliedFilters); setShowFilters(true); }}>
          <Icon name="tune-variant" size={20} color={COLORS.white} />
          {hasActiveFilters(appliedFilters) && (
            <View style={styles.filterDot} />
          )}
        </TouchableOpacity>
      </View>

      {/* Lista wizyt */}
      {loading
        ? <ActivityIndicator style={styles.loader} color={COLORS.primary} />
        : (
          <View style={styles.wrapper}>
            <FlatList
              data={years}
              keyExtractor={year => year}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Icon name="clipboard-text-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyText}>Brak wizyt</Text>
                  {hasActiveFilters(appliedFilters) && (
                    <TouchableOpacity onPress={handleResetFilters}>
                      <Text style={styles.resetText}>Wyczyść filtry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
              renderItem={({ item: year }) => (
                <View>
                  <View style={styles.yearLabel}>
                    <Text style={styles.yearText}>{year}</Text>
                  </View>
                  {grouped[year].map(visit => (
                    <VisitItem
                      key={visit.id}
                      visit={visit}
                      onPress={() =>
                        navigation.navigate('VisitDetail' as never, { visitId: visit.id } as never)
                      }
                    />
                  ))}
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('AddVisit' as never, { petId } as never)}>
              <Icon name="plus" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )
      }

      {/* Modal filtrów */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtry</Text>
              <TouchableOpacity onPress={handleResetFilters}>
                <Text style={styles.resetBtn}>Resetuj</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Typ wizyty */}
              <Text style={styles.filterLabel}>TYP WIZYTY</Text>
              <View style={styles.chipRow}>
                {VISIT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      filters.visitType === type && styles.chipActive,
                    ]}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        visitType: f.visitType === type ? null : type,
                      }))
                    }>
                    <Text style={[
                      styles.chipText,
                      filters.visitType === type && styles.chipTextActive,
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Koszt */}
              <Text style={styles.filterLabel}>KOSZT LECZENIA</Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeField}>
                  <TextInput
                    style={styles.rangeInput}
                    value={filters.costMin}
                    onChangeText={v => setFilters(f => ({ ...f, costMin: v }))}
                    placeholder="Od (zł)"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="decimal-pad"
                  />
                </View>
                <Text style={styles.rangeSeparator}>—</Text>
                <View style={styles.rangeField}>
                  <TextInput
                    style={styles.rangeInput}
                    value={filters.costMax}
                    onChangeText={v => setFilters(f => ({ ...f, costMax: v }))}
                    placeholder="Do (zł)"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Zakres dat */}
              <Text style={styles.filterLabel}>ZAKRES DAT</Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeField}>
                  <TextInput
                    style={styles.rangeInput}
                    value={filters.dateFrom}
                    onChangeText={v => setFilters(f => ({ ...f, dateFrom: v }))}
                    placeholder="Od: DD.MM.RRRR"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
                <Text style={styles.rangeSeparator}>—</Text>
                <View style={styles.rangeField}>
                  <TextInput
                    style={styles.rangeInput}
                    value={filters.dateTo}
                    onChangeText={v => setFilters(f => ({ ...f, dateTo: v }))}
                    placeholder="Do: DD.MM.RRRR"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              {/* Tylko z załącznikami */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Tylko z załącznikami</Text>
                <Switch
                  value={filters.hasAttachments}
                  onValueChange={v => setFilters(f => ({ ...f, hasAttachments: v }))}
                  trackColor={{ true: COLORS.primary }}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyFilters}>
              <Text style={styles.applyBtnText}>Zastosuj filtry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    marginBottom: 8, gap: 10,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.inputBorder,
  },
  searchInput: { flex: 1, height: 44, color: COLORS.textDark, marginLeft: 8 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: COLORS.primaryDark },
  filterDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.accentYellow,
  },
  loader: { flex: 1 },
  wrapper: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 80 },
  yearLabel: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 10,
  },
  yearText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  emptyBox: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, gap: 8,
  },
  emptyText: { fontSize: 15, color: COLORS.textGray },
  resetText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  resetBtn: { fontSize: 14, color: COLORS.accentGreen, fontWeight: '600' },
  filterLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 1, marginBottom: 10, marginTop: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.background,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.textGray },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  rangeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  rangeField: { flex: 1 },
  rangeInput: {
    borderWidth: 1, borderColor: COLORS.inputBorder,
    borderRadius: 10, paddingHorizontal: 12, height: 44,
    fontSize: 14, color: COLORS.textDark,
    backgroundColor: COLORS.inputBg,
  },
  rangeSeparator: { fontSize: 16, color: COLORS.textGray },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20, marginBottom: 8,
  },
  switchLabel: { fontSize: 15, color: COLORS.textDark, fontWeight: '500' },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 20,
  },
  applyBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});