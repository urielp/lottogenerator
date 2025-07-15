// src/components/SavedNumbers.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NumberCard from "./NumberCard";

interface LottoNumbers {
  numbers: number[];
  strongNumber: number;
  date: string;
  isPredicted?: boolean;
}

interface SavedNumbersProps {
  savedDraws: LottoNumbers[];
  onDelete?: (index: number) => void;
}

const SavedNumbers: React.FC<SavedNumbersProps> = ({ savedDraws, onDelete }) => {
  const handleDelete = (index: number) => {
    Alert.alert(
      "מחיקת מספרים",
      "האם אתה בטוח שברצונך למחוק את המספרים השמורים?",
      [
        {
          text: "ביטול",
          style: "cancel",
        },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => onDelete?.(index),
        },
      ]
    );
  };

  if (!savedDraws.length) {
    return (
      <View style={styles.savedContainer}>
        <Text style={styles.dateText}>אין מספרים שמורים</Text>
      </View>
    );
  }

  return (
    <View style={styles.savedContainer}>
      <Text style={styles.savedTitle}>מספרים שמורים</Text>
      {savedDraws.map((entry, index) => (
        <View key={entry.date + entry.strongNumber} style={styles.savedEntry}>
          <View style={styles.entryHeader}>
            <Text style={styles.dateText}>
              {entry.isPredicted ? "חיזוי - " : ""}
              {entry.date}
            </Text>
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(index)}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444"  style={{ marginBottom: 2, marginLeft: 10 }}/>
              </TouchableOpacity>
            )}
          </View>
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
  );
};

const styles = StyleSheet.create({
  savedNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
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
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    padding: 5,

  },
  savedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "right",
  },
  savedContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "right",
    flex: 1,
  },
});

export default SavedNumbers;
