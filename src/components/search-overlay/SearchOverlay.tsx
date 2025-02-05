import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { LocationSearch } from './steps/LocationSearch';
import { DateSearch } from './steps/DateSearch';
import { SpecialtySearch } from './steps/SpecialtySearch';
import { Specialty } from '../../types/search';
import { SearchResult } from '../../types/search';
import { useUserData } from '../../hooks/useUserData';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { format } from 'date-fns';
import { BACKEND_URL } from '@env';

type Step = 'location' | 'date' | 'specialty';

interface SearchState {
  selectedEstablishmentIds: string[];
  selectedDates: { startDate: string; endDate: string } | null;
  selectedSpecialtyIds: string[];
}

interface SearchParams {
  professionId: string;
  establishmentIds: string[];
  specialtyIds?: string[];
  startDate?: string;
  endDate?: string;
}

export const SearchOverlay: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { userData } = useUserData();
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState<Step>('location');

  // États pour les données Firebase
  const [availableEstablishmentIds, setAvailableEstablishmentIds] = useState<string[]>([]);
  const [availableSpecialtyIds, setAvailableSpecialtyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // État des sélections
  const [searchState, setSearchState] = useState<SearchState>({
    selectedEstablishmentIds: [],
    selectedDates: null,
    selectedSpecialtyIds: [],
  });

  // Charger les données une seule fois au montage
  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.professionId) return;
      
      try {
        setLoading(true);
        
        // Charger les établissements
        const facilitiesRef = collection(db, 'establishments');
        const q = query(
          facilitiesRef,
          where('professionIds', 'array-contains', userData.professionId)
        );
        const snapshot = await getDocs(q);
        setAvailableEstablishmentIds(snapshot.docs.map(doc => doc.id));

        // Charger les spécialités
        const specialtiesRef = collection(db, 'specialties');
        const specialtiesQuery = query(
          specialtiesRef,
          where('professionId', '==', userData.professionId),
          where('isActive', '==', true)
        );
        const specialtiesSnapshot = await getDocs(specialtiesQuery);
        setAvailableSpecialtyIds(specialtiesSnapshot.docs.map(doc => doc.id));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) fetchData();
  }, [visible, userData?.professionId]);

  const handleNextStep = () => {
    switch (activeStep) {
      case 'location':
        setActiveStep('date');
        break;
      case 'date':
        setActiveStep('specialty');
        break;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 'location':
        return searchState.selectedEstablishmentIds.length > 0;
      case 'date':
        return searchState.selectedDates !== null;
      case 'specialty':
        return searchState.selectedSpecialtyIds.length > 0;
      default:
        return false;
    }
  };

  const handleSearch = async () => {
    if (!userData?.professionId || !searchState.selectedEstablishmentIds.length) {
      console.warn('Search aborted:', { 
        hasProfessionId: !!userData?.professionId,
        professionId: userData?.professionId,
        hasEstablishments: searchState.selectedEstablishmentIds.length > 0 
      });
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No auth token available');

      // Construction des paramètres de base
      const searchParams: SearchParams = {
        professionId: userData.professionId,
        establishmentIds: searchState.selectedEstablishmentIds,
      };

      // Ajout des spécialités si sélectionnées
      if (searchState.selectedSpecialtyIds.length > 0) {
        searchParams.specialtyIds = searchState.selectedSpecialtyIds;
      }

      // Ajout des dates uniquement si sélectionnées
      if (searchState.selectedDates) {
        searchParams.startDate = searchState.selectedDates.startDate;
        searchParams.endDate = searchState.selectedDates.endDate;
      }

      // Log des données de recherche
      console.log('Recherche avec les paramètres suivants:', {
        établissements: searchState.selectedEstablishmentIds,
        ...(searchState.selectedDates && { dates: searchState.selectedDates }),
        ...(searchState.selectedSpecialtyIds.length > 0 && { spécialités: searchState.selectedSpecialtyIds })
      });

      // Appel à votre route
      const response = await fetch(`${BACKEND_URL}/search_replacements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erreur lors de la recherche:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Échec de la recherche: ${response.status} ${response.statusText}`);
      }

      const results = await response.json();
      
      // Affichage des résultats avec emoticon
      const count = Array.isArray(results) ? results.length : 0;
      let emoji = '🤔';
      if (count === 0) {
        emoji = '😕';
      } else if (count < 5) {
        emoji = '👍';
      } else if (count < 10) {
        emoji = '🎉';
      } else {
        emoji = '🚀';
      }
      
      console.log(`${emoji} ${count} remplacement${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''} !`);
      console.log('Résultats détaillés:', results);
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  if (!visible) return null;
  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + theme.spacing.xl }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.stepContainer, activeStep !== 'location' && styles.stepContainerCompact]} 
          onPress={() => setActiveStep('location')}
          activeOpacity={1}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>Établissements</Text>
            {searchState.selectedEstablishmentIds.length > 0 && (
              <Text style={styles.stepSummary}>
                {searchState.selectedEstablishmentIds.length} sélectionné(s)
              </Text>
            )}
          </View>
          {activeStep === 'location' && (
            <>
              <LocationSearch
                availableIds={availableEstablishmentIds}
                selectedIds={searchState.selectedEstablishmentIds}
                onSelect={ids => setSearchState(prev => ({ ...prev, selectedEstablishmentIds: ids }))}
                loading={loading}
              />
              <View style={styles.stepFooter}>
                <TouchableOpacity
                  style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
                  onPress={handleNextStep}
                  disabled={!canProceed()}
                >
                  <Text style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}>
                    Suivant
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.stepContainer, activeStep !== 'date' && styles.stepContainerCompact]}
          onPress={() => setActiveStep('date')}
          activeOpacity={1}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>Dates</Text>
            {searchState.selectedDates && (
              <Text style={styles.stepSummary}>
                Du {format(new Date(searchState.selectedDates.startDate), 'dd/MM/yyyy')} au {format(new Date(searchState.selectedDates.endDate), 'dd/MM/yyyy')}
              </Text>
            )}
          </View>
          {activeStep === 'date' && (
            <>
              <DateSearch
                selectedDates={searchState.selectedDates}
                onSelect={dates => setSearchState(prev => ({ ...prev, selectedDates: dates }))}
              />
              <View style={styles.stepFooter}>
                <TouchableOpacity
                  style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
                  onPress={handleNextStep}
                  disabled={!canProceed()}
                >
                  <Text style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}>
                    Suivant
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.stepContainer, activeStep !== 'specialty' && styles.stepContainerCompact]}
          onPress={() => setActiveStep('specialty')}
          activeOpacity={1}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>Spécialités</Text>
            {searchState.selectedSpecialtyIds.length > 0 && (
              <Text style={styles.stepSummary}>
                {searchState.selectedSpecialtyIds.length} sélectionnée(s)
              </Text>
            )}
          </View>
          {activeStep === 'specialty' && (
            <>
              <SpecialtySearch
                availableIds={availableSpecialtyIds}
                selectedIds={searchState.selectedSpecialtyIds}
                onSelect={ids => setSearchState(prev => ({ ...prev, selectedSpecialtyIds: ids }))}
                loading={loading}
              />
              <View style={styles.stepFooter}>
                <TouchableOpacity
                  style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
                  onPress={onClose}
                  disabled={!canProceed()}
                >
                  <Text style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}>
                    Terminer
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.globalFooter, { paddingBottom: insets.bottom }]}>
        <View style={styles.globalFooterContent}>
          <View style={styles.globalFooterRow}>
            <TouchableOpacity
              style={[
                styles.searchButton,
                !searchState.selectedEstablishmentIds.length && styles.searchButtonDisabled
              ]}
              onPress={handleSearch}
              disabled={!searchState.selectedEstablishmentIds.length}
            >
              <Text style={[
                styles.searchButtonText,
                !searchState.selectedEstablishmentIds.length && styles.searchButtonTextDisabled
              ]}>
                Rechercher
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resetButton,
                (!searchState.selectedEstablishmentIds.length && 
                 !searchState.selectedDates && 
                 !searchState.selectedSpecialtyIds.length) && styles.resetButtonDisabled
              ]}
              onPress={() => {
                setSearchState({
                  selectedEstablishmentIds: [],
                  selectedDates: null,
                  selectedSpecialtyIds: [],
                });
              }}
              disabled={!searchState.selectedEstablishmentIds.length && 
                       !searchState.selectedDates && 
                       !searchState.selectedSpecialtyIds.length}
            >
              <MaterialIcons 
                name="refresh" 
                size={24} 
                color={(!searchState.selectedEstablishmentIds.length && 
                       !searchState.selectedDates && 
                       !searchState.selectedSpecialtyIds.length) 
                  ? theme.colors.gray[400] 
                  : theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    marginTop: theme.spacing.xl * 2,
    marginHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  stepContainerCompact: {
    maxHeight: 60,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  stepSummary: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  stepFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  nextButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
  globalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  globalFooterContent: {
    padding: theme.spacing.md,
  },
  globalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  searchButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  searchButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
}); 