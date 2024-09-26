export function timeout(callback: () => void, duration: number): () => void {
  const id = setTimeout(callback, duration);

  return () => clearTimeout(id);
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  const time = () => performance.now();
  let cancel: (() => void) | undefined;
  let lastRan = 0; // Start with 0 to indicate it hasn't run yet

  return function (this: any, ...args: Parameters<T>) {
    const now = time();
    const context = this;

    if (now - lastRan >= limit) {
      // If enough time has passed, run the function immediately
      func.apply(context, args);
      lastRan = now;
    } else {
      // Otherwise, schedule it to run after the remaining time
      cancel?.(); // Cancel any previously scheduled call
      cancel = timeout(() => {
        func.apply(context, args);
        lastRan = time();
      }, limit - (now - lastRan));
    }
  };
}
