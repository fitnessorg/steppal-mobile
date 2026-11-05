import { getPersistedTheme, persistTheme, THEME_KEY, usePalette, LIGHT, DARK } from '../theme';
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

let mockColorScheme = 'light';
jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    colorScheme: mockColorScheme,
    setColorScheme: (val: string) => {
      mockColorScheme = val;
    },
  }),
}));

describe('Theme Persistence and Palette', () => {
  beforeEach(async () => {
    mockSecureStorage.clear();
    mockColorScheme = 'light';
    await tokenStore().remove(THEME_KEY);
  });

  it('returns null when no theme is persisted', async () => {
    expect(await getPersistedTheme()).toBeNull();
  });

  it('persists and retrieves dark theme choice', async () => {
    await persistTheme('dark');
    expect(await getPersistedTheme()).toBe('dark');
    expect(mockSecureStorage.get(THEME_KEY)).toBe('dark');
  });

  it('persists and retrieves system theme choice', async () => {
    await persistTheme('system');
    expect(await getPersistedTheme()).toBe('system');
  });

  it('ignores invalid stored theme values and returns null', async () => {
    mockSecureStorage.set(THEME_KEY, 'neon-green');
    expect(await getPersistedTheme()).toBeNull();
  });

  it('returns correct palette based on active color scheme', () => {
    mockColorScheme = 'light';
    expect(usePalette()).toBe(LIGHT);

    mockColorScheme = 'dark';
    expect(usePalette()).toBe(DARK);
  });
});
