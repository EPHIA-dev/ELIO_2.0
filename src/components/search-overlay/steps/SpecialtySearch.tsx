import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { useSpecialties, Specialty } from '../../../hooks/useSpecialties';

interface SpecialtySearchProps {
  onNext: (specialty: Specialty[]) => void;
  isActive: boolean;
}

export const SpecialtySearch: React.FC<SpecialtySearchProps> = ({ onNext, isActive }) => {
  const { specialties, loading, error } = useSpecialties();
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    onNext(selectedSpecialties);
  }, [selectedSpecialties]);

  const handleSelectSpecialty = (specialty: Specialty) => {
    setSelectedSpecialties(prev => {
      const isAlreadySelected = prev.some(item => item.id === specialty.id);
      return isAlreadySelected
        ? prev.filter(item => item.id !== specialty.id)
        : [...prev, specialty];
    });
  };

  if (!isActive) return null;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={specialties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedSpecialties.some(s => s.id === item.id);
          return (
            <TouchableOpacity
              style={[
                styles.specialtyItem,
                isSelected && styles.selectedItem
              ]}
              onPress={() => handleSelectSpecialty(item)}
            >
              <View style={[
                styles.specialtyIcon,
                isSelected && styles.specialtyIconSelected
              ]}>
                <MaterialIcons
                  name={isSelected ? "check" : "medical-services"}
                  size={24}
                  color={isSelected ? theme.colors.white : theme.colors.primary}
                />
              </View>
              <View style={styles.specialtyContent}>
                <Text style={[
                  styles.specialtyName,
                  isSelected && styles.specialtyTextSelected
                ]}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={[
                    styles.specialtyDescription,
                    isSelected && styles.specialtyDescriptionSelected
                  ]}>
                    {item.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  list: {
    maxHeight: '100%',
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  specialtyIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  specialtyIconSelected: {
    backgroundColor: `${theme.colors.white}20`,
  },
  specialtyContent: {
    flex: 1,
    gap: 4,
  },
  specialtyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  specialtyDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  specialtyTextSelected: {
    color: theme.colors.white,
  },
  specialtyDescriptionSelected: {
    color: `${theme.colors.white}CC`,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
});
