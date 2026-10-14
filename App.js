import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ThemeProvider, useAppTheme } from "./src/theme";
import { ThemeToggle } from "./src/components/UI";
import LoginScreen from "./src/screens/LoginScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import DetailScreen from "./src/screens/DetailScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

function BrandSplash() {
  const { colors } = useAppTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [progress]);

  return (
    <LinearGradient colors={colors.hero} style={styles.splash}>
      <Animated.View
        style={{
          alignItems: "center",
          opacity: progress,
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        }}
      >
        <View style={styles.logoTile}>
          <Image
            source={require("./assets/Z.png")}
            resizeMode="contain"
            accessibilityLabel="Z Market logo"
            style={{ width: 105, height: 105 }}
          />
        </View>

        <Text style={[styles.splashTitle, { color: colors.text }]}>
          Z Market
        </Text>

        <Text style={[styles.tagline, { color: colors.muted }]}>
          Everyday finds. One happy place.
        </Text>
      </Animated.View>

      <ActivityIndicator
        color={colors.primary}
        style={{ marginTop: 40 }}
      />
    </LinearGradient>
  );
}

function Root() {
  const { colors, isDark, ready } = useAppTheme();

  const [introDone, setIntroDone] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!ready) return;

    SplashScreen.hideAsync().catch(() => {});

    const timer = setTimeout(() => setIntroDone(true), 1100);
    return () => clearTimeout(timer);
  }, [ready]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      {!ready || !introDone ? (
        <BrandSplash />
      ) : !user ? (
        <LoginScreen onLogin={setUser} />
      ) : (
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: "800" },
              headerRight: () => <ThemeToggle />,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen
              name="Products"
              options={{ headerShown: false }}
            >
              {(props) => (
                <ProductsScreen
                  {...props}
                  user={user}
                  onLogout={() => setUser(null)}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Details"
              component={DetailScreen}
              options={{ title: "A closer look" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoTile: {
    width: 144,
    height: 144,
    borderRadius: 42,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  splashTitle: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginTop: 24,
  },
  tagline: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});