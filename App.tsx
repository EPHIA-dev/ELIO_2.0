import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { SearchOverlayProvider } from "./src/contexts/SearchOverlayContext";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AuthProvider>
            <SearchOverlayProvider>
              <NavigationContainer>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </SearchOverlayProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
