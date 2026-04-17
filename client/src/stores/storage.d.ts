export const storage: {
  get<T>(key: string, defaultValue: T): T;
  get<T = null>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};
