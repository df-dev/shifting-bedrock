/// <reference lib="webworker" />

self.addEventListener("message", (event: MessageEvent<{ script: string }>) => {
  const { script } = event.data;
  try {
    // Indirect eval runs in global scope — no access to module imports or main thread memory

    const result = (0, eval)(script);
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
});
