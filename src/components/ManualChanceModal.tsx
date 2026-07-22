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

export interface ManualChancePick {
  hearts: string;
  diamonds: string;
  clubs: string;
  spades: string;
}

interface ManualChanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (pick: ManualChancePick) => void;
}

const CARD_VALUES = ["7", "8", "9", "10", "J", "Q", "K", "A"];

type SuitKey = keyof ManualChancePick;

const SUITS: { key: SuitKey; symbol: string; isRed: boolean }[] = [
  { key: "hearts", symbol: "♥", isRed: true },
  { key: "diamonds", symbol: "♦", isRed: true },
  { key: "clubs", symbol: "♣", isRed: false },
  { key: "spades", symbol: "♠", isRed: false },
];

const ManualChanceModal: React.FC<ManualChanceModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [picks, setPicks] = useState<Partial<ManualChancePick>>({});

  const setPick = (suit: SuitKey, value: string) => {
    setPicks((prev) => ({
      ...prev,
      [suit]: prev[suit] === value ? undefined : value,
    }));
  };

  const reset = () => setPicks({});

  const handleClose = () => {
    reset();
    onClose();
  };

  const isComplete = SUITS.every(({ key }) => picks[key]);

  const handleSave = () => {
    if (!isComplete) return;
    onSave(picks as ManualChancePick);
    reset();
  };

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
            <RNText style={styles.title}>הקלפים שלי</RNText>
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
            {SUITS.map(({ key, symbol, isRed }) => (
              <View key={key}>
                <RNText style={styles.sectionTitle}>
                  <RNText style={isRed ? styles.redSuit : styles.blackSuit}>
                    {symbol}
                  </RNText>{" "}
                  בחר קלף
                </RNText>
                <View style={styles.valuesRow}>
                  {CARD_VALUES.map((value) => {
                    const isSelected = picks[key] === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[styles.valueCell, isSelected && styles.valueCellSelected]}
                        onPress={() => setPick(key, value)}
                      >
                        <RNText
                          style={[
                            styles.valueText,
                            isRed && styles.redSuit,
                            isSelected && styles.valueTextSelected,
                          ]}
                        >
                          {value}
                        </RNText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleSave}
              disabled={!isComplete}
              style={styles.saveButton}
              icon="content-save"
              labelStyle={styles.buttonText}
              textColor="#333"
            >
              שמור קלפים
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
  redSuit: {
    color: "#d32f2f",
    fontSize: 20,
  },
  blackSuit: {
    color: "#333",
    fontSize: 20,
  },
  valuesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  valueCell: {
    width: 38,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  valueCellSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  valueTextSelected: {
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

export default ManualChanceModal;
