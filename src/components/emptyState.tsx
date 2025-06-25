import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const EmptyState: React.FC = () => (
  <View style={styles.container}>
    <MaterialIcons
      name="info-outline"
      size={48}
      color="#bbb"
      style={styles.icon}
    />
    <Text style={styles.text}>אין מידע שמור</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  icon: {
    marginBottom: 12,
  },
  text: {
    fontSize: 20,
    color: "#888",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default EmptyState;
