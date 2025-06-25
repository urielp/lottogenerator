import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NumberCard from "../components/NumberCard";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import ScreenWithAd from "../components/ScreenWithAd";
import AdBanner from "../components/AdBanner";

interface LottoNumbers {
  numbers: number[];
  strongNumber: number;
  date: string;
  isPredicted?: boolean;
}

const LottoScreen: React.FC = () => {
  const [currentDraw, setCurrentDraw] = useState<LottoNumbers | null>(null);
  const [savedDraws, setSavedDraws] = useState<LottoNumbers[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedDraws();
    }, [])
  );

  const loadSavedDraws = async () => {
    try {
      // Load regular saved draws
      const saved = await AsyncStorage.getItem("lottoDraws");
      const regularSaved = saved ? JSON.parse(saved) : [];

      // Load predicted draws
      const savedPredictions = await AsyncStorage.getItem(
        "savedLottoPredictions"
      );
      const predictedSaved = savedPredictions
        ? JSON.parse(savedPredictions)
        : [];

      // Combine both types of saved draws
      const allSaved = [
        ...regularSaved,
        ...predictedSaved.map((pred: any) => ({
          numbers: pred.numbers,
          strongNumber: pred.strongNumber,
          date: moment(pred.date).isValid()
            ? moment(pred.date).format("DD/MM/YYYY HH:mm")
            : "תאריך לא תקין",
          isPredicted: true,
        })),
      ].sort(
        (a, b) =>
          moment(b.date, "DD/MM/YYYY HH:mm").toDate().getTime() -
          moment(a.date, "DD/MM/YYYY HH:mm").toDate().getTime()
      );

      setSavedDraws(allSaved);
    } catch (error) {
      console.error("Error loading saved draws:", error);
    }
  };

  const generateNumbers = () => {
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 37) + 1);
    }
    const strongNumber = Math.floor(Math.random() * 7) + 1;
    setCurrentDraw({
      numbers: Array.from(numbers).sort((a, b) => a - b),
      strongNumber,
      date: new Date().toLocaleString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });
  };

  const saveDraw = async () => {
    if (!currentDraw) {
      Alert.alert("שגיאה", "אנא בחר מספרים תחילה");
      return;
    }

    try {
      const updatedSaved = [...savedDraws, currentDraw];
      await AsyncStorage.setItem("lottoDraws", JSON.stringify(updatedSaved));
      setSavedDraws(updatedSaved);
      Alert.alert("הצלחה", "המספרים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving draw:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת המספרים");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>משחק לוטו</Text>
        </View>
        <AdBanner />
        <ScrollView style={styles.content}>
          <View style={styles.numbersContainer}>
            {currentDraw && (
              <>
                {currentDraw.numbers.map((num, index) => (
                  <NumberCard
                    key={index}
                    number={num}
                    isStrong={false}
                    index={index}
                  />
                ))}
                <NumberCard
                  number={currentDraw.strongNumber}
                  isStrong
                  index={currentDraw.numbers.length}
                />
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={saveDraw}
              style={styles.button}
              icon={({ size, color }) => (
                <Ionicons name="save" size={24} color="#333" />
              )}
              labelStyle={styles.buttonText}
              textColor="#333"
            >
              שמור מספרים
            </Button>
            <Button
              mode="outlined"
              onPress={generateNumbers}
              style={styles.button}
              icon={({ size, color }) => (
                <Ionicons name="shuffle" size={24} color="#333" />
              )}
              labelStyle={styles.buttonText}
              textColor="#333"
            >
              בחר מספרים
            </Button>
          </View>

          <View style={styles.savedContainer}>
            <Text style={styles.savedTitle}>מספרים שמורים</Text>
            {savedDraws.map((entry, index) => (
              <View key={index} style={styles.savedEntry}>
                <Text style={styles.dateText}>
                  {entry.isPredicted ? "חיזוי - " : ""}
                  {/* moment().format('LLLL') */}
                  {entry.date}
                </Text>
                <View style={styles.savedNumbers}>
                  {entry.numbers.map((num, numIndex) => (
                    <NumberCard
                      key={numIndex}
                      number={num}
                      isStrong={false}
                      index={numIndex}
                      isPredicted={entry.isPredicted}
                    />
                  ))}
                  <NumberCard
                    number={entry.strongNumber}
                    isStrong
                    index={entry.numbers.length}
                    isPredicted={entry.isPredicted}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
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
  header: {
    alignItems: "center",
    marginBottom: 10,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  numbersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    borderColor: "rgba(156, 39, 176, 0.6)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  savedContainer: {
    flex: 1,
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "right",
  },
  savedEntry: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    textAlign: "right",
  },
  savedNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

export default LottoScreen;
