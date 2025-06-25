import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";

interface Settings {
  lottoUrl: string;
  chanceUrl: string;
}

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    lottoUrl: "",
    chanceUrl: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("gameSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("gameSettings", JSON.stringify(settings));
      Alert.alert("הצלחה", "ההגדרות נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("שגיאה", "שגיאה בשמירת ההגדרות");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>הגדרות</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>מקורות נתונים</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>כתובת URL של לוטו</Text>
          <TextInput
            style={styles.input}
            value={settings.lottoUrl}
            onChangeText={(text) =>
              setSettings({ ...settings, lottoUrl: text })
            }
            placeholder="הזן כתובת URL של נתוני לוטו"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>כתובת URL של צ'אנס</Text>
          <TextInput
            style={styles.input}
            value={settings.chanceUrl}
            onChangeText={(text) =>
              setSettings({ ...settings, chanceUrl: text })
            }
            placeholder="הזן כתובת URL של נתוני צ'אנס"
            placeholderTextColor="#999"
          />
        </View>

        <Button
          mode="outlined"
          onPress={saveSettings}
          style={styles.saveButton}
          icon="content-save"
          labelStyle={styles.buttonText}
          textColor="#333"
        >
          שמור הגדרות
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "right",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "right",
  },
  saveButton: {
    flex: 1,
    borderColor: "rgba(156, 39, 176, 0.6)",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
