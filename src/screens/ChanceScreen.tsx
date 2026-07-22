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
import Card from "../components/Card";
import SavedChance from "../components/savedChance";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AdBanner from "../components/AdBanner";
import EmptyState from "../components/emptyState";
import { generateChanceDraw } from "../utils/generators";
import ManualChanceModal, {
  ManualChancePick,
} from "../components/ManualChanceModal";
import {
  SavedChanceItem,
  loadSavedChance,
  addSavedChance,
  deleteSavedChance,
} from "../utils/savedStorage";

interface CurrentChanceDraw {
  hearts: string;
  diamonds: string;
  clubs: string;
  spades: string;
  date: string;
}

const ChanceScreen: React.FC = () => {
  const [currentDraw, setCurrentDraw] = useState<CurrentChanceDraw | null>(
    null
  );
  const [savedDraws, setSavedDraws] = useState<SavedChanceItem[]>([]);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      loadSavedChance()
        .then(setSavedDraws)
        .catch((error) => console.error("Error loading saved draws:", error));
    }, [])
  );

  const drawCard = () => {
    setCurrentDraw(generateChanceDraw());
  };

  const saveDraw = async () => {
    if (!currentDraw) {
      Alert.alert("שגיאה", "אנא בחר קלפים תחילה");
      return;
    }

    try {
      const updated = await addSavedChance({
        hearts: currentDraw.hearts,
        diamonds: currentDraw.diamonds,
        clubs: currentDraw.clubs,
        spades: currentDraw.spades,
        source: "generated",
      });
      setSavedDraws(updated);
      Alert.alert("הצלחה", "הקלפים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving draw:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת הקלפים");
    }
  };

  const saveManualDraw = async (pick: ManualChancePick) => {
    try {
      const updated = await addSavedChance({
        ...pick,
        source: "manual",
      });
      setSavedDraws(updated);
      setManualModalVisible(false);
      Alert.alert("הצלחה", "הקלפים שלך נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving manual draw:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת הקלפים");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const itemToDelete = savedDraws[index];
      if (!itemToDelete) return;
      const updated = await deleteSavedChance(itemToDelete.id);
      setSavedDraws(updated);
      Alert.alert("הצלחה", "הקלפים נמחקו בהצלחה!");
    } catch (error) {
      console.error("Error deleting draw:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
              הוסף קלפים משלי
            </Button>
          </View>

          <ScrollView style={styles.savedContainer}>
            <AdBanner />
            {savedDraws.length > 0 ? (
              <SavedChance savedChances={savedDraws} onDelete={handleDelete} />
            ) : (
              <EmptyState />
            )}
          </ScrollView>
        </View>

        <ManualChanceModal
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
});

export default ChanceScreen;
