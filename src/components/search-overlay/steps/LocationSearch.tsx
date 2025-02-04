import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface LocationSearchProps {
  availableIds: string[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  loading?: boolean;
}

interface EstablishmentData {
  id: string;
  name: string;
  address: string;
  city: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  availableIds,
  selectedIds,
  onSelect,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [establishmentData, setEstablishmentData] = useState<Record<string, EstablishmentData>>({});

  // Charger les données des établissements au besoin
  const loadEstablishmentData = async (id: string) => {
    if (establishmentData[id]) return;

    try {
      const docRef = doc(collection(db, 'establishments'), id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEstablishmentData(prev => ({
          ...prev,
          [id]: {
            id,
            name: data.name || '',
            address: data.address || '',
            city: data.city || '',
          }
        }));
      }
    } catch (error) {
      console.error('Error loading establishment data:', error);
    }
  };

  // Charger les données pour tous les IDs disponibles
  React.useEffect(() => {
    availableIds.forEach(loadEstablishmentData);
  }, [availableIds]);

  const handleSelect = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    onSelect(newSelection);
  };

  const getFilteredIds = () => {
    if (!searchQuery) return availableIds;
    
    const query = searchQuery.toLowerCase();
    return availableIds.filter(id => {
      const data = establishmentData[id];
      if (!data) return false;
      
      return (
        data.name.toLowerCase().includes(query) ||
        data.address.toLowerCase().includes(query) ||
        data.city.toLowerCase().includes(query)
      );
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un établissement"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchActive(true)}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsContainer}
      >
        {getFilteredIds().map(id => {
          const data = establishmentData[id];
          if (!data) return null;

          const isSelected = selectedIds.includes(id);
          
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.resultItem,
                isSelected && styles.resultItemSelected
              ]}
              onPress={() => handleSelect(id)}
            >
              <View style={[
                styles.resultIcon,
                isSelected && styles.resultIconSelected
              ]}>
                <Ionicons
                  name={isSelected ? "checkmark" : "medical"}
                  size={24}
                  color={isSelected ? theme.colors.white : theme.colors.primary}
                />
              </View>
              <View style={styles.resultContent}>
                <Text style={[
                  styles.resultName,
                  isSelected && styles.resultTextSelected
                ]}>
                  {data.name}
                </Text>
                <Text style={[
                  styles.resultAddress,
                  isSelected && styles.resultAddressSelected
                ]}>
                  {data.address}
                </Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  resultsContainer: {
    gap: theme.spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  resultItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  resultIconSelected: {
    backgroundColor: `${theme.colors.white}20`,
  },
  resultContent: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  resultAddress: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  resultTextSelected: {
    color: theme.colors.white,
  },
  resultAddressSelected: {
    color: `${theme.colors.white}CC`,
  },
}); 