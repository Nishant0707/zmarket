import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme";
import { useApi } from "../useApi";
import {
  ErrorBanner,
  priceLabel,
  ProductImage,
  ScreenState,
} from "../components/UI";

export default function DetailScreen({ route }) {
  const { productId } = route.params;
  const { colors } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();

  const api = useApi(`/products/${productId}`);
  const product = api.data;
  const wide = width >= 760 && fontScale <= 1.3;

  if (api.loading && !product) {
    return (
      <ScreenState
        loading
        title="Taking a closer look"
        message="Loading product details…"
      />
    );
  }

  if (!product) {
    return (
      <ScreenState
        title="Couldn't load this product"
        message={api.error || "Please try again."}
        onRetry={api.retry}
      />
    );
  }

  const facts = [
    ["Brand", product.brand || "Not specified"],
    ["Stock", `${product.stock ?? 0} available`],
    ["Shipping", product.shippingInformation || "Not specified"],
    ["Returns", product.returnPolicy || "Not specified"],
  ];

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={api.refreshing}
            onRefresh={api.refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        {api.error && (
          <ErrorBanner
            message={api.error}
            onRetry={api.refresh}
          />
        )}

        <View style={[styles.layout, wide && styles.wideLayout]}>
          <View style={wide ? styles.column : undefined}>
            <ProductImage
              uri={product.images?.[0] || product.thumbnail}
              label={product.title}
              style={styles.heroImage}
            />
          </View>

          <View style={[styles.details, wide && styles.column]}>
            <View
              style={[styles.badge, { backgroundColor: colors.soft }]}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {product.category?.replace(/-/g, " ")}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {product.title}
            </Text>

            <Text style={{ color: colors.muted, fontSize: 15 }}>
              ★ {Number(product.rating ?? 0).toFixed(1)} / 5
              {"  ·  "}
              {product.availabilityStatus || "Availability unavailable"}
            </Text>

            <Text style={[styles.price, { color: colors.primary }]}>
              {priceLabel(product.price)}
            </Text>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              About this product
            </Text>

            <Text style={[styles.description, { color: colors.muted }]}>
              {product.description}
            </Text>

            <View
              style={[
                styles.facts,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {facts.map(([label, value]) => (
                <View key={label} style={styles.fact}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>
                    {label}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      lineHeight: 22,
                    }}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.note, { color: colors.muted }]}>
              Demo product information provided by DummyJSON.
              Prices are displayed in USD for this demo.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  layout: { gap: 26 },
  wideLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  heroImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 26,
  },
  details: { gap: 16 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  price: {
    fontSize: 32,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
  },
  facts: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 20,
    gap: 18,
  },
  fact: { gap: 5 },
  note: {
    fontSize: 12,
    lineHeight: 19,
  },
});