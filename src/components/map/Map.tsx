import * as Location from "expo-location";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { theme } from "../../styles/theme";

interface Establishment {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  professionIds: string[];
}

interface Replacement {
  id: string;
  establishmentId: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
}

interface EstablishmentWithReplacements extends Establishment {
  replacements: Replacement[];
}

export const Map = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [establishments, setEstablishments] = useState<
    EstablishmentWithReplacements[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission refusée",
            "L'accès à la localisation est nécessaire pour centrer la carte."
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération de la position:", error);
        Alert.alert(
          "Erreur",
          "Impossible de récupérer votre position actuelle."
        );
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchEstablishmentsAndReplacements = async () => {
      if (!user) return;

      try {
        // Récupérer le professionId de l'utilisateur
        const userDoc = await getDocs(
          query(collection(db, "users"), where("email", "==", user.email))
        );

        if (userDoc.empty) {
          console.error("Utilisateur non trouvé dans Firestore");
          return;
        }

        const professionId = userDoc.docs[0].data().professionId;
        if (!professionId) {
          console.error("ProfessionId non trouvé pour l'utilisateur");
          return;
        }

        // Récupérer les établissements
        const establishmentsQuery = query(
          collection(db, "establishments"),
          where("professionIds", "array-contains", professionId)
        );

        const establishmentsSnapshot = await getDocs(establishmentsQuery);
        const establishmentsData = establishmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          coordinates: {
            latitude: doc.data().coordinates.latitude,
            longitude: doc.data().coordinates.longitude,
          },
          professionIds: doc.data().professionIds,
          replacements: [],
        }));

        // Récupérer les remplacements pour chaque établissement
        const replacementsQuery = query(
          collection(db, "replacements"),
          where("status", "in", ["open", "pending"])
        );

        const replacementsSnapshot = await getDocs(replacementsQuery);
        const replacements = replacementsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Replacement[];

        // Associer les remplacements aux établissements
        const establishmentsWithReplacements = establishmentsData.map(
          (establishment) => ({
            ...establishment,
            replacements: replacements.filter(
              (replacement) => replacement.establishmentId === establishment.id
            ),
          })
        );

        setEstablishments(establishmentsWithReplacements);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentsAndReplacements();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 43.2965,
            longitude: 5.3698,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
          showsMyLocationButton
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {establishments.map((establishment) => (
          <Marker
            key={establishment.id}
            coordinate={establishment.coordinates}
            title={establishment.name}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{establishment.name}</Text>
                {establishment.replacements.length > 0 ? (
                  establishment.replacements.map((replacement) => (
                    <View key={replacement.id} style={styles.replacementItem}>
                      <Text style={styles.replacementDates}>
                        {formatDate(replacement.startDate)} -{" "}
                        {formatDate(replacement.endDate)}
                      </Text>
                      <Text
                        style={styles.replacementDescription}
                        numberOfLines={2}
                      >
                        {replacement.description}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noReplacements}>
                    Aucun remplacement disponible
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  calloutContainer: {
    minWidth: 200,
    maxWidth: 300,
    padding: theme.spacing.sm,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  replacementItem: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  replacementDates: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  replacementDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  noReplacements: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: "italic",
  },
});
