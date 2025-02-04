import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { theme } from "../../styles/theme";

interface Specialty {
  id: string;
  name: string;
  professionId: string;
}

interface SpecialtiesStepProps {
  professionId: string;
  onSelectSpecialties: (specialtyIds: string[]) => void;
  selectedSpecialtyIds: string[];
}

export const SpecialtiesStep: React.FC<SpecialtiesStepProps> = ({
  professionId,
  onSelectSpecialties,
  selectedSpecialtyIds,
}) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const specialtiesQuery = query(
          collection(db, "specialties"),
          where("professionId", "==", professionId)
        );
        const querySnapshot = await getDocs(specialtiesQuery);
        const specialtiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          professionId: doc.data().professionId,
        }));
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error("Error fetching specialties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, [professionId]);

  const toggleSpecialty = (specialtyId: string) => {
    const newSelection = selectedSpecialtyIds.includes(specialtyId)
      ? selectedSpecialtyIds.filter((id) => id !== specialtyId)
      : [...selectedSpecialtyIds, specialtyId];
    onSelectSpecialties(newSelection);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {specialties.map((specialty) => (
        <TouchableOpacity
          key={specialty.id}
          style={[
            styles.specialtyCard,
            selectedSpecialtyIds.includes(specialty.id) &&
              styles.specialtyCardSelected,
          ]}
          onPress={() => toggleSpecialty(specialty.id)}
        >
          <Text
            style={[
              styles.specialtyName,
              selectedSpecialtyIds.includes(specialty.id) &&
                styles.specialtyNameSelected,
            ]}
          >
            {specialty.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  specialtyCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  specialtyCardSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  specialtyName: {
    fontSize: 16,
    color: theme.colors.gray[900],
    fontWeight: "500",
  },
  specialtyNameSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
