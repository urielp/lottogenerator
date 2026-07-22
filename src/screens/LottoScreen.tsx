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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NumberCard from "../components/NumberCard";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWithAd from "../components/ScreenWithAd";
import AdBanner from "../components/AdBanner";
import Constants from "expo-constants";
import SavedNumbers from "../components/SavedNumbers";
import EmptyState from "../components/emptyState";
import ManualLottoModal from "../components/ManualLottoModal";
import {
  SavedLottoItem,
  loadSavedLotto,
  addSavedLotto,
  deleteSavedLotto,
  nowDisplayDate,
} from "../utils/savedStorage";

interface CurrentDraw {
  numbers: number[];
  strongNumber: number;
  date: string;
}

const LottoScreen: React.FC = () => {
  const [currentDraw, setCurrentDraw] = useState<CurrentDraw | null>(null);
  const [savedDraws, setSavedDraws] = useState<SavedLottoItem[]>([]);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      loadSavedLotto()
        .then(setSavedDraws)
        .catch((error) => console.error("Error loading saved draws:", error));
    }, [])
  );

  const generateNumbers = () => {
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 37) + 1);
    }
    const strongNumber = Math.floor(Math.random() * 7) + 1;
    setCurrentDraw({
      numbers: Array.from(numbers).sort((a, b) => a - b),
      strongNumber,
      date: nowDisplayDate(),
    });
  };

  const saveDraw = async () => {
    if (!currentDraw) {
      Alert.alert("שגיאה", "אנא בחר מספרים תחילה");
      return;
    }

    try {
      const updated = await addSavedLotto({
        numbers: currentDraw.numbers,
        strongNumber: currentDraw.strongNumber,
        source: "generated",
      });
      setSavedDraws(updated);
      Alert.alert("הצלחה", "המספרים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving draw:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת המספרים");
    }
  };

  const saveManualDraw = async (numbers: number[], strongNumber: number) => {
    try {
      const updated = await addSavedLotto({
        numbers,
        strongNumber,
        source: "manual",
      });
      setSavedDraws(updated);
      setManualModalVisible(false);
      Alert.alert("הצלחה", "המספרים שלך נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving manual draw:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת המספרים");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const itemToDelete = savedDraws[index];
      if (!itemToDelete) return;
      const updated = await deleteSavedLotto(itemToDelete.id);
      setSavedDraws(updated);
    } catch (error) {
      console.error("Error deleting draw:", error);
      Alert.alert("שגיאה", "שגיאה במחיקת המספרים");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.title}>משחק לוטו</Text>
        </View>
        {Platform.OS !== "web" && Constants.appOwnership !== "expo" && (
          <AdBanner />
        )}
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

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => setManualModalVisible(true)}
              style={styles.button}
              icon={({ size, color }) => (
                <Ionicons name="create-outline" size={24} color="#333" />
              )}
              labelStyle={styles.buttonText}
              textColor="#333"
            >
              הוסף מספרים משלי
            </Button>
          </View>

          {savedDraws.length > 0 ? (
            <SavedNumbers savedDraws={savedDraws} onDelete={handleDelete} />
          ) : (
            <EmptyState />
          )}
        </ScrollView>

        <ManualLottoModal
          visible={manualModalVisible}
          onClose={() => setManualModalVisible(false)}
          onSave={saveManualDraw}
        />
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
});

export default LottoScreen;
