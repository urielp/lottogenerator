import React from "react";
import { StyleSheet, Text } from "react-native";
import { Surface } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface NumberCardProps {
  number: number;
  isStrong?: boolean;
  index: number;
  isPredicted?: boolean;
}

const NumberCard: React.FC<NumberCardProps> = ({
  number,
  isStrong = false,
  index,
  isPredicted = false,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSequence(
      withDelay(index * 200, withSpring(1, { damping: 8, stiffness: 100 }))
    );
    opacity.value = withDelay(index * 200, withTiming(1, { duration: 500 }));
  }, [number]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Surface
        style={[
          styles.card,
          isStrong && styles.strongCard,
          isPredicted && styles.predictedCard,
        ]}
        elevation={4}
      >
        <Text style={[styles.number, isStrong && styles.strongNumber]}>
          {number}
        </Text>
        {isPredicted && <Text style={styles.predictedIndicator}>*</Text>}
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  card: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  strongCard: {
    backgroundColor: "#FF5722",
  },
  predictedCard: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  number: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  strongNumber: {
    fontSize: 28,
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

export default NumberCard;
