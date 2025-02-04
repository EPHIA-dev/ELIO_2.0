import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { CustomNavbar } from "../components/CustomNavbar";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { useSearchOverlay } from "../contexts/SearchOverlayContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { CalendarScreen } from "../screens/main/CalendarScreen";
import { ConversationsScreen } from "../screens/main/ConversationsScreen";
import { HomeScreen } from "../screens/main/HomeScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { SearchScreen } from "../screens/main/SearchScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { AuthStackParamList, MainStackParamList } from "../types/navigation";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  const { isSearching } = useSearchOverlay();

  return (
    <MainTab.Navigator
      tabBar={(props) => <CustomNavbar {...props} isVisible={!isSearching} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Calendar" component={CalendarScreen} />
      <MainTab.Screen name="Search" component={SearchScreen} />
      <MainTab.Screen name="Conversations" component={ConversationsScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  if (authLoading || profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (profile && !profile.isProfileComplete) {
    return <OnboardingScreen onComplete={() => {}} />;
  }

  return <MainNavigator />;
};
