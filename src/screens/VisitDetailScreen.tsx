import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getVisitById, deleteVisit } from '../api/visitsApi';
import Button from '../components/Button';
import { COLORS, VISIT_TYPE_COLORS } from '../theme/colors';
import { Visit } from '../types';

export default function VisitDetailScreen({ route, navigation }: any) {
  const { visitId } = route.params;
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const { data } = await getVisitById(visitId);
        if (active) { setVisit(data); setLoading(false); }
      };
      load();
      return () => { active = false; };
    }, [visitId])
  );

  const handleDelete = () => {
    Alert.alert('Usuń wizytę', 'Czy na pewno chcesz usunąć tę wizytę?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń', style: 'destructive',
        onPress: async () => {
          await deleteVisit(visitId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={COLORS.primary} />
    </View>
  );

  const dotColor = VISIT_TYPE_COLORS[visit!.visitType] ?? COLORS.textLight;
  const date = new Date(visit!.visitDate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.visitTitle}>{visit!.title}</Text>
        <View style={styles.typeBadge}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={styles.typeText}>{visit!.visitType}</Text>
        </View>
        <Text style={styles.dateText}>{date.toLocaleDateString('pl-PL')}</Text>
        <Text style={styles.price}>{visit!.cost} zł</Text>

        <Text style={styles.sectionTitle}>NOTATKA WETERYNARZA</Text>
        <View style={styles.card}>
          <Text style={styles.vetNotes}>{visit!.vetNotes || '—'}</Text>
        </View>

        {visit!.weightAtVisit && (
          <>
            <Text style={styles.sectionTitle}>WAGA W DNIU WIZYTY</Text>
            <View style={styles.card}>
              <View style={styles.weightRow}>
                <Icon name="scale" size={18} color={COLORS.primary} />
                <Text style={styles.weightValue}>
                  Waga: {visit!.weightAtVisit} kg
                </Text>
              </View>
            </View>
          </>
        )}

        {visit!.attachments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>ZAŁĄCZNIKI</Text>
            {visit!.attachments.map(att => (
              <TouchableOpacity
                key={att.id}
                style={styles.attachmentRow}
                onPress={() => Linking.openURL(att.blobUrl)}>
                <Icon name="file-document-outline" size={20} color={COLORS.primary} />
                <Text style={styles.attachmentName}>{att.fileName}</Text>
                <Icon name="open-in-new" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={styles.spacer} />
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <Button
              title="Edytuj"
              onPress={() => navigation.navigate('EditVisit', { visitId })}
              variant="outline"
            />
          </View>
          <View style={styles.buttonSpacer} />
          <View style={styles.buttonHalf}>
            <Button title="Usuń" onPress={handleDelete} variant="danger" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 16, paddingTop: 52, flexDirection: 'row' },
  scrollContent: { padding: 20 },
  visitTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  typeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  typeText: { fontSize: 13, color: COLORS.textGray },
  dateText: { fontSize: 13, color: COLORS.textGray, marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 20 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 0.8, marginBottom: 8, marginTop: 16,
  },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, elevation: 1 },
  vetNotes: { fontSize: 14, color: COLORS.textDark, lineHeight: 22 },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightValue: { fontSize: 15, color: COLORS.textDark, fontWeight: '500' },
  attachmentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12, padding: 14, marginBottom: 8,
    elevation: 1, gap: 10,
  },
  attachmentName: { flex: 1, fontSize: 13, color: COLORS.textDark },
  spacer: { height: 20 },
  buttonRow: { flexDirection: 'row' },
  buttonHalf: { flex: 1 },
  buttonSpacer: { width: 12 },
});