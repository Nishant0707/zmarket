import { useCallback, useEffect, useRef, useState } from "react";

export const API_BASE = "https://dummyjson.com";

export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const currentRequest = useRef(null);

  const load = useCallback(
    async (isRefresh = false) => {
      currentRequest.current?.abort();

      const controller = new AbortController();
      currentRequest.current = controller;

      setError(null);
      setLoading(!isRefresh);
      setRefreshing(isRefresh);

      let timedOut = false;

      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 15000);

      try {
        const response = await fetch(`${API_BASE}${path}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This product could not be found."
              : `The server returned an error (${response.status}).`
          );
        }

        const result = await response.json();

        const valid =
          path.startsWith("/products?")
            ? Array.isArray(result.products)
            : result && typeof result.id === "number";

        if (!valid) {
          throw new Error("The server returned unexpected product data.");
        }

        if (currentRequest.current === controller) {
          setData(result);
        }
      } catch (requestError) {
        if (currentRequest.current !== controller) return;

        if (timedOut) {
          setError("The request took too long. Please try again.");
        } else if (requestError.name !== "AbortError") {
          setError(
            requestError instanceof TypeError
              ? "Unable to connect. Check your internet and try again."
              : requestError.message || "Something went wrong. Please retry."
          );
        }
      } finally {
        clearTimeout(timeout);

        if (currentRequest.current === controller) {
          setLoading(false);
          setRefreshing(false);
          currentRequest.current = null;
        }
      }
    },
    [path]
  );

  useEffect(() => {
    setData(null);
    load();

    return () => {
      const request = currentRequest.current;
      currentRequest.current = null;
      request?.abort();
    };
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    retry: () => load(false),
    refresh: () => load(true),
  };
}