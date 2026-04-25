const PREFIX = 'lingtube:';

function isQuotaError(err) {
  if (!err) return false;
  // Spec name, Firefox legacy code, Webkit legacy code.
  return (
    err.name === 'QuotaExceededError' ||
    err.code === 22 ||
    err.code === 1014 ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

function evictOldestThird() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  if (keys.length === 0) return 0;
  // Best-effort LRU: drop the lowest-third by lexical order. Keys are
  // namespaced like "lingtube:learning:<videoId>" so this approximates
  // "videos opened earliest". Without timestamps we cannot do better.
  keys.sort();
  const toRemove = Math.max(1, Math.floor(keys.length / 3));
  for (let i = 0; i < toRemove; i++) localStorage.removeItem(keys[i]);
  return toRemove;
}

export const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    const fullKey = PREFIX + key;
    const payload = JSON.stringify(value);
    try {
      localStorage.setItem(fullKey, payload);
      return true;
    } catch (err) {
      if (isQuotaError(err)) {
        const evicted = evictOldestThird();
        try {
          localStorage.setItem(fullKey, payload);
          console.warn(`LocalStorage full: evicted ${evicted} oldest key(s) and retried`);
          return true;
        } catch (retryErr) {
          console.warn('LocalStorage write failed after eviction:', retryErr.message);
          return false;
        }
      }
      console.warn('LocalStorage write failed:', err.message);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
};
