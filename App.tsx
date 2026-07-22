import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";
import { enableScreens } from "react-native-screens";
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import { Platform } from "react-native";

// Enable screens for better performance
enableScreens();

// Initialize mobile ads with error handling
const initializeAds = async () => {
  try {
    const adapterStatuses = await mobileAds().initialize();
    console.log("Google Mobile Ads initialization complete!");
  } catch (error) {
    console.warn("Google Mobile Ads initialization failed:", error);
    // App continues to work without ads
  }
};

// Only initialize ads in production or when proper configuration is available
const shouldInitializeAds = () => {
  // Check if running in development mode
  const isDev = __DEV__;

  // In development, only initialize if we have test ads
  if (isDev) {
    return true; // Test ads should work in development
  }

  // In production, always try to initialize
  return true;
};

if (shouldInitializeAds()) {
  initializeAds();
}

export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </NavigationContainer>
  );
}
