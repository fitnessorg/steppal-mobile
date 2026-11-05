import {
  bootstrapSession,
  currentUser,
  hasSeenOnboarding,
  markOnboardingSeen,
  resetOnboardingForTest,
  ONBOARDING_KEY,
  DEMO_USER,
} from '../session';
import { tokenStore } from '../api/storage';

const mockSecureStorage = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStorage.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStorage.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStorage.delete(key);
  }),
}));

jest.mock('../api/client', () => ({
  isLive: jest.fn(() => false),
  api: jest.fn(() => ({
    me: jest.fn(),
    logout: jest.fn(),
  })),
  onTokenChange: jest.fn(),
  restoreSession: jest.fn(),
}));

describe('Session and Onboarding State', () => {
  beforeEach(async () => {
    mockSecureStorage.clear();
    resetOnboardingForTest();
    await tokenStore().remove(ONBOARDING_KEY);
  });

  it('defaults to not seen onboarding when storage is empty', () => {
    expect(hasSeenOnboarding()).toBe(false);
  });

  it('marks onboarding seen in memory and storage', async () => {
    markOnboardingSeen();
    expect(hasSeenOnboarding()).toBe(true);

    const stored = await tokenStore().get(ONBOARDING_KEY);
    expect(stored).toBe('true');
  });

  it('restores persisted onboarding seen status during bootstrap', async () => {
    await tokenStore().set(ONBOARDING_KEY, 'true');

    expect(hasSeenOnboarding()).toBe(false);
    await bootstrapSession();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('leaves onboarding as false during bootstrap if not previously seen', async () => {
    await tokenStore().remove(ONBOARDING_KEY);

    await bootstrapSession();
    expect(hasSeenOnboarding()).toBe(false);
  });

  it('signs in demo user when not in live mode', async () => {
    const session = await bootstrapSession();
    expect(session.status).toBe('signed-in');
    expect(currentUser()).toEqual(DEMO_USER);
  });

  it('handles storage errors during bootstrap gracefully without throwing', async () => {
    jest.spyOn(tokenStore(), 'get').mockRejectedValueOnce(new Error('Keychain corrupted'));

    await expect(bootstrapSession()).resolves.toBeDefined();
    expect(hasSeenOnboarding()).toBe(false);
  });

  it('preserves onboarding status when signing out', async () => {
    markOnboardingSeen();
    expect(hasSeenOnboarding()).toBe(true);

    const { signOut } = require('../session');
    await signOut();
    expect(currentUser()).toBeNull();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('updates session when setSignedIn is called', () => {
    const { setSignedIn } = require('../session');
    const customUser = { ...DEMO_USER, id: 'custom-user', displayName: 'Ada' };
    setSignedIn(customUser);
    expect(currentUser()).toEqual(customUser);
  });
});
