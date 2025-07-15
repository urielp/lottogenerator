import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

interface ProgressBarProps {
  progress: number; // 0-100
  color: string;
  style?: StyleProp<ViewStyle>;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, style }) => {
  return (
    <View
      style={[
        {
          height: 10,
          backgroundColor: "#f0f0f0",
          borderRadius: 5,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: color,
          borderRadius: 5,
        }}
      />
    </View>
  );
};

export default ProgressBar; 