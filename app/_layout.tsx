import '../global.css';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'nativewind';
import { Unbounded_700Bold, Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
} from '@expo-google-fonts/instrument-sans';
import { getPersistedTheme, usePalette } from '../src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeReady, setThemeReady] = useState(false);
  const C = usePalette();

  const [loaded, error] = useFonts({
    Unbounded_700Bold,
    Unbounded_800ExtraBold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
  });

  useEffect(() => {
    void getPersistedTheme().then((theme) => {
      if (theme) {
        setColorScheme(theme);
      }
      setThemeReady(true);
    });
  }, [setColorScheme]);

  useEffect(() => {
    // Hide the native splash only once type AND theme are ready, so nothing renders in a
    // fallback face or wrong theme and then jumps when the real theme lands.
    if ((loaded || error) && themeReady) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error, themeReady]);

  if ((!loaded && !error) || !themeReady) return null;

  return (
    <>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.ground },
          animation: 'fade_from_bottom',
        }}
      />
    </>
  );
}
