const timers = new Map();

/**
 * A standard debounce, but uses a string `name` as the key instead of the callback.
 */
export default function (name, callback, duration = 500) {
  const existing = timers.get(name);
  if (existing) {
    clearTimeout(existing);
  }

  timers.set(
    name,
    setTimeout(() => {
      timers.delete(name);
      callback();
    }, duration),
  );
}
