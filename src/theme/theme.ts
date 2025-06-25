import { MD3LightTheme, configureFonts } from "react-native-paper";
import { Platform } from "react-native";

// Default theme (Material Design 3)
export const defaultTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "rgba(156, 39, 176, 0.6)", // Lighter purple with 60% opacity
    secondary: "#03dac6",
    error: "#b00020",
  },
};

// Custom theme (our current theme)
export const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2196F3",
    secondary: "#4CAF50",
    error: "#b00020",
  },
};

// Font configuration
const fontConfig = {
  fontFamily: Platform.select({
    ios: "System",
    android: "Roboto",
  }),
};

// Apply font configuration to both themes
defaultTheme.fonts = configureFonts({ config: fontConfig });
customTheme.fonts = configureFonts({ config: fontConfig });
