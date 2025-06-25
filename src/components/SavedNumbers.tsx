// src/components/SavedNumbers.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NumberCard from "./NumberCard";

interface LottoNumbers {
  numbers: number[];
  strongNumber: number;
  date: string;
  isPredicted?: boolean;
}

interface SavedNumbersProps {
  savedDraws: LottoNumbers[];
}

const SavedNumbers: React.FC<SavedNumbersProps> = ({ savedDraws }) => {
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
        <View key={index} style={styles.savedEntry}>
          <Text style={styles.dateText}>
            {entry.isPredicted ? "חיזוי - " : ""}
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
    marginBottom: 10,
    textAlign: "right",
  },
});

export default SavedNumbers;
