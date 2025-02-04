import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../../styles/theme";
import { HomeHeader } from "./components/HomeHeader";
import { SearchCard } from "./components/SearchCard";

export const HomeScreen = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleSearchPress = () => {
    // Navigation vers la recherche
  };

  return (
    <View style={styles.mainContainer}>
      <HomeHeader userName="Michel" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <SearchCard onPress={handleSearchPress} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochains remplacements</Text>
          <View style={styles.card}>
            <Text style={styles.placeholder}>Aucun remplacement prévu</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique</Text>
          <View style={styles.card}>
            <Text style={styles.placeholder}>Aucun remplacement effectué</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>38</Text>
            <Text style={styles.statLabel}>Missions réalisées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>92%</Text>
            <Text style={styles.statLabel}>Taux d'acceptation</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholder: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: "center",
    padding: theme.spacing.md,
  },
  statsCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  referralCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  referralTextContainer: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  referralText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  referralButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  referralButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
});
