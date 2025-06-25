import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { generatePrediction } from "../utils/lottoPredictor";
import { generateChancePrediction } from "../utils/chancePredictor";
import { parseLottoCSV } from "../utils/lottoParser";
import { parseChanceCSV } from "../utils/chanceParser";
import PredictionModal from "../components/PredictionModal";
import ChancePredictionModal from "../components/ChancePredictionModal";
import axios from "axios";
import AdBanner from "../components/AdBanner";
import { URLs } from "../config/urls";

interface Settings {
  lottoUrl: string;
  chanceUrl: string;
}

const PredictionsScreen: React.FC = () => {
  const [settings] = useState<Settings>({
    lottoUrl: "https://pais.co.il/Lotto/lotto_resultsDownload.aspx",
    chanceUrl: "https://pais.co.il/chance/chance_resultsDownload.aspx",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLottoPrediction, setShowLottoPrediction] = useState(false);
  const [showChancePrediction, setShowChancePrediction] = useState(false);
  const [lottoPrediction, setLottoPrediction] = useState<{
    numbers: number[];
    strongNumber: number;
    confidence: number;
  } | null>(null);
  const [chancePrediction, setChancePrediction] = useState<{
    clubs: number;
    diamonds: number;
    hearts: number;
    spades: number;
    confidence: number;
  } | null>(null);

  const generateGamePrediction = async (gameType: "lotto" | "chance") => {
    setIsLoading(true);
    try {
      const url =
        gameType === "lotto"
          ? URLs.lotto.resultsDownload
          : URLs.chance.resultsDownload;

      const response = await axios.get(url, {
        headers: {
          Accept: "text/csv,application/csv,application/octet-stream,*/*",
          "Accept-Language": "he-IL",
          Referer: "https://pais.co.il/",
          "User-Agent": "Mozilla/5.0",
        },
        responseType: "text",
      });

      if (response.status !== 200) {
        throw new Error(
          `שגיאה בטעינת נתוני ${gameType === "lotto" ? "לוטו" : "צ'אנס"}: ${
            response.status
          }`
        );
      }

      const data = response.data;
      if (!data || typeof data !== "string" || data.trim().length === 0) {
        throw new Error(
          `לא התקבלו נתונים תקינים מכתובת ה-URL של ${
            gameType === "lotto" ? "לוטו" : "צ'אנס"
          }`
        );
      }

      setIsAnalyzing(true);

      try {
        if (gameType === "lotto") {
          const parsedData = parseLottoCSV(data);
          const prediction = generatePrediction(parsedData.draws);
          setLottoPrediction(prediction);
          setShowLottoPrediction(true);
        } else {
          const parsedData = parseChanceCSV(data);
          const prediction = generateChancePrediction(parsedData.draws);
          setChancePrediction(prediction);
          setShowChancePrediction(true);
        }
      } catch (error: any) {
        console.error(
          `שגיאה בניתוח נתוני ${gameType === "lotto" ? "לוטו" : "צ'אנס"}:`,
          error
        );
        throw new Error(
          `שגיאה בניתוח נתוני ${gameType === "lotto" ? "לוטו" : "צ'אנס"}: ${
            error.message
          }`
        );
      }
    } catch (error: any) {
      console.error(
        `שגיאה ביצירת חיזוי ${gameType === "lotto" ? "לוטו" : "צ'אנס"}:`,
        error
      );
      Alert.alert(
        "שגיאה",
        `שגיאה ביצירת חיזוי ${gameType === "lotto" ? "לוטו" : "צ'אנס"}: ${
          error.message
        }`
      );
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleSaveLottoPrediction = async () => {
    if (!lottoPrediction) return;

    try {
      const savedPredictions = await AsyncStorage.getItem(
        "savedLottoPredictions"
      );
      const predictions = savedPredictions ? JSON.parse(savedPredictions) : [];

      predictions.push({
        ...lottoPrediction,
        date: new Date().toISOString(),
        isPredicted: true,
      });

      await AsyncStorage.setItem(
        "savedLottoPredictions",
        JSON.stringify(predictions)
      );
      Alert.alert("הצלחה", "חיזוי לוטו נשמר בהצלחה!");
      setShowLottoPrediction(false);
    } catch (error) {
      console.error("שגיאה בשמירת חיזוי לוטו:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת חיזוי לוטו");
    }
  };

  const handleSaveChancePrediction = async () => {
    if (!chancePrediction) return;

    try {
      const savedPredictions = await AsyncStorage.getItem(
        "savedChancePredictions"
      );
      const predictions = savedPredictions ? JSON.parse(savedPredictions) : [];

      predictions.push({
        ...chancePrediction,
        date: new Date().toISOString(),
        isPredicted: true,
      });

      await AsyncStorage.setItem(
        "savedChancePredictions",
        JSON.stringify(predictions)
      );
      Alert.alert("הצלחה", "חיזוי צ'אנס נשמר בהצלחה!");
      setShowChancePrediction(false);
    } catch (error) {
      console.error("שגיאה בשמירת חיזוי צ'אנס:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת חיזוי צ'אנס");
    }
  };

  if (isLoading || isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(156, 39, 176, 0.6)" />
        <Text style={styles.loadingText}>
          {isAnalyzing ? "מנתח נתונים..." : "טוען נתונים..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>צור חיזויים</Text>
        </View>
        {/* <AdBanner /> */}
        <View style={styles.gameContainer}>
          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => generateGamePrediction("lotto")}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.gameButtonText}>חזה מספרי לוטו</Text>
              <Ionicons name="trophy" size={32} color="#4CAF50" />
            </View>
          </TouchableOpacity>
          <AdBanner />
          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => generateGamePrediction("chance")}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.gameButtonText}>חזה קלפי צ'אנס</Text>
              <Ionicons name="card" size={32} color="#2196F3" />
            </View>
          </TouchableOpacity>
        </View>

        {lottoPrediction && (
          <PredictionModal
            visible={showLottoPrediction}
            onClose={() => setShowLottoPrediction(false)}
            onSave={handleSaveLottoPrediction}
            prediction={lottoPrediction}
          />
        )}

        {chancePrediction && (
          <ChancePredictionModal
            visible={showChancePrediction}
            onClose={() => setShowChancePrediction(false)}
            onSave={handleSaveChancePrediction}
            prediction={chancePrediction}
          />
        )}
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
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#666",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    paddingTop: Platform.OS === "ios" ? 10 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  gameContainer: {
    gap: 20,
  },
  gameButton: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  gameButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});

export default PredictionsScreen;
