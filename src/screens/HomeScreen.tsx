import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NumberCard from "../components/NumberCard";

interface LottoNumbers {
  regular: number[];
  strong: number;
  date: string;
}

const LottoScreen: React.FC = () => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [strongNumber, setStrongNumber] = useState<number>(0);
  const [savedNumbers, setSavedNumbers] = useState<LottoNumbers[]>([]);

  useEffect(() => {
    loadSavedNumbers();
  }, []);

  const loadSavedNumbers = async () => {
    try {
      const saved = await AsyncStorage.getItem("lottoNumbers");
      if (saved) {
        setSavedNumbers(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved numbers:", error);
    }
  };

  const generateNumbers = () => {
    const regularNumbers: number[] = [];
    while (regularNumbers.length < 6) {
      const num = Math.floor(Math.random() * 37) + 1;
      if (!regularNumbers.includes(num)) {
        regularNumbers.push(num);
      }
    }
    regularNumbers.sort((a, b) => a - b);
    setNumbers(regularNumbers);
    setStrongNumber(Math.floor(Math.random() * 7) + 1);
  };

  const saveNumbers = async () => {
    if (numbers.length === 0) {
      Alert.alert("Error", "Please generate numbers first");
      return;
    }

    const newEntry: LottoNumbers = {
      regular: numbers,
      strong: strongNumber,
      date: new Date().toLocaleDateString(),
    };

    try {
      const updatedSaved = [...savedNumbers, newEntry];
      await AsyncStorage.setItem("lottoNumbers", JSON.stringify(updatedSaved));
      setSavedNumbers(updatedSaved);
      Alert.alert("Success", "Numbers saved successfully!");
    } catch (error) {
      console.error("Error saving numbers:", error);
      Alert.alert("Error", "Failed to save numbers");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lotto Number Generator</Text>
      </View>

      <View style={styles.numbersContainer}>
        {numbers.map((num, index) => (
          <NumberCard key={index} number={num} index={index} />
        ))}
        {strongNumber > 0 && (
          <NumberCard
            number={strongNumber}
            isStrong={true}
            index={numbers.length}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={generateNumbers}>
          <Text style={styles.buttonText}>Generate Numbers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveNumbers}>
          <Text style={styles.buttonText}>Save Numbers</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.savedContainer}>
        <Text style={styles.savedTitle}>Saved Numbers</Text>
        {savedNumbers.map((entry, index) => (
          <View key={index} style={styles.savedEntry}>
            <Text style={styles.dateText}>{entry.date}</Text>
            <View style={styles.savedNumbers}>
              {entry.regular.map((num, numIndex) => (
                <NumberCard key={numIndex} number={num} index={numIndex} />
              ))}
              <NumberCard
                number={entry.strong}
                isStrong={true}
                index={entry.regular.length}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
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
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
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
  },
  savedNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

export default LottoScreen;
