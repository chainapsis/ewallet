function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryOpts {
  readonly maxRetries: number;
  readonly waitMsAfterError?: number;
  readonly maxWaitMsAfterError?: number;
  readonly onFailed?: (e: any) => void;
}

export async function retry<R>(
  task: () => Promise<R>,
  opts: RetryOpts,
): Promise<R> {
  let retries = 0;
  while (true) {
    try {
      const promise = task();
      return await promise;
    } catch (e) {
      if (retries >= opts.maxRetries) {
        throw e;
      }

      if (opts.onFailed) {
        opts.onFailed(e);
      }

      let waitMs = opts.waitMsAfterError || 0;
      if (waitMs > 0) {
        if (opts.maxWaitMsAfterError != null && opts.maxWaitMsAfterError > 0) {
          waitMs = 2 ** retries * waitMs;
          waitMs = Math.min(waitMs, opts.maxWaitMsAfterError);
        }

        await sleep(waitMs);
      }

      retries++;
    }
  }
}
