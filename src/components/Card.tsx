import React from "react";
import { StyleSheet, View, Text } from "react-native";

interface CardProps {
  suit: "♥" | "♦" | "♣" | "♠";
  value: string;
  index: number;
  isPredicted?: boolean;
}

const Card: React.FC<CardProps> = ({ suit, value, index, isPredicted }) => {
  const isRed = suit === "♥" || suit === "♦";

  return (
    <View style={[styles.card, isPredicted && styles.predictedCard]}>
      <View style={styles.cardContent}>
        <Text style={[styles.suit, isRed && styles.redText]}>{suit}</Text>
        <Text style={[styles.value, isRed && styles.redText]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 90,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  predictedCard: {
    borderColor: "#2196F3",
    borderWidth: 3,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  cardContent: {
    alignItems: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  suit: {
    fontSize: 24,
    color: "#333",
  },
  redText: {
    color: "#d32f2f",
  },
});

export default Card;
