type SandboxResult = { kind: "Ok"; value: unknown } | { kind: "Error"; error: string };

export function runInSandbox(script: string, timeoutMs = 5000): Promise<SandboxResult> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (result: SandboxResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    const worker = new Worker(new URL("./sandbox.worker.ts", import.meta.url), {
      type: "module",
    });

    const timer = setTimeout(() => {
      settle({ kind: "Error", error: "Script timed out after 5 seconds." });
    }, timeoutMs);

    worker.addEventListener(
      "message",
      (event: MessageEvent<{ result?: unknown; error?: string }>) => {
        const { result, error } = event.data;
        if (error !== undefined) {
          settle({ kind: "Error", error });
        } else {
          settle({ kind: "Ok", value: result });
        }
      }
    );

    worker.addEventListener("error", (event: ErrorEvent) => {
      settle({ kind: "Error", error: event.message ?? "Unknown worker error." });
    });

    worker.postMessage({ script });
  });
}
