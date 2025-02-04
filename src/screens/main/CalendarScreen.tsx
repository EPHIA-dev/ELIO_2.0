import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../../styles/theme";

export const CalendarScreen = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Ajoutez ici la logique de rafraîchissement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.calendarCard}>
          {/* Composant calendrier à venir */}
          <Text style={styles.placeholder}>
            Calendrier en cours de développement
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Événements à venir</Text>
          <View style={styles.card}>
            {/* Liste des événements */}
            <Text style={styles.placeholder}>Aucun événement prévu</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilités</Text>
          <View style={styles.card}>
            {/* Gestion des disponibilités */}
            <Text style={styles.placeholder}>
              Configurez vos disponibilités pour recevoir des propositions de
              remplacement
            </Text>
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
  calendarCard: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minHeight: 300,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
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
});
