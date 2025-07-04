import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import ScreenWithAd from "../components/ScreenWithAd";
import AdBanner from "../components/AdBanner";
import { URLs } from "../config/urls";
import { useStatisticsData } from "../hooks/useStatisticsData";
import FrequencyList from "../components/statistics/FrequencyList";
import ProgressBar from "../components/statistics/ProgressBar";

interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  face?: string;
}

interface StatisticsData {
  lottoNumbers: {
    regular: NumberFrequency[];
    strong: NumberFrequency[];
  };
  chanceNumbers: {
    regular: NumberFrequency[];
    strong: NumberFrequency[];
  };
}

interface Settings {
  lottoUrl: string;
  chanceUrl: string;
}

const StatisticsScreen: React.FC = () => {
  const [settings] = useState<Settings>({
    lottoUrl: "https://pais.co.il/Lotto/lotto_resultsDownload.aspx",
    chanceUrl: "https://pais.co.il/chance/chance_resultsDownload.aspx",
  });
  const {
    statistics,
    isLoading,
    isRefreshing,
    handleRefresh,
    loadStatistics,
  } = useStatisticsData();
  const progressAnimations = useRef<{ [key: string]: Animated.Value }>(
    {}
  ).current;

  const STATS_KEY = "statistics_data";
  const STATS_DATE_KEY = "statistics_last_updated";
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  // Initialize animations when statistics change
  useEffect(() => {
    const initializeAnimations = () => {
      // Initialize new animations
      const allItems = [
        ...statistics.lottoNumbers.regular,
        ...statistics.lottoNumbers.strong,
        ...statistics.chanceNumbers.regular,
      ];

      allItems.forEach((item) => {
        const isStrong = statistics.lottoNumbers.strong.includes(item);
        const isChance = !!item.face;
        const animationKey = getAnimationKey(item.number, isStrong, isChance);

        if (!progressAnimations[animationKey]) {
          progressAnimations[animationKey] = new Animated.Value(0);
        }
      });
    };

    if (!isLoading) {
      initializeAnimations();
    }
  }, [statistics, isLoading]);

  // Start animations when they're initialized
  useEffect(() => {
    if (!isLoading) {
      const allItems = [
        ...statistics.lottoNumbers.regular,
        ...statistics.lottoNumbers.strong,
        ...statistics.chanceNumbers.regular,
      ];

      allItems.forEach((item) => {
        const isStrong = statistics.lottoNumbers.strong.includes(item);
        const isChance = !!item.face;
        const animationKey = getAnimationKey(item.number, isStrong, isChance);
        const maxCount = isStrong
          ? statistics.lottoNumbers.strong[0]?.count || 1
          : isChance
          ? statistics.chanceNumbers.regular[0]?.count || 1
          : statistics.lottoNumbers.regular[0]?.count || 1;

        const widthPercent = Math.floor((item.count / maxCount) * 100);

        // Create a new animation value if it doesn't exist
        if (!progressAnimations[animationKey]) {
          progressAnimations[animationKey] = new Animated.Value(0);
        }

        // Animate to the new value
        Animated.spring(progressAnimations[animationKey], {
          toValue: widthPercent,
          tension: 20,
          friction: 7,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isLoading, progressAnimations]);

  useFocusEffect(
    React.useCallback(() => {
      loadStatistics();
    }, [loadStatistics])
  );

  const getLottoNumberColor = (number: number, isStrong: boolean) => {
    if (isStrong) return "#FF5722"; // Keep strong numbers orange

    // Color scheme for regular Lotto numbers
    if (number <= 7) return "#E91E63"; // Pink
    if (number <= 14) return "#9C27B0"; // Purple
    if (number <= 21) return "#3F51B5"; // Indigo
    if (number <= 28) return "#2196F3"; // Blue
    if (number <= 37) return "#009688"; // Teal
    return "#2196F3"; // Default blue
  };

  const getColorForPercentage = (
    percentage: number,
    maxPercentage: number,
    isStrong: boolean = false
  ) => {
    // Calculate relative percentage compared to the highest value
    const relativePercentage = (percentage / maxPercentage) * 100;

    if (isStrong) {
      // Special thresholds for strong numbers (13-14% range)
      if (relativePercentage >= 98) return "#4CAF50"; // Green for top 2%
      if (relativePercentage >= 95) return "#8BC34A"; // Light Green for 95-98%
      if (relativePercentage >= 92) return "#FFC107"; // Yellow for 92-95%
      if (relativePercentage >= 90) return "#FF9800"; // Orange for 90-92%
      return "#F44336"; // Red for <90%
    } else {
      // Original thresholds for regular Lotto numbers
      if (relativePercentage >= 90) return "#4CAF50"; // Green for top 10%
      if (relativePercentage >= 70) return "#8BC34A"; // Light Green for 70-90%
      if (relativePercentage >= 50) return "#FFC107"; // Yellow for 50-70%
      if (relativePercentage >= 30) return "#FF9800"; // Orange for 30-50%
      return "#F44336"; // Red for bottom 30%
    }
  };

  const getAnimationKey = (
    number: number,
    isStrong: boolean,
    isChance: boolean
  ) => {
    return `${isChance ? "chance" : "lotto"}-${
      isStrong ? "strong" : "regular"
    }-${number}`;
  };

  const renderProgressBar = (
    count: number,
    maxCount: number,
    isStrong: boolean = false,
    item: NumberFrequency
  ) => {
    const widthPercent = Math.floor((count / maxCount) * 100);
    const animationKey = getAnimationKey(item.number, isStrong, !!item.face);

    if (!progressAnimations[animationKey]) {
      progressAnimations[animationKey] = new Animated.Value(0);
    }

    // Interpolate the animated value to a width percentage
    const animatedWidth = progressAnimations[animationKey].interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
    });

    return (
      <ProgressBar
        progress={widthPercent}
        color={getColorForPercentage(count, maxCount, isStrong)}
        style={styles.progressBackground}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Icon
              name="refresh"
              size={24}
              color="#2196F3"
              style={[
                styles.refreshIcon,
                isRefreshing && styles.refreshingIcon,
              ]}
            />
          </TouchableOpacity>
          <Text style={styles.title}>סטטיסטיקות היסטוריות</Text>
        </View>
        <AdBanner />
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>טוען נתונים...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>מספרי לוטו</Text>
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle}>מספרים רגילים</Text>
                  <FrequencyList
                    items={statistics.lottoNumbers.regular}
                    isStrong={false}
                    isChance={false}
                    progressAnimations={progressAnimations}
                    renderProgressBar={renderProgressBar}
                    getLottoNumberColor={getLottoNumberColor}
                  />
                </View>
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle}>מספר חזק</Text>
                  <FrequencyList
                    items={statistics.lottoNumbers.strong}
                    isStrong={true}
                    isChance={false}
                    progressAnimations={progressAnimations}
                    renderProgressBar={renderProgressBar}
                    getLottoNumberColor={getLottoNumberColor}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>מספרי צ'אנס</Text>
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle}>מספרים רגילים</Text>
                  <FrequencyList
                    items={statistics.chanceNumbers.regular}
                    isStrong={false}
                    isChance={true}
                    progressAnimations={progressAnimations}
                    renderProgressBar={renderProgressBar}
                    getLottoNumberColor={getLottoNumberColor}
                  />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 10,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    position: "relative",
    paddingHorizontal: 40,
    minHeight: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 0,
    marginTop: Platform.OS === "ios" ? 10 : 0,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textAlign: "right",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  numberContainer: {
    width: 45,
    alignItems: "center",
  },
  numberAndFaceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 45,
  },
  numberText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  faceText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 2,
  },
  statsContainer: {
    width: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countText: {
    fontSize: 15,
    color: "#666",
    width: 40,
    textAlign: "center",
    fontWeight: "500",
  },
  percentageText: {
    fontSize: 15,
    color: "#666",
    width: 50,
    textAlign: "left",
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 15,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  refreshButton: {
    position: "absolute",
    left: 8,
    padding: 8,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    top: Platform.OS === "ios" ? 8 : 0,
  },
  refreshIcon: {
    opacity: 1,
  },
  refreshingIcon: {
    opacity: 0.5,
  },
  ballContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ballNumberText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default StatisticsScreen;
