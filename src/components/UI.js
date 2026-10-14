import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { useAppTheme } from "../theme";

export function IconButton({ name, label, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Ionicons name={name} size={20} color={colors.text} />
    </Pressable>
  );
}

export function ThemeToggle() {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <IconButton
      name={isDark ? "sunny-outline" : "moon-outline"}
      label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onPress={toggleTheme}
    />
  );
}

export function Glass({ children, style }) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.glass,
        { borderColor: colors.border },
        style,
      ]}
    >
      {Platform.OS === "ios" && (
        <BlurView
          pointerEvents="none"
          tint={isDark ? "dark" : "light"}
          intensity={30}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        pointerEvents="none"
        colors={[colors.glass, colors.glassEnd]}
        style={StyleSheet.absoluteFill}
      />

      {children}
    </View>
  );
}

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}) {
  const blocked = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { opacity: blocked ? 0.55 : pressed ? 0.8 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function ScreenState({
  loading = false,
  title,
  message,
  onRetry,
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.state}>
      <View
        style={[styles.stateIcon, { backgroundColor: colors.soft }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : (
          <Ionicons
            name="bag-handle-outline"
            size={30}
            color={colors.primary}
          />
        )}
      </View>

      <Text style={[styles.stateTitle, { color: colors.text }]}>
        {title}
      </Text>

      {!!message && (
        <Text style={[styles.message, { color: colors.muted }]}>
          {message}
        </Text>
      )}

      {onRetry && <AppButton title="Try again" onPress={onRetry} />}
    </View>
  );
}

export function ErrorBanner({ message, onRetry }) {
  const { colors } = useAppTheme();

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.banner,
        { backgroundColor: colors.dangerBackground },
      ]}
    >
      <Text style={{ color: colors.danger, lineHeight: 22 }}>
        {message}
      </Text>

      {onRetry && <AppButton title="Retry" onPress={onRetry} />}
    </View>
  );
}

export function ProductImage({ uri, label, style }) {
  const { colors } = useAppTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <View
      style={[
        styles.image,
        { backgroundColor: colors.image },
        style,
      ]}
    >
      {uri && !failed ? (
        <Image
          source={{ uri }}
          resizeMode="contain"
          accessibilityLabel={label}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Ionicons
          name="image-outline"
          size={30}
          color={colors.muted}
          accessibilityLabel="Image unavailable"
        />
      )}
    </View>
  );
}

export function priceLabel(value) {
  return typeof value === "number" ? `$${value.toFixed(2)}` : "—";
}

const styles = StyleSheet.create({
  glass: {
    padding: 22,
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    minHeight: 52,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: "#6952E8",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  state: {
    flexGrow: 1,
    minHeight: 270,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 330,
    textAlign: "center",
  },
  banner: {
    padding: 16,
    borderRadius: 18,
    gap: 12,
    marginVertical: 12,
  },
  image: {
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});