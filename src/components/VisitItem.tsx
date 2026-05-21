import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, VISIT_TYPE_COLORS } from '../theme/colors';
import { Visit } from '../types';

interface Props {
  visit: Visit;
  onPress: () => void;
}

const VISIT_ICONS: Record<string, string> = {
  Szczepienie: 'needle',
  Kontrola: 'stethoscope',
  Badanie: 'test-tube',
  Zabieg: 'scissors-cutting',
  Leki: 'pill',
};

export default function VisitItem({ visit, onPress }: Props) {
  const dotColor = VISIT_TYPE_COLORS[visit.visitType] ?? COLORS.textLight;
  const iconName = VISIT_ICONS[visit.visitType] ?? 'medical-bag';
  const date = new Date(visit.visitDate);
  const dateStr = `${date.getDate()} ${[
    'stycznia','lutego','marca','kwietnia','maja','czerwca',
    'lipca','sierpnia','września','października','listopada','grudnia'
  ][date.getMonth()]} ${date.getFullYear()}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Kolorowy dot (linia osi czasu) */}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      {/* Ikona */}
      <View style={[styles.iconBox, { backgroundColor: dotColor + '22' }]}>
        <Icon name={iconName} size={20} color={dotColor} />
      </View>

      {/* Treść */}
      <View style={styles.content}>
        <Text style={styles.title}>{visit.title}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      {/* Koszt */}
      <Text style={styles.cost}>{visit.cost} zł</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16, padding: 14, marginBottom: 10,
    elevation: 1,
  },
  dot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 12,
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  date: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
  cost: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
});