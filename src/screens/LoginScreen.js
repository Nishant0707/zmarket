import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../theme";
import { request } from "../api";
import {
  AppButton,
  ErrorBanner,
  Glass,
  ThemeToggle,
} from "../components/UI";

export default function LoginScreen({ onLogin }) {
  const { colors } = useAppTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const activeRequest = useRef(null);
  const passwordInput = useRef(null);

  useEffect(() => {
    return () => {
      const controller = activeRequest.current;
      activeRequest.current = null;
      controller?.abort();
    };
  }, []);

  async function signIn() {
    if (activeRequest.current) return;

    if (!username.trim() || !password) {
      setError("Enter your demo username and password.");
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setBusy(true);
    setError(null);

    try {
      const result = await request(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            password,
            expiresInMins: 60,
          }),
        },
        controller.signal
      );

      if (activeRequest.current !== controller) return;

      if (!result.accessToken || !result.id) {
        throw new Error("Unexpected login response. Please try again.");
      }

      setPassword("");

      // This demo keeps its signed-in state only in memory.
      // Passwords and tokens are not persisted.
      onLogin({
        id: result.id,
        firstName: result.firstName,
        username: result.username,
      });
    } catch (err) {
      if (
        activeRequest.current === controller &&
        err.name !== "AbortError"
      ) {
        setError(err.message || "Unable to sign in.");
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <LinearGradient colors={colors.hero} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}
          >
            <View style={styles.wrapper}>
              <View style={styles.top}>
                <Text style={[styles.smallBrand, { color: colors.text }]}>
                  Z MARKET
                </Text>
                <ThemeToggle />
              </View>

              <View style={styles.brand}>
                <View style={styles.logoBox}>
                  <Image
                    source={require("../../assets/Z.png")}
                    resizeMode="contain"
                    style={styles.logo}
                    accessibilityLabel="Z Market logo"
                  />
                </View>

                <Text style={[styles.heading, { color: colors.text }]}>
                  Little finds.{"\n"}Big everyday joy.
                </Text>

                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  Your next favorite is waiting.
                </Text>
              </View>

              <Glass>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Welcome to Z Market
                </Text>

                <Text style={[styles.formSubtitle, { color: colors.muted }]}>
                  Sign in with a DummyJSON demo account.
                </Text>

                <Text style={[styles.label, { color: colors.text }]}>
                  Username
                </Text>

                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  editable={!busy}
                  placeholder="Enter demo username"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                  accessibilityLabel="Demo username"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                />

                <Text style={[styles.label, { color: colors.text }]}>
                  Password
                </Text>

                <View
                  style={[
                    styles.passwordRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    ref={passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    editable={!busy}
                    placeholder="Enter demo password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    returnKeyType="go"
                    onSubmitEditing={signIn}
                    accessibilityLabel="Demo password"
                    style={[styles.passwordInput, { color: colors.text }]}
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onPress={() => setShowPassword((value) => !value)}
                    style={styles.eye}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color={colors.muted}
                    />
                  </Pressable>
                </View>

                {error && <ErrorBanner message={error} />}

                <View style={{ marginTop: 20 }}>
                  <AppButton
                    title="Sign in"
                    onPress={signIn}
                    loading={busy}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => {
                    setUsername("emilys");
                    setPassword("emilyspass");
                    setError(null);
                  }}
                  style={styles.demoButton}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={{ color: colors.primary, fontWeight: "700" }}
                  >
                    Fill demo credentials
                  </Text>
                </Pressable>
              </Glass>

              <Text style={[styles.disclaimer, { color: colors.muted }]}>
                Demo shopping app · Use sample credentials only.{"\n"}
                No purchases or payments are processed.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  wrapper: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smallBrand: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
  },
  brand: {
    paddingTop: 26,
    paddingBottom: 28,
    gap: 14,
  },
  logoBox: {
    width: 88,
    height: 88,
    padding: 12,
    borderRadius: 26,
    backgroundColor: "#F8D849",
  },
  logo: { width: "100%", height: "100%" },
  heading: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  subtitle: { fontSize: 16, lineHeight: 24 },
  formTitle: { fontSize: 22, fontWeight: "800" },
  formSubtitle: { marginTop: 8, lineHeight: 21 },
  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    paddingLeft: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eye: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  demoButton: {
    minHeight: 48,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disclaimer: {
    marginTop: 22,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
  },
});