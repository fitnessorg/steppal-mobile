import { Image, Pressable, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

/* ------------------------------------------------------------------ Screen */

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ground">
      {children}
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------- Logo */

/**
 * The mark is dark artwork on transparency, so it needs inverting on the dark
 * ground. `tintColor` recolours it wholesale, which is right for a small mark —
 * at this size it reads as an icon, not a product shot.
 */
export function Logo({ size = 26 }: { size?: number }) {
  const { colorScheme } = useColorScheme();
  return (
    <Image
      source={require('../../assets/steppal-mark.png')}
      style={{
        width: size * 1.45,
        height: size,
        resizeMode: 'contain',
        tintColor: colorScheme === 'light' ? '#14120F' : '#F7F2E9',
      }}
    />
  );
}

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <Logo size={size} />
      <Text className="font-displayBlack text-[15px] tracking-tight text-ink">StepPal</Text>
    </View>
  );
}

/* ------------------------------------------------------------- ThemeToggle */

/**
 * Three states, matching how the OS works: explicit light, explicit dark, or
 * follow the system. A two-way switch strands anyone who wants to go back to
 * following their phone.
 *
 * TODO(contributor): persist the choice
 * The selection resets on app restart. Store it (expo-secure-store is already
 * a dependency, or add async-storage) and apply it before first paint.
 * difficulty: easy
 */
export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const next = { light: 'dark', dark: 'system', system: 'light' } as const;
  const label = { light: 'Light', dark: 'Dark', system: 'Auto' } as const;
  const current = (colorScheme ?? 'system') as keyof typeof next;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${label[current]}. Tap to change.`}
      onPress={() => setColorScheme(next[current])}
      className="rounded-full border border-surface2 px-3 py-1.5 active:opacity-70"
    >
      <Text className="font-bodyMed text-[11px] uppercase tracking-[1.5px] text-inkSoft">
        {label[current]}
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------- Text */

export function H1({ children }: { children: React.ReactNode }) {
  return <Text className="font-displayBlack text-3xl leading-tight text-ink">{children}</Text>;
}

export function Label({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: 'accent' | 'flame';
}) {
  const color =
    tone === 'accent' ? 'text-accent' : tone === 'flame' ? 'text-flame' : 'text-inkFaint';
  return (
    <Text className={`font-bodyMed text-[11px] uppercase tracking-[2px] ${color}`}>{children}</Text>
  );
}

export function Body({
  children,
  dim,
  className = '',
}: {
  children: React.ReactNode;
  dim?: boolean;
  className?: string;
}) {
  return (
    <Text
      className={`font-body text-[15px] leading-6 ${dim ? 'text-inkSoft' : 'text-ink'} ${className}`}
    >
      {children}
    </Text>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({ children, className = '', ...rest }: ViewProps & { className?: string }) {
  return (
    <View className={`rounded-2xl bg-surface p-5 ${className}`} {...rest}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ Button */

export function Button({
  label,
  onPress,
  tone = 'accent',
  disabled,
}: {
  label: string;
  onPress?: () => void;
  tone?: 'accent' | 'flame' | 'ghost';
  disabled?: boolean;
}) {
  const bg =
    tone === 'accent'
      ? 'bg-accent'
      : tone === 'flame'
        ? 'bg-flame'
        : 'border border-surface2 bg-transparent';
  const fg = tone === 'ghost' ? 'text-ink' : tone === 'flame' ? 'text-white' : 'text-accentInk';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`${bg} items-center rounded-full px-6 py-4 ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
    >
      <Text className={`font-bodyBold text-[15px] ${fg}`}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------- ProgressBar */

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-surface2">
      <View style={{ width: `${pct * 100}%` }} className="h-full rounded-full bg-accent" />
    </View>
  );
}

/* ----------------------------------------------------------------- DayGrid */

/** Seven squares, filled where the goal was met. The clearest read on a week. */
export function DayGrid({ days }: { days: { day: string; goalMet: boolean }[] }) {
  return (
    <View className="flex-row justify-between">
      {days.map((d, i) => (
        <View key={i} className="items-center gap-2">
          <View className={`h-9 w-9 rounded-lg ${d.goalMet ? 'bg-accent' : 'bg-surface2'}`} />
          <Text className="font-body text-[11px] text-inkFaint">{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

/* --------------------------------------------------------------- Separator */

export function Divider() {
  return <View className="h-px w-full bg-surface2" />;
}
