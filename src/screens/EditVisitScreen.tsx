import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, types, errorCodes } from '@react-native-documents/picker';
import { getVisitById, updateVisit } from '../api/visitsApi';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, VISIT_TYPES } from '../theme/colors';
import { Attachment } from '../types';

export default function EditVisitScreen({ route, navigation }: any) {
  const { visitId } = route.params;
  const [title, setTitle] = useState('');
  const [visitType, setVisitType] = useState('Kontrola');
  const [visitDate, setVisitDate] = useState('');
  const [vetNotes, setVetNotes] = useState('');
  const [cost, setCost] = useState('0');
  const [weight, setWeight] = useState('0');
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await getVisitById(visitId);
      setTitle(data.title);
      setVisitType(data.visitType);
      setVisitDate(data.visitDate.split('T')[0]);
      setVetNotes(data.vetNotes);
      setCost(data.cost.toString());
      setWeight(data.weightAtVisit?.toString() ?? '0');
      setExistingAttachments(data.attachments ?? []);
    };
    load();
  }, [visitId]);

  const handlePickFile = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: [types.pdf, types.images],
      });
      setNewAttachments(prev => [...prev, ...results]);
    } catch (e: any) {
      if (e?.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert('Błąd', 'Nie udało się wybrać pliku');
      }
    }
  };

  const handleDeleteExisting = (att: Attachment) => {
    Alert.alert('Usuń załącznik', `Czy na pewno chcesz usunąć ${att.fileName}?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/visits/attachments/${att.id}`);
            setExistingAttachments(prev => prev.filter(a => a.id !== att.id));
          } catch {
            // Jeśli endpoint nie istnieje, usuń tylko z widoku
            setExistingAttachments(prev => prev.filter(a => a.id !== att.id));
          }
        },
      },
    ]);
  };

  const handleRemoveNew = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await updateVisit(visitId, {
        title, visitType, vetNotes,
        visitDate: new Date(visitDate).toISOString(),
        cost: parseFloat(cost),
        weightAtVisit: parseFloat(weight),
        vetName: '',
      });

      // Dodaj nowe załączniki jeśli są
      if (newAttachments.length > 0) {
        const formData = new FormData();
        newAttachments.forEach((file) => {
          formData.append('attachments', {
            uri: file.uri,
            type: file.type ?? 'application/octet-stream',
            name: file.name ?? 'file',
          } as any);
        });
        await apiClient.post(`/api/visits/${visitId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      Alert.alert('Sukces', 'Wizyta została zaktualizowana!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Błąd', 'Nie udało się zaktualizować wizyty');
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
        <Text style={styles.title}>Edytuj wizytę</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Anuluj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input label="TYTUŁ WIZYTY" value={title} onChangeText={setTitle} />

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

        <Input label="DATA" value={visitDate} onChangeText={setVisitDate}
          icon="calendar" />
        <Input label="NOTATKI" value={vetNotes} onChangeText={setVetNotes}
          multiline maxLength={500} />

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

        {/* Istniejące załączniki */}
        {existingAttachments.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>OBECNE ZAŁĄCZNIKI</Text>
            {existingAttachments.map(att => (
              <View key={att.id} style={styles.attachmentRow}>
                <Icon name="file-document-outline" size={18} color={COLORS.primary} />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.fileName}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteExisting(att)}>
                  <Icon name="delete-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Nowe załączniki */}
        <Text style={styles.sectionLabel}>DODAJ ZAŁĄCZNIKI</Text>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile}>
          <Icon name="paperclip" size={20} color={COLORS.primary} />
          <Text style={styles.attachBtnText}>Kliknij, aby dodać załącznik</Text>
        </TouchableOpacity>
        <Text style={styles.attachHint}>JPG, PNG lub PDF • max 10 MB</Text>

        {newAttachments.map((file, index) => (
          <View key={index} style={styles.attachmentRow}>
            <Icon name="file-document-outline" size={18} color={COLORS.primary} />
            <Text style={styles.attachmentName} numberOfLines={1}>
              {file.name}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveNew(index)}>
              <Icon name="close" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.spacer} />
        <Button title="Zapisz zmiany" onPress={handleSave} loading={loading} />
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
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.inputBorder, backgroundColor: COLORS.white,
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
    marginBottom: 6, gap: 8,
  },
  attachmentName: { flex: 1, fontSize: 13, color: COLORS.textDark },
  spacer: { height: 24 },
});