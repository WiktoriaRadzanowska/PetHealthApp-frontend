import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Pet } from '../types';

interface Props {
  pet: Pet;
  onPress: () => void;
}

export default function PetCard({ pet, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={
          pet.photoUrl
            ? { uri: pet.photoUrl }
            : require('../assets/pet-placeholder.png')
        }
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.breed}>{pet.breed}</Text>
        <Text style={styles.meta}>
          {pet.ageDisplay} • {pet.weightKg} kg
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 110,
    height: 110,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  breed: {
    fontSize: 13,
    color: COLORS.textGray,
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 8,
  },
});