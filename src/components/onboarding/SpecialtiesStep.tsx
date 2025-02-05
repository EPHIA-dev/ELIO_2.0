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
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedSpecialtyIds);

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
    const newSelection = localSelectedIds.includes(specialtyId)
      ? localSelectedIds.filter((id) => id !== specialtyId)
      : [...localSelectedIds, specialtyId];
    setLocalSelectedIds(newSelection);
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
            localSelectedIds.includes(specialty.id) &&
              styles.specialtyCardSelected,
          ]}
          onPress={() => toggleSpecialty(specialty.id)}
        >
          <Text
            style={[
              styles.specialtyName,
              localSelectedIds.includes(specialty.id) &&
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
