import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { MapOverlay } from "../../components/map-overlay/MapOverlay";
import { Map } from "../../components/map/Map";
import { theme } from "../../styles/theme";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const SearchScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<Region>({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission refusée",
            "L'accès à la localisation est nécessaire pour cette fonctionnalité"
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error("Erreur de localisation:", error);
        Alert.alert(
          "Erreur",
          "Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de localisation."
        );
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Map location={location} region={region} />
      <MapOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
});
