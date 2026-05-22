import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, types, errorCodes } from '@react-native-documents/picker';
import { createVisit } from '../api/visitsApi';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, VISIT_TYPES } from '../theme/colors';

export default function AddVisitScreen({ route, navigation }: any) {
  const petId = route.params?.petId;
  const [title, setTitle] = useState('');
  const [visitType, setVisitType] = useState('Kontrola');
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [vetNotes, setVetNotes] = useState('');
  const [cost, setCost] = useState('0');
  const [weight, setWeight] = useState('0');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickFile = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: [types.pdf, types.images],
      });
      setAttachments(prev => [...prev, ...results]);
    } catch (e: any) {
      if (e?.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert('Błąd', 'Nie udało się wybrać pliku');
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title || !visitType) {
      Alert.alert('Błąd', 'Wypełnij tytuł i typ wizyty');
      return;
    }

    let parsedDate: Date;
    try {
      const parts = visitDate.split('.');
      if (parts.length === 3) {
        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        parsedDate = new Date(visitDate);
      }
      if (isNaN(parsedDate.getTime())) {
        Alert.alert('Błąd', 'Nieprawidłowy format daty');
        return;
      }
    } catch {
      parsedDate = new Date();
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('PetId', petId.toString());
      formData.append('Title', title);
      formData.append('VisitType', visitType);
      formData.append('VisitDate', parsedDate.toISOString());
      formData.append('VetNotes', vetNotes);
      formData.append('Cost', cost);
      formData.append('WeightAtVisit', weight);

      attachments.forEach((file) => {
        formData.append('attachments', {
          uri: file.uri,
          type: file.type ?? 'application/octet-stream',
          name: file.name ?? 'file',
        } as any);
      });

      await createVisit(formData);
      Alert.alert('Sukces', 'Wizyta została dodana!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Błąd', e.response?.data?.message ?? 'Nie udało się zapisać wizyty');
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
        <Text style={styles.title}>Nowa wizyta</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Anuluj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>PODSTAWOWE INFORMACJE</Text>

        <Input label="TYTUŁ WIZYTY" value={title} onChangeText={setTitle}
          placeholder="np. Coroczne szczepienie" />

        <Text style={styles.fieldLabel}>TYP WIZYTY</Text>
        <View style={styles.typeRow}>
          {VISIT_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, visitType === type && styles.typeChipActive]}
              onPress={() => setVisitType(type)}>
              <Text style={[
                styles.typeChipText,
                visitType === type && styles.typeChipTextActive,
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="DATA WIZYTY" value={visitDate} onChangeText={setVisitDate}
          placeholder="DD.MM.RRRR" icon="calendar" />

        <Input label="NOTATKI WETERYNARZA" value={vetNotes}
          onChangeText={setVetNotes}
          placeholder="Wpisz diagnozę, zalecenia, dawkowanie leków..."
          multiline maxLength={500} />

        <Text style={styles.sectionLabel}>KOSZT WIZYTY I WAGA PUPILA</Text>
        <View style={styles.costRow}>
          <View style={styles.costField}>
            <Input label="ZŁ" value={cost} onChangeText={setCost}
              keyboardType="decimal-pad" />
          </View>
          <View style={styles.costSpacer} />
          <View style={styles.costField}>
            <Input label="KG" value={weight} onChangeText={setWeight}
              keyboardType="decimal-pad" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>ZAŁĄCZNIKI</Text>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile}>
          <Icon name="paperclip" size={20} color={COLORS.primary} />
          <Text style={styles.attachBtnText}>Kliknij, aby dodać załącznik</Text>
        </TouchableOpacity>
        <Text style={styles.attachHint}>JPG, PNG lub PDF • max 10 MB</Text>

        {attachments.map((file, index) => (
          <View key={index} style={styles.attachmentRow}>
            <Icon name="file-document-outline" size={18} color={COLORS.primary} />
            <Text style={styles.attachmentName} numberOfLines={1}>
              {file.name}
            </Text>
            <TouchableOpacity onPress={() => removeAttachment(index)}>
              <Icon name="close" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.spacer} />
        <Button title="Zapisz" onPress={handleSave} loading={loading} />
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
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  fieldLabel: {
    fontSize: 11, fontWeight: '600', color: COLORS.textGray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.white,
  },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, color: COLORS.textGray },
  typeChipTextActive: { color: COLORS.white, fontWeight: '600' },
  costRow: { flexDirection: 'row' },
  costField: { flex: 1 },
  costSpacer: { width: 12 },
  attachBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.inputBorder,
    borderStyle: 'dashed', borderRadius: 12,
    padding: 16, gap: 10,
    backgroundColor: COLORS.white,
  },
  attachBtnText: { fontSize: 14, color: COLORS.textGray },
  attachHint: { fontSize: 11, color: COLORS.textLight, marginTop: 4, marginBottom: 8 },
  attachmentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10, padding: 12,
    marginTop: 6, gap: 8,
  },
  attachmentName: { flex: 1, fontSize: 13, color: COLORS.textDark },
  spacer: { height: 24 },
});