import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Text as RNText,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, Surface } from "react-native-paper";

interface ManualLottoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (numbers: number[], strongNumber: number) => void;
}

const MAIN_NUMBERS = Array.from({ length: 37 }, (_, i) => i + 1);
const STRONG_NUMBERS = Array.from({ length: 7 }, (_, i) => i + 1);
const MAX_MAIN = 6;

const ManualLottoModal: React.FC<ManualLottoModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [strong, setStrong] = useState<number | null>(null);

  const toggleNumber = (num: number) => {
    setSelected((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length >= MAX_MAIN) return prev;
      return [...prev, num];
    });
  };

  const reset = () => {
    setSelected([]);
    setStrong(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (selected.length !== MAX_MAIN || strong === null) return;
    onSave([...selected].sort((a, b) => a - b), strong);
    reset();
  };

  const isValidPick = selected.length === MAX_MAIN && strong !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.modalContent}>
          <View style={styles.header}>
            <RNText style={styles.title}>המספרים שלי</RNText>
            <Button
              mode="text"
              onPress={handleClose}
              icon="close"
              textColor="#333"
            >
              סגור
            </Button>
          </View>

          <ScrollView>
            <RNText style={styles.sectionTitle}>
              בחר 6 מספרים ({selected.length}/{MAX_MAIN})
            </RNText>
            <View style={styles.numbersGrid}>
              {MAIN_NUMBERS.map((num) => {
                const isSelected = selected.includes(num);
                return (
                  <TouchableOpacity
                    key={num}
                    style={[styles.numberCell, isSelected && styles.numberCellSelected]}
                    onPress={() => toggleNumber(num)}
                  >
                    <RNText
                      style={[styles.numberCellText, isSelected && styles.numberCellTextSelected]}
                    >
                      {num}
                    </RNText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <RNText style={styles.sectionTitle}>בחר מספר חזק</RNText>
            <View style={styles.numbersGrid}>
              {STRONG_NUMBERS.map((num) => {
                const isSelected = strong === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[styles.numberCell, isSelected && styles.strongCellSelected]}
                    onPress={() => setStrong(isSelected ? null : num)}
                  >
                    <RNText
                      style={[styles.numberCellText, isSelected && styles.numberCellTextSelected]}
                    >
                      {num}
                    </RNText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleSave}
              disabled={!isValidPick}
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
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#333",
    textAlign: "center",
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
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
    gap: 8,
  },
  numberCell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  numberCellSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  strongCellSelected: {
    backgroundColor: "#FF5722",
    borderColor: "#FF5722",
  },
  numberCellText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  numberCellTextSelected: {
    color: "white",
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

export default ManualLottoModal;
