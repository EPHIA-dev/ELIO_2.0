import { Ionicons } from "@expo/vector-icons";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../styles/theme";
import { ProfileHeader } from "./components/ProfileHeader";

type IconName = keyof typeof Ionicons.glyphMap;

interface UserData extends DocumentData {
  stats?: {
    completedMissions: number;
    acceptanceRate: number;
    rating: number;
  };
}

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData(false);
  }, []);

  const loadUserData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadUserData(true);
  };

  const renderMenuItem = (
    icon: IconName,
    title: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={theme.colors.text.primary} />
      <Text style={styles.menuItemText}>{title}</Text>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={theme.colors.text.secondary}
      />
    </TouchableOpacity>
  );

  const PreviewButton = () => (
    <TouchableOpacity style={styles.previewButton} onPress={() => {}}>
      <Ionicons
        name="eye-outline"
        size={24}
        color={theme.colors.text.primary}
      />
    </TouchableOpacity>
  );

  const StatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {userData?.stats?.completedMissions || 0}
        </Text>
        <Text style={styles.statLabel}>Missions réalisées</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {userData?.stats?.acceptanceRate || 0}%
        </Text>
        <Text style={styles.statLabel}>Taux d'acceptation</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userData?.stats?.rating || 0}★</Text>
        <Text style={styles.statLabel}>Note moyenne</Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadUserData(false)}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ProfileHeader
        rightComponent={<PreviewButton />}
        title="Prévisualisez votre profil"
        subtitle="Complétez vos informations"
        showChevron
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {userData ? (
          <StatsCard />
        ) : (
          <View style={styles.statsCard}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        {/* Carte de parrainage */}
        <TouchableOpacity style={styles.referralCard}>
          <View style={styles.referralContent}>
            <View style={styles.referralTextContainer}>
              <Text style={styles.referralTitle}>
                Parrainez des professionnels
              </Text>
              <Text style={styles.referralText}>
                Invitez vos collègues à rejoindre Elio et gagnez des avantages
                exclusifs
              </Text>
              <View style={styles.referralButton}>
                <Text style={styles.referralButtonText}>Commencer</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.white}
                  style={styles.referralButtonIcon}
                />
              </View>
            </View>
            <View style={styles.referralIconContainer}>
              <Ionicons name="people" size={48} color={theme.colors.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>
          {renderMenuItem("person-outline", "Informations personnelles")}
          {renderMenuItem("school-outline", "Parcours professionnel")}
        </View>

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          {renderMenuItem("calendar-outline", "Disponibilités")}
          {renderMenuItem("ribbon-outline", "Compétences")}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderMenuItem("notifications-outline", "Notifications")}
          {renderMenuItem("mail-outline", "Préférences emails")}
        </View>

        {/* Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          {renderMenuItem("settings-outline", "Paramètres du compte")}
          {renderMenuItem("shield-outline", "Confidentialité")}
          {renderMenuItem("card-outline", "Paiements")}
        </View>

        {/* Administratif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administratif</Text>
          {renderMenuItem("calculator-outline", "Gestion Administrative")}
          {renderMenuItem("document-text-outline", "Contrats")}
          {renderMenuItem("receipt-outline", "Documents fiscaux")}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderMenuItem("help-circle-outline", "Centre d'aide")}
          {renderMenuItem("document-text-outline", "Conditions d'utilisation")}
          {renderMenuItem(
            "shield-checkmark-outline",
            "Politique de confidentialité"
          )}
        </View>

        {/* Déconnexion */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
  previewButton: {
    padding: theme.spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
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
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
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
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  referralContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  referralTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
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
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: theme.spacing.xs,
  },
  referralButtonIcon: {
    marginLeft: theme.spacing.xs,
  },
  referralIconContainer: {
    backgroundColor: `${theme.colors.primary}20`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  logoutSection: {
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
