import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../../config/firebase";
import { theme } from "../../styles/theme";
import { ReplacementCard } from "../shared/ReplacementCard";

interface Replacement {
  id: string;
  description: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  periods: string[];
  establishmentId: string;
  rate: {
    amount: number;
    currency: string;
    period: string;
  };
}

interface Establishment {
  id: string;
  name: string;
}

interface GroupedReplacements {
  establishment: Establishment;
  replacements: Replacement[];
}

export const SearchBottomContent: React.FC = () => {
  const [groupedReplacements, setGroupedReplacements] = useState<
    GroupedReplacements[]
  >([]);

  useEffect(() => {
    const fetchReplacementsAndEstablishments = async () => {
      try {
        // Fetch all replacements
        const replacementsSnapshot = await getDocs(
          collection(db, "replacements")
        );
        const replacementsData = replacementsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Replacement[];

        // Get unique establishment IDs
        const establishmentIds = [
          ...new Set(replacementsData.map((r) => r.establishmentId)),
        ];

        // Fetch establishment details
        const establishmentsData = await Promise.all(
          establishmentIds.map(async (id) => {
            const establishmentDoc = await getDoc(
              doc(db, "establishments", id)
            );
            return {
              id,
              name: establishmentDoc.data()?.name || "Établissement inconnu",
            };
          })
        );

        // Group replacements by establishment
        const grouped = establishmentsData.map((establishment) => ({
          establishment,
          replacements: replacementsData.filter(
            (replacement) => replacement.establishmentId === establishment.id
          ),
        }));

        setGroupedReplacements(grouped);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchReplacementsAndEstablishments();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {groupedReplacements.map(({ establishment, replacements }, index) => (
        <View key={establishment.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{establishment.name}</Text>
          {replacements.map((replacement) => (
            <View key={replacement.id} style={styles.cardContainer}>
              <ReplacementCard
                replacement={replacement}
                onPress={() =>
                  console.log("Pressed replacement:", replacement.id)
                }
              />
            </View>
          ))}
          {index < groupedReplacements.length - 1 && (
            <View style={styles.separator} />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.md,
  },
  cardContainer: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  separator: {
    height: 8,
    backgroundColor: theme.colors.gray[100],
    marginTop: theme.spacing.sm,
    marginHorizontal: -theme.spacing.md,
  },
});
