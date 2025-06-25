import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Card from "../components/Card";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWithAd from "../components/ScreenWithAd";
import AdBanner from "../components/AdBanner";
import moment from "moment";

interface ChanceDraw {
  hearts: string;
  diamonds: string;
  clubs: string;
  spades: string;
  date: string;
  isPredicted?: boolean;
}

const CARD_VALUES = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♥", "♦", "♣", "♠"] as const;

const ChanceScreen: React.FC = () => {
  const [currentDraw, setCurrentDraw] = useState<ChanceDraw | null>(null);
  const [savedDraws, setSavedDraws] = useState<ChanceDraw[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedDraws();
    }, [])
  );

  const loadSavedDraws = async () => {
    try {
      // Load regular saved draws
      const saved = await AsyncStorage.getItem("chanceDraws");
      const regularSaved = saved ? JSON.parse(saved) : [];

      // Load predicted draws
      const savedPredictions = await AsyncStorage.getItem(
        "savedChancePredictions"
      );
      const predictedSaved = savedPredictions
        ? JSON.parse(savedPredictions)
        : [];

      // Combine both types of saved draws
      const allSaved = [
        ...regularSaved,
        ...predictedSaved.map((pred: any) => ({
          hearts: pred.hearts.toString(),
          diamonds: pred.diamonds.toString(),
          clubs: pred.clubs.toString(),
          spades: pred.spades.toString(),
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

  const drawCard = () => {
    const newDraw: ChanceDraw = {
      hearts: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      diamonds: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      clubs: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      spades: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      date: new Date().toLocaleString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
    setCurrentDraw(newDraw);
  };

  const saveDraw = async () => {
    if (!currentDraw) {
      Alert.alert("שגיאה", "אנא בחר קלפים תחילה");
      return;
    }

    try {
      const updatedSaved = [...savedDraws, currentDraw];
      await AsyncStorage.setItem("chanceDraws", JSON.stringify(updatedSaved));
      setSavedDraws(updatedSaved);
      Alert.alert("הצלחה", "הקלפים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving draw:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת הקלפים");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>משחק צ'אנס</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.cardsContainer}>
            {currentDraw && (
              <>
                <Card suit="♥" value={currentDraw.hearts} index={0} />
                <Card suit="♦" value={currentDraw.diamonds} index={1} />
                <Card suit="♣" value={currentDraw.clubs} index={2} />
                <Card suit="♠" value={currentDraw.spades} index={3} />
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
              שמור קלפים
            </Button>
            <Button
              mode="outlined"
              onPress={drawCard}
              style={styles.button}
              icon={({ size, color }) => (
                <Ionicons name="shuffle" size={24} color="#333" />
              )}
              labelStyle={styles.buttonText}
              textColor="#333"
            >
              בחר קלפים
            </Button>
          </View>

          <ScrollView style={styles.savedContainer}>
            <AdBanner />
            <Text style={styles.savedTitle}>קלפים שמורים</Text>
            {savedDraws.map((entry, index) => (
              <View key={index} style={styles.savedEntry}>
                <Text style={styles.dateText}>
                  {entry.isPredicted ? "חיזוי - " : ""}
                  {entry.date}
                </Text>
                <View style={styles.savedCards}>
                  <Card
                    suit="♥"
                    value={entry.hearts}
                    index={0}
                    isPredicted={entry.isPredicted}
                  />
                  <Card
                    suit="♦"
                    value={entry.diamonds}
                    index={1}
                    isPredicted={entry.isPredicted}
                  />
                  <Card
                    suit="♣"
                    value={entry.clubs}
                    index={2}
                    isPredicted={entry.isPredicted}
                  />
                  <Card
                    suit="♠"
                    value={entry.spades}
                    index={3}
                    isPredicted={entry.isPredicted}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
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
  cardsContainer: {
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
  savedCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

export default ChanceScreen;
