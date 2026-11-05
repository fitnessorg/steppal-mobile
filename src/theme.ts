import { useColorScheme } from 'nativewind';
import { tokenStore } from './api/storage';

export type ThemeChoice = 'light' | 'dark' | 'system';
export const THEME_KEY = 'steppal.theme_choice';

export async function getPersistedTheme(): Promise<ThemeChoice | null> {
  try {
    const val = await tokenStore().get(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch {
    // If storage read fails, fallback to null (system default)
  }
  return null;
}

export async function persistTheme(choice: ThemeChoice): Promise<void> {
  try {
    await tokenStore().set(THEME_KEY, choice);
  } catch {
    // Non-fatal if storage write fails
  }
}

/**
 * Raw palette values, mirrored from global.css.
 *
 * NativeWind classes cover the UI; this is for the handful of places that
 * need a literal — navigation options, StatusBar, inline style props.
 */
export const LIGHT = {
  ground: '#F5F4F1',
  surface: '#FFFFFF',
  surface2: '#E3E0D9',
  ink: '#14120F',
  inkSoft: '#56514A',
  inkFaint: '#8A847A',
  accent: '#C4DE18',
  accentInk: '#14120F',
  flame: '#FF4A1C',
  money: '#C2551F',
  danger: '#C4382F',
} as const;

export const DARK = {
  ground: '#0C0A08',
  surface: '#16130F',
  surface2: '#241E18',
  ink: '#F7F2E9',
  inkSoft: '#A9A093',
  inkFaint: '#6B6459',
  accent: '#D6F035',
  accentInk: '#0C0A08',
  flame: '#FF4A1C',
  money: '#E8875A',
  danger: '#E5645C',
} as const;

/** Palette for whichever theme is live. */
export function usePalette() {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'light' ? LIGHT : DARK;
}

export const F = {
  display: 'Unbounded_700Bold',
  displayBlack: 'Unbounded_800ExtraBold',
  body: 'InstrumentSans_400Regular',
  bodyMed: 'InstrumentSans_500Medium',
  bodyBold: 'InstrumentSans_600SemiBold',
} as const;
