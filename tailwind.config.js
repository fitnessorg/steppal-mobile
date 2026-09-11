/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      /*
        Colours resolve to CSS variables defined in global.css, so a single
        class name works in both themes. Semantics, not hexes:

        accent  chartreuse — primary actions, goal met, your own row
        flame   urgency — countdowns, the live pot, selection
        money   naira figures and NOTHING else, so amounts read at a glance
      */
      colors: {
        ground: 'rgb(var(--ground) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        inkSoft: 'rgb(var(--inkSoft) / <alpha-value>)',
        inkFaint: 'rgb(var(--inkFaint) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentInk: 'rgb(var(--accentInk) / <alpha-value>)',
        flame: 'rgb(var(--flame) / <alpha-value>)',
        money: 'rgb(var(--money) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
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
