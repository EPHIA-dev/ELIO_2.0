import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../styles/theme";

interface Speciality {
  id: string;
  name: string;
  professionId: string;
}

interface MapOverlayHeaderProps {
  isFullScreen: boolean;
  onSearchPress: () => void;
}

export const MapOverlayHeader: React.FC<MapOverlayHeaderProps> = ({
  isFullScreen,
  onSearchPress,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(
    null
  );
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [userProfessionId, setUserProfessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfession = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const professionId = userDoc.data()?.professionId;
        setUserProfessionId(professionId);
      } catch (error) {
        console.error("Error fetching user profession:", error);
      }
    };

    fetchUserProfession();
  }, [user]);

  useEffect(() => {
    const fetchSpecialities = async () => {
      if (!userProfessionId) return;
      try {
        console.log("Fetching specialities...");
        const querySnapshot = await getDocs(collection(db, "specialties"));
        console.log("Number of docs:", querySnapshot.docs.length);
        const specialitiesData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            console.log("Doc data:", data);
            return {
              id: doc.id,
              name: data.name,
              professionId: data.professionId,
            };
          })
          .filter((specialty) => specialty.professionId === userProfessionId);
        console.log("Filtered specialities data:", specialitiesData);
        setSpecialities(specialitiesData);
      } catch (error) {
        console.error("Error fetching specialities:", error);
      }
    };

    fetchSpecialities();
  }, [userProfessionId]);

  const handleSpecialityPress = (specialityId: string) => {
    setSelectedSpeciality(
      selectedSpeciality === specialityId ? null : specialityId
    );
  };

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top },
        isFullScreen && styles.headerContainerFullScreen,
      ]}
    >
      <View style={styles.searchBarContainer}>
        <TouchableOpacity 
          style={styles.searchInput}
          onPress={onSearchPress}
        >
          <Text style={styles.searchPlaceholder}>Rechercher...</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.placesContainer}
      >
        {specialities.map((speciality, index) => {
          const isSelected = selectedSpeciality === speciality.id;
          return (
            <TouchableOpacity
              key={speciality.id}
              onPress={() => handleSpecialityPress(speciality.id)}
              style={[
                styles.placeChip,
                index === 0 && { marginLeft: theme.spacing.md },
                isSelected && styles.placeChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.placeText,
                  isSelected && styles.placeTextSelected,
                ]}
              >
                {speciality.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: "transparent",
  },
  headerContainerFullScreen: {
    backgroundColor: theme.colors.white,
  },
  searchBarContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  searchInput: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm+3,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 50,
    fontSize: 16,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  placesContainer: {
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  placeChip: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  placeChipSelected: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  placeText: {
    fontSize: 14,
    color: theme.colors.gray[900],
    fontWeight: "500",
  },
  placeTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  searchPlaceholder: {
    color: theme.colors.gray[400],
    fontSize: 16,
  },
});
