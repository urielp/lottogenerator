import React from "react";
import { View, StyleSheet } from "react-native";
import AdBanner from "./AdBanner";

interface ScreenWithAdProps {
  children: React.ReactNode;
  showAd?: boolean;
}

const ScreenWithAd: React.FC<ScreenWithAdProps> = ({
  children,
  showAd = true,
}) => {
  return (
    <View style={styles.container}>
      {showAd && <AdBanner />}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenWithAd;
