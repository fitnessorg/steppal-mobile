/**
 * Token storage.
 *
 * Tokens belong in the keychain, not in plain app storage: a refresh token is
 * good for thirty days and mints sessions. expo-secure-store is the right home,
 * but it is a native module, so it is absent from Expo Go and from any build
 * made before it was installed.
 *
 * Rather than crash in those builds, this falls back to memory and says so.
 * The app still works; you just sign in again after a restart. Same runtime
 * detection as src/health — `npm install` does not put native code into an
 * already-built APK, so a build flag would lie.
 */

type Store = {
  readonly persistent: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

const memory = new Map<string, string>();

const MemoryStore: Store = {
  persistent: false,
  async get(key) {
    return memory.get(key) ?? null;
  },
  async set(key, value) {
    memory.set(key, value);
  },
  async remove(key) {
    memory.delete(key);
  },
};

function secureStore(): Store | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-secure-store') as {
      getItemAsync(k: string): Promise<string | null>;
      setItemAsync(k: string, v: string): Promise<void>;
      deleteItemAsync(k: string): Promise<void>;
    };
    if (typeof mod?.getItemAsync !== 'function') return null;

    return {
      persistent: true,
      get: (k) => mod.getItemAsync(k),
      set: (k, v) => mod.setItemAsync(k, v),
      remove: (k) => mod.deleteItemAsync(k),
    };
  } catch {
    return null;
  }
}

let cached: Store | null = null;

export function tokenStore(): Store {
  if (!cached) {
    cached = secureStore() ?? MemoryStore;
    if (!cached.persistent) {
      console.warn('[steppal] expo-secure-store unavailable — sessions last until restart');
    }
  }
  return cached;
}
