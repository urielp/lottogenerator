import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
import EmptyState from "./emptyState";

interface ChanceDraw {
  hearts: string;
  diamonds: string;
  clubs: string;
  spades: string;
  date: string;
  isPredicted?: boolean;
}

interface SavedChanceProps {
  savedChances: ChanceDraw[];
}

const SavedChance: React.FC<SavedChanceProps> = ({ savedChances }) => {
  if (!savedChances.length) {
    return <EmptyState />;
  }

  return (
    <View style={styles.savedContainer}>
      <Text style={styles.savedTitle}>קלפים שמורים</Text>
      {savedChances.map((entry, index) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
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

export default SavedChance;
