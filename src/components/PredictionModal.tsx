import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Text as RNText,
} from "react-native";
import { Button, Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface PredictionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  prediction: {
    numbers: number[];
    strongNumber: number;
    confidence: number;
  };
}

const PredictionModal: React.FC<PredictionModalProps> = ({
  visible,
  onClose,
  onSave,
  prediction,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.modalContent}>
          <View style={styles.header}>
            <RNText style={styles.title}>מספרים חזויים</RNText>
            <Button mode="text" onPress={onClose} icon="close" textColor="#333">
              סגור
            </Button>
          </View>

          <View style={styles.numbersContainer}>
            <RNText style={styles.sectionTitle}>מספרים ראשיים</RNText>
            <View style={styles.numbersGrid}>
              {prediction.numbers.map((number, index) => (
                <Surface
                  key={index}
                  style={[styles.numberCircle, styles.predictedNumber]}
                  elevation={2}
                >
                  <RNText style={styles.numberText}>{number}</RNText>
                  <RNText style={styles.predictedIndicator}>*</RNText>
                </Surface>
              ))}
            </View>

            <RNText style={styles.sectionTitle}>מספר חזק</RNText>
            <View style={styles.strongNumberContainer}>
              <Surface
                style={[styles.strongNumberCircle, styles.predictedNumber]}
                elevation={2}
              >
                <RNText style={styles.strongNumberText}>
                  {prediction.strongNumber}
                </RNText>
                <RNText style={styles.predictedIndicator}>*</RNText>
              </Surface>
            </View>

            <Surface style={styles.confidenceContainer} elevation={1}>
              <RNText style={styles.confidenceText}>
                רמת ביטחון: {prediction.confidence.toFixed(1)}%
              </RNText>
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
              שמור מספרים
            </Button>
          </View>
        </Surface>
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
    color: "#333",
    textAlign: "center",
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
  },
  numbersContainer: {
    alignItems: "center",
  },
  sectionTitle: {
    color: "#666",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "500",
  },
  numbersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  numberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  strongNumberContainer: {
    marginTop: 10,
  },
  strongNumberCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
  },
  strongNumberText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
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
  predictedNumber: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  predictedIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PredictionModal;
