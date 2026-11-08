import { tokenStore } from '../storage';

const mockMemory = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockMemory.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, val: string) => {
    mockMemory.set(key, val);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockMemory.delete(key);
  }),
}));

describe('src/api/client', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;

  beforeEach(() => {
    mockMemory.clear();
    jest.resetModules();
  });

  afterAll(() => {
    if (originalEnv === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    }
  });

  it('reports demo mode (isLive() === false) when EXPO_PUBLIC_API_URL is unset', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clientMod = require('../client') as typeof import('../client');
    expect(clientMod.API_URL).toBe('');
    expect(clientMod.isLive()).toBe(false);
  });

  it('reports live mode (isLive() === true) when EXPO_PUBLIC_API_URL is set', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.steppal.example';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clientMod = require('../client') as typeof import('../client');
    expect(clientMod.API_URL).toBe('https://api.steppal.example');
    expect(clientMod.isLive()).toBe(true);
  });

  it('returns a singleton StepPalClient from api()', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.steppal.example';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clientMod = require('../client') as typeof import('../client');
    const c1 = clientMod.api();
    const c2 = clientMod.api();
    expect(c1).toBe(c2);
  });

  it('restores saved tokens from storage once and caches in memory', async () => {
    const pair = { accessToken: 'acc-1', refreshToken: 'ref-1' };
    mockMemory.set('steppal.tokens', JSON.stringify(pair));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clientMod = require('../client') as typeof import('../client');
    const restored = await clientMod.restoreSession();
    expect(restored).toEqual(pair);

    // Subsequent calls read from memory even if storage changes underneath
    mockMemory.delete('steppal.tokens');
    const second = await clientMod.restoreSession();
    expect(second).toEqual(pair);
  });

  it('returns null when stored token JSON is malformed', async () => {
    mockMemory.set('steppal.tokens', '{bad-json');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clientMod = require('../client') as typeof import('../client');
    const restored = await clientMod.restoreSession();
    expect(restored).toBeNull();
  });

  it('notifies token listeners and persists tokens when SDK updates or clears tokens', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.steppal.example';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clientMod = require('../client') as typeof import('../client');

    const seen: ({ accessToken: string; refreshToken: string } | null)[] = [];
    const unsubscribe = clientMod.onTokenChange((t) => seen.push(t));

    // logout() on the StepPalClient invokes onTokens(null)
    await clientMod.api().logout();
    expect(seen).toEqual([null]);
    expect(await tokenStore().get('steppal.tokens')).toBeNull();

    unsubscribe();
    await clientMod.api().logout();
    expect(seen).toHaveLength(1);
  });
});
