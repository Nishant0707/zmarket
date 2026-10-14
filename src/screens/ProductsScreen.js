import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../theme";
import { request } from "../api";
import { useCatalog } from "../useCatalog";
import {
  AppButton,
  ErrorBanner,
  IconButton,
  priceLabel,
  ProductImage,
  ScreenState,
  ThemeToggle,
} from "../components/UI";

const DEFAULT_FILTERS = {
  category: "all",
  sort: "recommended",
  startsWith: false,
};

const SORT_OPTIONS = [
  ["recommended", "Recommended", "sparkles-outline"],
  ["priceLow", "Price: low to high", "arrow-up-outline"],
  ["priceHigh", "Price: high to low", "arrow-down-outline"],
  ["rating", "Highest rated", "star-outline"],
];

function categoryLabel(value = "") {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function FilterSheet({
  visible,
  onClose,
  applied,
  onApply,
  categories,
  categoryLoading,
  categoryError,
  onRetryCategories,
}) {
  const { colors } = useAppTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    if (visible) setDraft({ ...applied });
  }, [visible, applied]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close filters"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              maxHeight: Math.max(
                180,
                height - insets.top - 24
              ),
              paddingBottom: Math.max(insets.bottom, 16),
              marginLeft: insets.left,
              marginRight: insets.right,
            },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: colors.border }]}
          />

          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Refine your search
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>
                Find more of what you like.
              </Text>
            </View>

            <IconButton
              name="close-outline"
              label="Close filters"
              onPress={onClose}
            />
          </View>

          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              CATEGORY
            </Text>

            <View style={styles.categoryWrap}>
              {["all", ...categories].map((item) => {
                const active = draft.category === item;

                return (
                  <Pressable
                    key={item}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() =>
                      setDraft((previous) => ({
                        ...previous,
                        category: item,
                      }))
                    }
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active
                          ? colors.soft
                          : colors.background,
                        borderColor: active
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.primary : colors.text,
                        fontSize: 13,
                        fontWeight: active ? "700" : "500",
                        flexShrink: 1,
                      }}
                    >
                      {item === "all"
                        ? "All categories"
                        : categoryLabel(item)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {categoryLoading && (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 16 }}
              />
            )}

            {categoryError && (
              <ErrorBanner
                message={categoryError}
                onRetry={onRetryCategories}
              />
            )}

            <Text
              style={[
                styles.filterLabel,
                { color: colors.text, marginTop: 30 },
              ]}
            >
              SORT BY
            </Text>

            <View style={{ gap: 8 }}>
              {SORT_OPTIONS.map(([value, label, icon]) => {
                const active = draft.sort === value;

                return (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() =>
                      setDraft((previous) => ({
                        ...previous,
                        sort: value,
                      }))
                    }
                    style={[
                      styles.sortOption,
                      {
                        backgroundColor: active
                          ? colors.soft
                          : colors.background,
                        borderColor: active
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={19}
                      color={active ? colors.primary : colors.muted}
                    />

                    <Text
                      style={{
                        flex: 1,
                        color: active ? colors.primary : colors.text,
                        fontWeight: active ? "700" : "500",
                        lineHeight: 21,
                      }}
                    >
                      {label}
                    </Text>

                    <Ionicons
                      name={
                        active
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={21}
                      color={active ? colors.primary : colors.muted}
                    />
                  </Pressable>
                );
              })}
            </View>

            <View
              style={[
                styles.matchRow,
                { borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  Starts with keyword
                </Text>

                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                    lineHeight: 19,
                    marginTop: 5,
                  }}
                >
                  “A” shows product names beginning with A.
                </Text>
              </View>

              <Switch
                value={draft.startsWith}
                onValueChange={(value) =>
                  setDraft((previous) => ({
                    ...previous,
                    startsWith: value,
                  }))
                }
                accessibilityLabel="Product name starts with keyword"
                trackColor={{
                  false: "#B9BAC4",
                  true: "#6952E8",
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          <View
            style={[
              styles.sheetFooter,
              { borderTopColor: colors.border },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => setDraft({ ...DEFAULT_FILTERS })}
              style={[
                styles.resetButton,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                Reset
              </Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <AppButton
                title="Apply filters"
                onPress={() => {
                  onApply({ ...draft });
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProductsScreen({
  navigation,
  user,
  onLogout,
}) {
  const { colors } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();

  const [containerWidth, setContainerWidth] = useState(
    Math.min(width, 1200)
  );
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [filterVisible, setFilterVisible] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryAttempt, setCategoryAttempt] = useState(0);

  const listRef = useRef(null);

  const padding = containerWidth >= 700 ? 28 : 16;
  const gap = 12;
  const availableWidth = Math.max(1, containerWidth - padding * 2);

  // Larger accessibility text gets wider cards and fewer columns.
  const minimumCardWidth = 155 * Math.max(1, fontScale);

  const columns = Math.max(
    1,
    Math.min(
      4,
      Math.floor(
        (availableWidth + gap) / (minimumCardWidth + gap)
      )
    )
  );

  const cardWidth =
    (availableWidth - gap * (columns - 1)) / columns;

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    const controller = new AbortController();

    setCategoryLoading(true);
    setCategoryError(null);

    request("/products/category-list", {}, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;

        if (
          !Array.isArray(result) ||
          !result.every((item) => typeof item === "string")
        ) {
          throw new Error("Could not read product categories.");
        }

        setCategories(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategoryError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCategoryLoading(false);
        }
      });

    return () => controller.abort();
  }, [categoryAttempt]);

  const catalog = useCatalog({
    query,
    category: filters.category,
    sort: filters.sort,
    startsWith: filters.startsWith,
  });

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [
    query,
    filters.category,
    filters.sort,
    filters.startsWith,
  ]);

  const pendingSearch = text.trim() !== query;
  const items = pendingSearch ? [] : catalog.items;

  const loading =
    pendingSearch ||
    (catalog.phase === "initial" && items.length === 0);

  const activeCount =
    Number(filters.category !== "all") +
    Number(filters.sort !== "recommended") +
    Number(filters.startsWith);

  const sortLabel =
    SORT_OPTIONS.find(([value]) => value === filters.sort)?.[1];

  function resetAll() {
    setText("");
    setQuery("");
    setFilters({ ...DEFAULT_FILTERS });
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={styles.shell}
        onLayout={(event) =>
          setContainerWidth(event.nativeEvent.layout.width)
        }
      >
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: padding,
              backgroundColor: colors.background,
            },
          ]}
        >
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <View
                style={[
                  styles.logoBox,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Image
                  source={require("../../assets/Z.png")}
                  style={styles.logo}
                  resizeMode="contain"
                  accessibilityLabel="Z Market"
                />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[styles.brandName, { color: colors.text }]}
                >
                  Z Market
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.greeting, { color: colors.muted }]}
                >
                  Hi, {user?.firstName || "Explorer"}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <ThemeToggle />
              <IconButton
                name="log-out-outline"
                label="Sign out"
                onPress={onLogout}
              />
            </View>
          </View>

          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={21}
                color={colors.muted}
              />

              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Search products"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="Search products by name"
                onSubmitEditing={() => {
                  setQuery(text.trim());
                  Keyboard.dismiss();
                }}
                style={[
                  styles.searchInput,
                  { color: colors.text },
                ]}
              />

              {!!text && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => {
                    setText("");
                    setQuery("");
                  }}
                  style={styles.clearSearch}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open filters. ${activeCount} active.`}
              onPress={() => {
                Keyboard.dismiss();
                setFilterVisible(true);
              }}
              style={styles.filterButton}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color="#FFFFFF"
              />

              {activeCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <FlatList
          ref={listRef}
          key={`grid-${columns}`}
          data={items}
          numColumns={columns}
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: padding,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          columnWrapperStyle={
            columns > 1 ? { gap, alignItems: "stretch" } : undefined
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={catalog.phase === "refresh"}
              onRefresh={catalog.refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text
                style={[styles.eyebrow, { color: colors.primary }]}
              >
                THE EVERYDAY COLLECTION
              </Text>

              <Text
                style={[styles.pageTitle, { color: colors.text }]}
              >
                {query
                  ? "Your search results."
                  : filters.category !== "all"
                    ? categoryLabel(filters.category)
                    : "Find your next favorite."}
              </Text>

              <Text
                style={[styles.description, { color: colors.muted }]}
              >
                {query
                  ? `Matching “${query}”${filters.startsWith ? " at the start of the name" : ""}`
                  : "Thoughtful finds for your everyday."}
              </Text>

              {activeCount > 0 && (
                <View style={styles.activeFilters}>
                  {filters.category !== "all" && (
                    <Text
                      style={[
                        styles.activeTag,
                        {
                          color: colors.primary,
                          backgroundColor: colors.soft,
                        },
                      ]}
                    >
                      {categoryLabel(filters.category)}
                    </Text>
                  )}

                  {filters.sort !== "recommended" && (
                    <Text
                      style={[
                        styles.activeTag,
                        {
                          color: colors.primary,
                          backgroundColor: colors.soft,
                        },
                      ]}
                    >
                      {sortLabel}
                    </Text>
                  )}

                  {filters.startsWith && (
                    <Text
                      style={[
                        styles.activeTag,
                        {
                          color: colors.primary,
                          backgroundColor: colors.soft,
                        },
                      ]}
                    >
                      Starts with
                    </Text>
                  )}

                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setFilters({ ...DEFAULT_FILTERS })
                    }
                    style={styles.clearFilters}
                  >
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Clear filters
                    </Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.resultRow}>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {loading
                    ? "Finding products…"
                    : `${catalog.total} products`}
                </Text>

                {!loading && items.length > 0 && (
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {items.length} shown
                  </Text>
                )}
              </View>

              {!pendingSearch &&
                catalog.error &&
                catalog.failedMode !== "more" && (
                  <ErrorBanner
                    message={catalog.error}
                    onRetry={catalog.retry}
                  />
                )}
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <ScreenState
                loading
                title="A moment of discovery"
                message="Loading your products…"
              />
            ) : catalog.error ? null : (
              <View>
                <ScreenState
                  title="Nothing here just yet"
                  message="Try a different keyword or clear your filters."
                />
                <AppButton
                  title="Reset search and filters"
                  onPress={resetAll}
                />
              </View>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${item.title}, ${priceLabel(item.price)}`}
              onPress={() =>
                navigation.navigate("Details", {
                  productId: item.id,
                })
              }
              style={({ pressed }) => [
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <ProductImage
                uri={item.thumbnail}
                label={item.title}
                style={styles.productImage}
              />

              <View style={styles.cardContent}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.categoryText,
                    { color: colors.muted },
                  ]}
                >
                  {categoryLabel(item.category)}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.productTitle,
                    { color: colors.text },
                  ]}
                >
                  {item.title}
                </Text>

                <View style={styles.ratingRow}>
                  <Ionicons
                    name="star"
                    size={12}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {Number(item.rating || 0).toFixed(1)}
                  </Text>
                  <Text
                    style={{ color: colors.muted, fontSize: 11 }}
                  >
                    / 5
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text
                    style={[
                      styles.productPrice,
                      { color: colors.text },
                    ]}
                  >
                    {priceLabel(item.price)}
                  </Text>

                  <View
                    style={[
                      styles.cardArrow,
                      { backgroundColor: colors.soft },
                    ]}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            items.length > 0 ? (
              <View style={styles.footer}>
                {catalog.error &&
                catalog.failedMode === "more" ? (
                  <ErrorBanner
                    message={catalog.error}
                    onRetry={catalog.retry}
                  />
                ) : catalog.hasMore ? (
                  <AppButton
                    title="Discover more"
                    loading={catalog.phase === "more"}
                    disabled={catalog.phase !== "idle"}
                    onPress={catalog.loadMore}
                  />
                ) : (
                  <View style={styles.endMessage}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 13,
                        flexShrink: 1,
                      }}
                    >
                      You’re all caught up.
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.footerText,
                    { color: colors.muted },
                  ]}
                >
                  Sample collection by DummyJSON
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        applied={filters}
        onApply={setFilters}
        categories={categories}
        categoryLoading={categoryLoading}
        categoryError={categoryError}
        onRetryCategories={() =>
          setCategoryAttempt((value) => value + 1)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 32, height: 32 },
  brandName: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  greeting: { fontSize: 11, marginTop: 3 },
  headerActions: { flexDirection: "row", gap: 8 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    borderWidth: 1,
    borderRadius: 17,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
  },
  clearSearch: {
    width: 44,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#6952E8",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -5,
    right: -3,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#191724",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  listHeader: { paddingTop: 12, paddingBottom: 4 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  pageTitle: {
    fontSize: 29,
    lineHeight: 36,
    letterSpacing: -1,
    fontWeight: "800",
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  activeTag: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  clearFilters: {
    minHeight: 44,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  resultRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 23,
    padding: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
  },
  cardContent: {
    flexGrow: 1,
    padding: 5,
    paddingTop: 13,
    gap: 8,
  },
  categoryText: { fontSize: 10 },
  productTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  priceRow: {
    marginTop: "auto",
    paddingTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  cardArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingTop: 14,
    paddingBottom: 12,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  endMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 22,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,10,18,0.48)",
  },
  sheet: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 620,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    flexShrink: 1,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  sheetHeader: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  sheetContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },
  filterLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
    marginBottom: 14,
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  categoryChip: {
    maxWidth: "100%",
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
    justifyContent: "center",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 54,
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
  },
  matchRow: {
    marginTop: 26,
    paddingTop: 22,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sheetFooter: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resetButton: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});