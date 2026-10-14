import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "./api";

const PAGE_SIZE = 12;

const SORTS = {
  recommended: ["id", "asc"],
  priceLow: ["price", "asc"],
  priceHigh: ["price", "desc"],
  rating: ["rating", "desc"],
};

function emptyFeed(key) {
  return {
    key,
    items: [],
    total: 0,
    next: 0,
    phase: "initial",
    error: null,
    failedMode: null,
  };
}

function compareProducts(a, b, field, direction) {
  const difference = Number(a[field]) - Number(b[field]);
  return (direction === "desc" ? -difference : difference) || a.id - b.id;
}

export function useCatalog({ query, category, sort, startsWith }) {
  const normalizedQuery = query.trim().toLowerCase();

  const key = JSON.stringify([
    normalizedQuery,
    category,
    sort,
    startsWith,
  ]);

  const [feed, setFeed] = useState(() => emptyFeed(key));
  const feedRef = useRef(feed);
  const activeRequest = useRef(null);
  const searchCache = useRef(null);

  const commit = useCallback((next) => {
    feedRef.current = next;
    setFeed(next);
  }, []);

  const run = useCallback(
    async (mode = "initial") => {
      const previous = feedRef.current;

      if (mode === "more") {
        if (
          activeRequest.current ||
          previous.key !== key ||
          previous.next >= previous.total
        ) {
          return;
        }
      }

      activeRequest.current?.abort();

      const controller = new AbortController();
      activeRequest.current = controller;

      const base = previous.key === key ? previous : emptyFeed(key);
      const skip = mode === "more" ? base.next : 0;

      commit({
        ...base,
        phase: mode,
        error: null,
        failedMode: null,
      });

      try {
        const [field, direction] = SORTS[sort] || SORTS.recommended;
        let page;
        let total;

        if (normalizedQuery) {
          let matches;

          if (
            mode === "more" &&
            searchCache.current?.key === key
          ) {
            matches = searchCache.current.items;
          } else {
            const result = await request(
              `/products/search?q=${encodeURIComponent(normalizedQuery)}&limit=0`,
              {},
              controller.signal
            );

            if (!Array.isArray(result.products)) {
              throw new Error("Unexpected product response.");
            }

            matches = result.products
              .filter((product) => {
                const title = product.title.toLowerCase();

                const matchesText = startsWith
                  ? title.startsWith(normalizedQuery)
                  : title.includes(normalizedQuery);

                return (
                  matchesText &&
                  (category === "all" || product.category === category)
                );
              })
              .sort((a, b) =>
                compareProducts(a, b, field, direction)
              );

            if (activeRequest.current !== controller) return;

            searchCache.current = { key, items: matches };
          }

          total = matches.length;
          page = matches.slice(skip, skip + PAGE_SIZE);
        } else {
          const endpoint =
            category === "all"
              ? "/products"
              : `/products/category/${encodeURIComponent(category)}`;

          const result = await request(
            `${endpoint}?limit=${PAGE_SIZE}&skip=${skip}&sortBy=${field}&order=${direction}`,
            {},
            controller.signal
          );

          if (
            !Array.isArray(result.products) ||
            typeof result.total !== "number"
          ) {
            throw new Error("Unexpected product response.");
          }

          page = result.products;
          total = result.total;
        }

        if (activeRequest.current !== controller) return;

        const combined =
          mode === "more" ? [...base.items, ...page] : page;

        const unique = [
          ...new Map(combined.map((item) => [item.id, item])).values(),
        ];

        commit({
          key,
          items: unique,
          total,
          next: page.length ? skip + page.length : total,
          phase: "idle",
          error: null,
          failedMode: null,
        });
      } catch (error) {
        if (
          activeRequest.current !== controller ||
          error.name === "AbortError"
        ) {
          return;
        }

        commit({
          ...base,
          phase: "idle",
          error: error.message || "Could not load products.",
          failedMode: mode,
        });
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = null;
        }
      }
    },
    [key, normalizedQuery, category, sort, startsWith, commit]
  );

  useEffect(() => {
    searchCache.current = null;
    run("initial");

    return () => {
      const controller = activeRequest.current;
      activeRequest.current = null;
      controller?.abort();
    };
  }, [run]);

  const visible = feed.key === key ? feed : emptyFeed(key);

  return {
    ...visible,
    hasMore: visible.next < visible.total,
    refresh: () => run("refresh"),
    loadMore: () => run("more"),
    retry: () => run(feedRef.current.failedMode || "initial"),
  };
}