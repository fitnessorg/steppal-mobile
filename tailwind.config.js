/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      /*
        Same brand as the web app. Every colour in the app resolves here —
        no component hardcodes a hex.

        ground is warm near-black rather than cold; with the chartreuse it
        reads as effort rather than gaming neon. `money` is reserved for naira
        figures ONLY, so amounts are recognisable without a label.
      */
      colors: {
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
      },
      fontFamily: {
        display: ['Unbounded_700Bold'],
        displayBlack: ['Unbounded_800ExtraBold'],
        body: ['InstrumentSans_400Regular'],
        bodyMed: ['InstrumentSans_500Medium'],
        bodyBold: ['InstrumentSans_600SemiBold'],
      },
    },
  },
  plugins: [],
};
