import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { MapOverlay } from "../../components/map-overlay/MapOverlay";
import { Map } from "../../components/map/Map";
import { theme } from "../../styles/theme";
import { SearchOverlay } from '../../components/search-overlay/SearchOverlay';
import { useSearchOverlay } from '../../contexts/SearchOverlayContext';

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
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const [region, setRegion] = useState<Region>({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const { isSearching, setIsSearching } = useSearchOverlay();

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

  const handleSearchPress = () => {
    console.log('SearchScreen - handleSearchPress called');
    setIsSearching(true);
  };

  const handleSearchClose = () => {
    console.log('SearchScreen - handleSearchClose called');
    setIsSearching(false);
  };

  return (
    <View style={styles.container}>
      <Map location={location} region={region} />
      <View style={styles.overlayContainer}>
        <MapOverlay 
          bottomSheetIndex={bottomSheetIndex}
          setBottomSheetIndex={setBottomSheetIndex}
          onSearchPress={handleSearchPress}
        />
      </View>
      {isSearching && (
        <View style={styles.searchOverlayContainer}>
          <SearchOverlay
            visible={true}
            onClose={handleSearchClose}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
