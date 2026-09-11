/**
 * Colour and type tokens, mirrored from tailwind.config.js.
 *
 * NativeWind classes cover most styling; this is for the places that need a
 * raw value — navigation options, StatusBar, SVG-ish props.
 */
export const C = {
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

export const F = {
  display: 'Unbounded_700Bold',
  displayBlack: 'Unbounded_800ExtraBold',
  body: 'InstrumentSans_400Regular',
  bodyMed: 'InstrumentSans_500Medium',
  bodyBold: 'InstrumentSans_600SemiBold',
} as const;
