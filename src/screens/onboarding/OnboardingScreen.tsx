import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PersonalInfoStep } from "../../components/onboarding/PersonalInfoStep";
import { ProfessionStep } from "../../components/onboarding/ProfessionStep";
import { SpecialtiesStep } from "../../components/onboarding/SpecialtiesStep";
import { theme } from "../../styles/theme";
import { useAuth } from '../../contexts/AuthContext';
import { BACKEND_URL } from '@env';
import ElioLogo from '../../../assets/logo/elio_logo_white.svg';
import { api } from '../../config/api';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    birthDate: null as Date | null,
  });

  const handleNext = async () => {
    try {
      if (step === 3 && user) {
        await api.updateUser(user.uid, {
          professionId,
          specialtyIds,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          birthDate: personalInfo.birthDate,
          isProfileComplete: true
        });

        onComplete();
      } else {
        setStep(step + 1);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la mise à jour de votre profil.',
        [{ text: 'OK' }]
      );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return professionId !== null;
      case 2:
        return specialtyIds.length > 0;
      case 3:
        return (
          personalInfo.firstName.trim() !== "" &&
          personalInfo.lastName.trim() !== "" &&
          personalInfo.birthDate !== null
        );
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ProfessionStep
            onSelectProfession={setProfessionId}
            selectedProfessionId={professionId}
          />
        );
      case 2:
        return professionId ? (
          <SpecialtiesStep
            professionId={professionId}
            onSelectSpecialties={setSpecialtyIds}
            selectedSpecialtyIds={specialtyIds}
          />
        ) : null;
      case 3:
        return (
          <PersonalInfoStep
            personalInfo={personalInfo}
            onUpdatePersonalInfo={setPersonalInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <ElioLogo width={180} height={180} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1
              ? "Votre profession"
              : step === 2
              ? "Vos spécialités"
              : "Vos informations"}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Sélectionnez votre profession principale"
              : step === 2
              ? "Sélectionnez vos spécialités"
              : "Complétez vos informations personnelles"}
          </Text>
        </View>

        <View style={styles.content}>{renderStep()}</View>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text
              style={[
                styles.nextButtonText,
                !canProceed() && styles.nextButtonTextDisabled,
              ]}
            >
              {step === 3 ? "Terminer" : "Suivant"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  logoContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  formContainer: {
    flex: 0.6,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  backButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  nextButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  nextButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
});
