import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Surface } from "react-native-paper";
import { getCardName } from "../utils/chancePredictor";

interface ChancePredictionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  prediction: {
    clubs: number;
    diamonds: number;
    hearts: number;
    spades: number;
    confidence: number;
  };
}

const ChancePredictionModal: React.FC<ChancePredictionModalProps> = ({
  visible,
  onClose,
  onSave,
  prediction,
}) => {
  const renderCard = (value: number, suit: string) => {
    const isRed = suit === "hearts" || suit === "diamonds";
    return (
      <View style={[styles.cardContainer, isRed && styles.redCard]}>
        <View style={styles.cardContent}>
          <Text style={[styles.cardSuit, isRed && styles.redText]}>
            {suit === "hearts"
              ? "♥"
              : suit === "diamonds"
              ? "♦"
              : suit === "clubs"
              ? "♣"
              : "♠"}
          </Text>
          <Text style={[styles.cardValue, isRed && styles.redText]}>
            {getCardName(value)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>קלפים חזויים</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardsContainer}>
            <View style={styles.cardRow}>
              {renderCard(prediction.hearts, "hearts")}
              {renderCard(prediction.diamonds, "diamonds")}
            </View>
            <View style={styles.cardRow}>
              {renderCard(prediction.clubs, "clubs")}
              {renderCard(prediction.spades, "spades")}
            </View>

            <Surface style={styles.confidenceContainer} elevation={1}>
              <Text style={styles.confidenceText}>
                רמת ביטחון: {prediction.confidence.toFixed(1)}%
              </Text>
            </Surface>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onSave}
              style={styles.saveButton}
              icon="content-save"
              labelStyle={styles.buttonText}
              textColor="#333"
            >
              שמור קלפים
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get("window").width * 0.9,
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  cardsContainer: {
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  cardContainer: {
    width: 80,
    height: 120,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  redCard: {
    borderColor: "#d32f2f",
  },
  cardContent: {
    alignItems: "center",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  redText: {
    color: "#d32f2f",
  },
  cardSuit: {
    fontSize: 32,
    color: "#333",
  },
  confidenceContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  confidenceText: {
    color: "#666",
    textAlign: "right",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  saveButton: {
    width: "100%",
    borderColor: "rgba(156, 39, 176, 0.6)",
    borderWidth: 2,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChancePredictionModal;
