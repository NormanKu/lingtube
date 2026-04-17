const PREFIX = 'lingtube:';

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
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn('LocalStorage write failed:', err.message);
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
};
