import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import LottoScreen from "../screens/LottoScreen";
import ChanceScreen from "../screens/ChanceScreen";
import PredictionsScreen from "../screens/PredictionsScreen";
import StatisticsScreen from "../screens/StatisticsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const LottoStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="LottoMain"
      component={LottoScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ChanceStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ChanceMain"
      component={ChanceScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const PredictionsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="PredictionsMain"
      component={PredictionsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const StatisticsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="StatisticsMain"
      component={StatisticsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Lotto"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Lotto") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "Chance") {
            iconName = focused ? "card" : "card-outline";
          } else if (route.name === "Predictions") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Statistics") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else {
            iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "rgba(156, 39, 176, 0.6)",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen
        name="Statistics"
        component={StatisticsStack}
        options={{
          title: "סטטיסטיקות",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Predictions"
        component={PredictionsStack}
        options={{
          title: "חיזויים",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Chance"
        component={ChanceStack}
        options={{
          title: "צ'אנס",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Lotto"
        component={LottoStack}
        options={{
          title: "לוטו",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
