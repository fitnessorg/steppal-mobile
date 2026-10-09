import { StepPalClient, type TokenPair } from '../sdk';
import { tokenStore } from './storage';

const TOKEN_KEY = 'steppal.tokens';

/**
 * The app runs in two modes, chosen by whether EXPO_PUBLIC_API_URL is set.
 *
 * Unset is the demo: mock stores, no network, nothing to run. That is how a
 * contributor clones the repo and sees the app in ninety seconds, and how the
 * pitch video gets the same numbers on every take.
 *
 * Set is the real thing: sign-in, pots and steps against steppal-core.
 *
 * Keeping both is not indecision. A mobile app whose only mode needs a server
 * is a mobile app most contributors never run.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export function isLive(): boolean {
  return API_URL.length > 0;
}

let tokens: TokenPair | null = null;
let loaded = false;

/** Reads the keychain once per launch, then serves from memory. */
async function readTokens(): Promise<TokenPair | null> {
  if (loaded) return tokens;
  loaded = true;
  try {
    const raw = await tokenStore().get(TOKEN_KEY);
    tokens = raw ? (JSON.parse(raw) as TokenPair) : null;
  } catch {
    tokens = null;
  }
  return tokens;
}

type TokenListener = (tokens: TokenPair | null) => void;
const listeners = new Set<TokenListener>();

/** Lets the session store react when the SDK clears a dead refresh token. */
export function onTokenChange(listener: TokenListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function writeTokens(next: TokenPair | null) {
  tokens = next;
  loaded = true;
  try {
    if (next) await tokenStore().set(TOKEN_KEY, JSON.stringify(next));
    else await tokenStore().remove(TOKEN_KEY);
  } catch {
    // A keychain write failing should not sign the user out of the session
    // they are in the middle of. The in-memory copy still works.
  }
  listeners.forEach((l) => l(next));
}

let client: StepPalClient | null = null;

export function api(): StepPalClient {
  if (!client) {
    client = new StepPalClient({
      baseUrl: API_URL,
      getTokens: readTokens,
      onTokens: writeTokens,
    });
  }
  return client;
}

/** True once a previous launch's tokens have been read off disk. */
export async function restoreSession(): Promise<TokenPair | null> {
  return readTokens();
}
