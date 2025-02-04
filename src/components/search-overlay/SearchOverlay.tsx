import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { SearchStep } from './SearchStep';
import { LocationSearch } from './steps/LocationSearch';
import { DateSearch } from './steps/DateSearch';
import { SpecialtySearch } from './steps/SpecialtySearch';
import { Specialty } from '../../hooks/useSpecialties';
import { SearchResult } from './steps/LocationSearch';

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
}

interface SearchState {
  location: SearchResult[] | null;
  date: { startDate: string; endDate: string } | null;
  specialty: Specialty[] | null;
}

const formatDateRange = (dates: { startDate: string; endDate: string } | null) => {
  if (!dates) return '';
  const start = new Date(dates.startDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
  const end = new Date(dates.endDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
  return `${start} - ${end}`;
};

const formatLocations = (locations: SearchResult[] | null) => {
  if (!locations || locations.length === 0) return '';
  if (locations.length === 1) {
    const location = locations[0];
    return location.type === 'city' ? location.name : `${location.name} (${location.city})`;
  }
  return `${locations.length} lieux sélectionnés`;
};

const formatSpecialties = (specialties: Specialty[] | null) => {
  if (!specialties || specialties.length === 0) return '';
  if (specialties.length === 1) return specialties[0].name;
  return `${specialties.length} spécialités sélectionnées`;
};

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  visible,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [searchState, setSearchState] = useState<SearchState>({
    location: null,
    date: null,
    specialty: null,
  });
  const insets = useSafeAreaInsets();

  const steps = [
    {
      title: 'Lieu',
      component: LocationSearch,
    },
    {
      title: 'Date',
      component: DateSearch,
    },
    {
      title: 'Spécialité',
      component: SpecialtySearch,
    },
  ];

  const handleStepComplete = (step: keyof SearchState, value: any) => {
    setSearchState(prev => ({
      ...prev,
      [step]: value
    }));
  };

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const canSearch = searchState.location && searchState.location.length > 0;

  const handleReset = () => {
    setSearchState({
      location: null,
      date: null,
      specialty: null,
    });
    setActiveStep(0);
  };

  const handleSearch = () => {
    console.log('Search with:', searchState);
  };

  const getSummary = (step: string) => {
    switch (step.toLowerCase()) {
      case 'lieu':
        return formatLocations(searchState.location);
      case 'date':
        return formatDateRange(searchState.date);
      case 'spécialité':
        return formatSpecialties(searchState.specialty);
      default:
        return '';
    }
  };

  const getStepCanContinue = (step: string) => {
    const value = searchState[step.toLowerCase() as keyof SearchState];
    switch (step.toLowerCase()) {
      case 'lieu':
        return Array.isArray(value) && value.length > 0;
      case 'date':
        return !!value;
      case 'spécialité':
        return Array.isArray(value) && value.length > 0;
      default:
        return false;
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BlurView 
        intensity={20} 
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.backdrop]} 
      />
      <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={[styles.closeButton, { top: insets.top + theme.spacing.sm }]} 
          onPress={onClose}
        >
          <MaterialIcons name="close" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.content}>
          {steps.map((step, index) => (
            <SearchStep
              key={step.title}
              title={step.title}
              isActive={activeStep === index}
              isCompleted={index < activeStep}
              onPress={() => setActiveStep(index)}
              canContinue={getStepCanContinue(step.title)}
              onNext={handleNextStep}
              summary={getSummary(step.title)}
            >
              <step.component
                onNext={(value) => handleStepComplete(step.title.toLowerCase() as keyof SearchState, value)}
                isActive={activeStep === index}
              />
            </SearchStep>
          ))}
        </View>
        <View style={[
          styles.footer, 
          { paddingBottom: Math.max(insets.bottom + theme.spacing.md, theme.spacing.xl) }
        ]}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButton}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.searchButton,
              !canSearch && styles.searchButtonDisabled
            ]}
            onPress={handleSearch}
            disabled={!canSearch}
          >
            <Text style={[
              styles.searchButtonText,
              !canSearch && styles.searchButtonTextDisabled
            ]}>
              Rechercher
            </Text>
          </TouchableOpacity>
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
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: theme.spacing.xl * 2, // Espace pour le bouton de fermeture
    marginHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    zIndex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  resetButton: {
    color: theme.colors.gray[500],
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  searchButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
  searchButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
}); 