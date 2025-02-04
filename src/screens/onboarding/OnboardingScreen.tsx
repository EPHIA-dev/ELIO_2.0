import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { updateUserProfile } from "../../api/users";
import { PersonalInfoStep } from "../../components/onboarding/PersonalInfoStep";
import { ProfessionStep } from "../../components/onboarding/ProfessionStep";
import { SpecialtiesStep } from "../../components/onboarding/SpecialtiesStep";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../styles/theme";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState<{
    firstName: string;
    lastName: string;
    birthDate: string;
  } | null>(null);
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>();
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(
    []
  );

  const handleNext = async () => {
    if (!user) return;

    const nextStep = currentStep + 1;
    try {
      if (currentStep === 0) {
        if (!personalInfo) return;
        await updateUserProfile(user.uid, {
          ...personalInfo,
          onboardingStep: nextStep,
        });
      } else if (currentStep === 1 && selectedProfessionId) {
        await updateUserProfile(user.uid, {
          professionId: selectedProfessionId,
          onboardingStep: nextStep,
        });
      } else if (currentStep === 2 && selectedSpecialtyIds.length > 0) {
        await updateUserProfile(user.uid, {
          specialityIds: selectedSpecialtyIds,
          onboardingStep: nextStep,
          isProfileComplete: true,
        });
      } else {
        await updateUserProfile(user.uid, {
          onboardingStep: nextStep,
        });
      }

      if (nextStep === 3) {
        onComplete();
      } else {
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      Alert.alert("Error", "Failed to update onboarding progress");
    }
  };

  const canProceed = () => {
    if (currentStep === 0 && !personalInfo) {
      return false;
    }
    if (currentStep === 1 && !selectedProfessionId) {
      return false;
    }
    if (currentStep === 2 && selectedSpecialtyIds.length === 0) {
      return false;
    }
    return true;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Vos informations</Text>
            <Text style={styles.description}>
              Pour commencer, nous avons besoin de quelques informations de
              base.
            </Text>
            <PersonalInfoStep onSubmit={setPersonalInfo} />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Votre Profession</Text>
            <Text style={styles.description}>
              Sélectionnez votre profession pour accéder aux remplacements qui
              vous correspondent.
            </Text>
            <ProfessionStep
              onSelect={setSelectedProfessionId}
              selectedProfessionId={selectedProfessionId}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Vos Spécialités</Text>
            <Text style={styles.description}>
              Choisissez vos spécialités pour affiner les remplacements qui vous
              seront proposés.
            </Text>
            {selectedProfessionId && (
              <SpecialtiesStep
                professionId={selectedProfessionId}
                onSelectSpecialties={setSelectedSpecialtyIds}
                selectedSpecialtyIds={selectedSpecialtyIds}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
      {renderStep()}
      <TouchableOpacity
        style={[styles.button, !canProceed() && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!canProceed()}
      >
        <Text style={styles.buttonText}>
          {currentStep === 2 ? "Terminer" : "Suivant"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.gray[200],
    marginHorizontal: theme.spacing.xs,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: theme.colors.gray[500],
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
