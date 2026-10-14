const BASE_URL = "https://dummyjson.com";

export async function request(path, options = {}, outerSignal) {
  const controller = new AbortController();
  let timedOut = false;

  const abort = () => controller.abort();

  if (outerSignal?.aborted) {
    controller.abort();
  } else {
    outerSignal?.addEventListener("abort", abort);
  }

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(
        body.message || `Request failed (${response.status}).`
      );
    }

    return body;
  } catch (error) {
    if (timedOut) {
      throw new Error("The request timed out. Please try again.");
    }

    if (error.name === "AbortError") throw error;

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect. Check your internet and try again."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    outerSignal?.removeEventListener("abort", abort);
  }
}