import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// Use test IDs while waiting for AdMob approval
const BANNER_ID =
  Platform.select({
    ios: TestIds.BANNER,
    android: "ca-app-pub-3092951387754338/6696757903",
  }) || TestIds.BANNER;

interface AdBannerProps {
  size?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ size = "BANNER" }) => {
  const onAdFailedToLoad = (error: any) => {
    console.error("Ad failed to load:", error);
  };

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_ID}
        size={size as BannerAdSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={onAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 5,
  },
});

export default AdBanner;
