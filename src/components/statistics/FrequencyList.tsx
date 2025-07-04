import React from "react";
import { View, Text } from "react-native";
import { NumberFrequency } from "../../hooks/useStatisticsData";

interface FrequencyListProps {
  items: NumberFrequency[];
  isStrong?: boolean;
  isChance?: boolean;
  progressAnimations: { [key: string]: any };
  renderProgressBar: (
    count: number,
    maxCount: number,
    isStrong: boolean,
    item: NumberFrequency
  ) => React.ReactNode;
  getLottoNumberColor: (number: number, isStrong: boolean) => string;
}

const FrequencyList: React.FC<FrequencyListProps> = ({
  items,
  isStrong = false,
  isChance = false,
  progressAnimations,
  renderProgressBar,
  getLottoNumberColor,
}) => {
  if (!items || items.length === 0) {
    return (
      <View style={{ padding: 15, alignItems: "center" }}>
        <Text style={{ color: "#666", fontSize: 16, textAlign: "center" }}>
          אין נתונים זמינים
        </Text>
      </View>
    );
  }

  const sortedItems = [...items].sort((a, b) => b.count - a.count);
  const maxCount = sortedItems[0]?.count || 1;

  return (
    <>
      {items.map((item, index) => {
        const displayValue = isChance
          ? (() => {
              switch (item.number) {
                case 1:
                  return "A";
                case 11:
                  return "J";
                case 12:
                  return "Q";
                case 13:
                  return "K";
                default:
                  return item.number.toString();
              }
            })()
          : item.number.toString();

        return (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}>
            {/* Number/Card Display */}
            <View style={{ width: 45, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 45 }}>
                {!isChance ? (
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: getLottoNumberColor(item.number, isStrong),
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" }}>{displayValue}</Text>
                  </View>
                ) : (
                  <>
                    <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", color: item.face === "♥" || item.face === "♦" ? "#D32F2F" : "#212121" }}>{displayValue}</Text>
                    {item.face && <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 2, color: item.face === "♥" || item.face === "♦" ? "#D32F2F" : "#212121" }}>{item.face}</Text>}
                  </>
                )}
              </View>
            </View>
            {/* Progress Bar */}
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              {renderProgressBar(item.count, maxCount, isStrong, item)}
            </View>
            {/* Stats */}
            <View style={{ width: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 15, color: "#666", width: 40, textAlign: "center", fontWeight: "500" }}>{item.count}</Text>
              <Text style={{ fontSize: 15, color: "#666", width: 50, textAlign: "left", fontWeight: "500" }}>{item.percentage}%</Text>
            </View>
          </View>
        );
      })}
    </>
  );
};

export default FrequencyList; 