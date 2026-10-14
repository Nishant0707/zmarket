import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext(null);
const STORAGE_KEY = "@product-explorer/theme";

const palettes = {
  light: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    text: "#18181D",
    muted: "#767680",
    primary: "#6952E8",
    soft: "#F0EDFF",
    border: "#E9E9EF",
    image: "#F5F5F8",
    danger: "#B93838",
    dangerBackground: "#FFF0F0",
    glass: "rgba(255,255,255,0.94)",
    glassEnd: "rgba(255,255,255,0.78)",
    hero: ["#F8F7FF", "#F3F2FC", "#F7F8FA"],
  },
  dark: {
    background: "#101114",
    surface: "#1A1B21",
    text: "#F3F3F7",
    muted: "#A0A0AE",
    primary: "#B4A6FF",
    soft: "#2D2745",
    border: "#2C2D36",
    image: "#23242C",
    danger: "#FFAAA8",
    dangerBackground: "#392328",
    glass: "rgba(28,29,36,0.94)",
    glassEnd: "rgba(28,29,36,0.78)",
    hero: ["#191723", "#17171F", "#101114"],
  },
};

export function ThemeProvider({ children }) {
  const systemTheme = useColorScheme();

  const [preference, setPreference] = useState(null);
  const [ready, setReady] = useState(false);

  const changedByUser = useRef(false);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (
          active &&
          !changedByUser.current &&
          (value === "light" || value === "dark")
        ) {
          setPreference(value);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const mode = preference ?? systemTheme ?? "light";
  const isDark = mode === "dark";

  function toggleTheme() {
    const next = isDark ? "light" : "dark";

    changedByUser.current = true;
    setPreference(next);

    saveQueue.current = saveQueue.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, next))
      .catch(() => {});
  }

  return (
    <ThemeContext.Provider
      value={{
        colors: palettes[mode],
        isDark,
        ready,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme requires ThemeProvider");
  }

  return context;
}