import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { collection, getDocs, query, where, arrayContains } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { SearchResult } from '../../../types/search';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from '../../../hooks/useUserData';

interface LocationSearchProps {
  onNext: (results: SearchResult[]) => void;
  isActive: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onNext,
  isActive,
}) => {
  const { user } = useAuth();
  const { userData, loading: userDataLoading, error: userDataError } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  const [facilities, setFacilities] = useState<SearchResult[]>([]);
  const [cities, setCities] = useState<Set<string>>(new Set());
  const contentAnimation = new Animated.Value(0);

  useEffect(() => {
    if (!userDataLoading && userData?.professionId) {
      console.log('Fetching facilities with professionId:', userData.professionId);
      fetchFacilities();
    }
  }, [userData?.professionId, userDataLoading]);

  useEffect(() => {
    Animated.timing(contentAnimation, {
      toValue: isSearchActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSearchActive]);

  useEffect(() => {
    onNext(selectedResults);
  }, [selectedResults]);

  const fetchFacilities = async () => {
    try {
      if (!userData?.professionId) {
        console.log('Current userData:', userData);
        console.log('Current user:', user);
        return;
      }

      const facilitiesRef = collection(db, 'establishments');
      const q = query(
        facilitiesRef,
        where('professionIds', 'array-contains', userData.professionId)
      );
      
      const snapshot = await getDocs(q);
      const facilitiesData: SearchResult[] = [];
      const citiesSet = new Set<string>();

      snapshot.forEach((doc) => {
        const facility = doc.data();
        facilitiesData.push({
          id: doc.id,
          name: facility.name,
          address: facility.address,
          city: facility.city,
          type: 'facility',
        });
        citiesSet.add(facility.city);
      });

      setFacilities(facilitiesData);
      setCities(citiesSet);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const getSearchResults = () => {
    if (!isSearchActive) return [];
    if (!searchQuery) {
      const results: SearchResult[] = [];
      
      cities.forEach(city => {
        results.push({
          id: `city-${city}`,
          name: city,
          type: 'city',
        });
      });

      return [...results, ...facilities];
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    cities.forEach(city => {
      if (city.toLowerCase().includes(query)) {
        results.push({
          id: `city-${city}`,
          name: city,
          type: 'city',
        });
      }
    });

    facilities.forEach(facility => {
      if (
        facility.name.toLowerCase().includes(query) ||
        facility.address.toLowerCase().includes(query)
      ) {
        results.push(facility);
      }
    });

    return results;
  };

  const renderSearchResult = (result: SearchResult) => {
    const isSelected = selectedResults.some(item => item.id === result.id);
    
    return (
      <TouchableOpacity
        key={result.id}
        style={[
          styles.searchResultItem,
          isSelected && styles.searchResultItemSelected
        ]}
        onPress={() => handleResultSelect(result)}
      >
        <View style={[
          styles.searchResultIcon,
          result.type === 'city' ? styles.searchResultIconCity : styles.searchResultIconFacility,
          isSelected && styles.searchResultIconSelected
        ]}>
          <Ionicons
            name={isSelected ? "checkmark" : (result.type === 'city' ? 'location' : 'medical')}
            size={24}
            color={isSelected ? theme.colors.white : theme.colors.primary}
          />
        </View>
        <View style={styles.searchResultContent}>
          <Text style={[
            styles.searchResultName,
            isSelected && styles.searchResultTextSelected
          ]}>
            {result.name}
          </Text>
          {result.type === 'facility' && (
            <Text style={[
              styles.searchResultAddress,
              isSelected && styles.searchResultAddressSelected
            ]}>
              {result.address}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResults(prev => {
      const isAlreadySelected = prev.some(item => item.id === result.id);
      return isAlreadySelected 
        ? prev.filter(item => item.id !== result.id)
        : [...prev, result];
    });
  };

  if (!isActive) return null;

  if (userDataLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (userDataError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Une erreur est survenue</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une ville ou un établissement"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => !searchQuery && setIsSearchActive(false)}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {!isSearchActive ? (
        <Animated.View style={{
          transform: [{
            translateY: contentAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -56]
            })
          }]
        }}>
          

          <Text style={styles.sectionTitle}>Établissements :</Text>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.facilitiesContainer}
          >
            {facilities.slice(0, 3).map(facility => renderSearchResult(facility))}
          </ScrollView>
        </Animated.View>
      ) : (
        <View style={styles.searchContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchResultsContainer}
          >
            {getSearchResults().map(renderSearchResult)}
          </ScrollView>

          {selectedResults.length > 0 && (
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionInfoText}>
                {selectedResults.length} sélection{selectedResults.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.sm,
    fontSize: 16,
  },
  nearMeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
  },
  nearMeIconContainer: {
    marginRight: theme.spacing.sm,
  },
  nearMeContent: {
    flex: 1,
  },
  nearMeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nearMeSubtitle: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  facilitiesContainer: {
    padding: theme.spacing.sm,
  },
  searchContent: {
    flex: 1,
  },
  searchResultsContainer: {
    padding: theme.spacing.sm,
  },
  selectionInfo: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  selectionInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultItem: {
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
  searchResultItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  searchResultIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  searchResultIconCity: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  searchResultIconFacility: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  searchResultIconSelected: {
    backgroundColor: `${theme.colors.white}20`,
  },
  searchResultContent: {
    flex: 1,
    gap: 4,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  searchResultAddress: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  searchResultTextSelected: {
    color: theme.colors.white,
  },
  searchResultAddressSelected: {
    color: `${theme.colors.white}CC`,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 