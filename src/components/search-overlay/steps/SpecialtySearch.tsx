import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface SpecialtySearchProps {
  availableIds: string[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  loading?: boolean;
}

interface SpecialtyData {
  id: string;
  name: string;
  description?: string;
}

export const SpecialtySearch: React.FC<SpecialtySearchProps> = ({
  availableIds,
  selectedIds,
  onSelect,
  loading = false
}) => {
  const [specialtyData, setSpecialtyData] = useState<Record<string, SpecialtyData>>({});

  // Charger les données des spécialités au besoin
  const loadSpecialtyData = async (id: string) => {
    if (specialtyData[id]) return;

    try {
      const docRef = doc(collection(db, 'specialties'), id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSpecialtyData(prev => ({
          ...prev,
          [id]: {
            id,
            name: data.name || '',
            description: data.description,
          }
        }));
      }
    } catch (error) {
      console.error('Error loading specialty data:', error);
    }
  };

  // Charger les données pour tous les IDs disponibles
  React.useEffect(() => {
    availableIds.forEach(loadSpecialtyData);
  }, [availableIds]);

  const handleSelect = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    onSelect(newSelection);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsContainer}
      >
        {availableIds.map(id => {
          const data = specialtyData[id];
          if (!data) return null;

          const isSelected = selectedIds.includes(id);
          
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.specialtyItem,
                isSelected && styles.selectedItem
              ]}
              onPress={() => handleSelect(id)}
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
                  {data.name}
                </Text>
                {data.description && (
                  <Text style={[
                    styles.specialtyDescription,
                    isSelected && styles.specialtyDescriptionSelected
                  ]}>
                    {data.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  resultsContainer: {
    gap: theme.spacing.sm,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  selectedItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  specialtyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
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
});
