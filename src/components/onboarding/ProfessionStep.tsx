import { collection, getDocs } from "firebase/firestore";
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
import { updateUserProfile } from '../../api/backend';
import { useAuth } from '../../contexts/AuthContext';

interface Profession {
  id: string;
  name: string;
}

interface ProfessionStepProps {
  onSelect: (professionId: string) => void;
  selectedProfessionId?: string;
}

export const ProfessionStep: React.FC<ProfessionStepProps> = ({
  onSelect,
  selectedProfessionId,
}) => {
  const { user } = useAuth();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSelectedId, setLocalSelectedId] = useState(selectedProfessionId);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "professions"));
        const professionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setProfessions(professionsData);
      } catch (error) {
        console.error("Error fetching professions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  const handleSelect = (professionId: string) => {
    setLocalSelectedId(professionId);
    onSelect(professionId);
  };

  const handleSubmit = async () => {
    try {
      if (user?.uid && localSelectedId) {
        await updateUserProfile(user.uid, {
          professionId: localSelectedId,
        });
      }
    } catch (error) {
      console.error('Error updating profession:', error);
    }
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
      {professions.map((profession) => (
        <TouchableOpacity
          key={profession.id}
          style={[
            styles.professionCard,
            localSelectedId === profession.id &&
              styles.professionCardSelected,
          ]}
          onPress={() => handleSelect(profession.id)}
        >
          <Text
            style={[
              styles.professionName,
              localSelectedId === profession.id &&
                styles.professionNameSelected,
            ]}
          >
            {profession.name}
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
  professionCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  professionCardSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  professionName: {
    fontSize: 16,
    color: theme.colors.gray[900],
    fontWeight: "500",
  },
  professionNameSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
