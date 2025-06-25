import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";
import { enableScreens } from "react-native-screens";
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

// Enable screens for better performance
enableScreens();

// Initialize mobile ads
mobileAds()
  .initialize()
  .then((adapterStatuses) => {
    console.log("Initialization complete!");
  });

export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </NavigationContainer>
  );
}
