import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// Use test IDs in development, real IDs in production
const BANNER_ID = __DEV__ 
  ? TestIds.BANNER
  : Platform.select({
      ios: TestIds.BANNER, // Keep test ID for iOS until approved
      android: "ca-app-pub-3092951387754338/6696757903",
    }) || TestIds.BANNER;

interface AdBannerProps {
  size?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ size = "BANNER" }) => {
  const [adError, setAdError] = useState(false);
  const [shouldShowAd, setShouldShowAd] = useState(true);

  const onAdFailedToLoad = (error: any) => {
    console.warn("Ad failed to load:", error);
    setAdError(true);
    // Don't show ad component if it fails to load
    setShouldShowAd(false);
  };

  const onAdLoaded = () => {
    console.log("Ad loaded successfully");
    setAdError(false);
  };

  // Don't render anything if ad failed or shouldn't show
  if (!shouldShowAd || adError) {
    return null;
  }

  try {
    return (
      <View style={styles.container}>
        <BannerAd
          unitId={BANNER_ID}
          size={size as BannerAdSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={onAdFailedToLoad}
          onAdLoaded={onAdLoaded}
        />
      </View>
    );
  } catch (error) {
    console.warn("Error rendering BannerAd:", error);
    return null;
  }
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
