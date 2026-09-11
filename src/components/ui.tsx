import { Image, Pressable, ScrollView, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { usePalette } from '../theme';

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
 * Dark artwork on transparency, so it's tinted rather than shown raw — at this
 * size it reads as an icon, not a product shot.
 */
export function Logo({ size = 28 }: { size?: number }) {
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

/* --------------------------------------------------------------- AppHeader */

export type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  dot?: boolean;
};

/**
 * One header shape for every screen: identity or title on the left, icon
 * actions on the right. Consistency here is most of what makes an app feel
 * organised rather than assembled.
 */
export function AppHeader({
  title,
  logo,
  actions = [],
}: {
  title?: string;
  logo?: boolean;
  actions?: HeaderAction[];
}) {
  const C = usePalette();
  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
      {logo ? <Logo /> : <Text className="font-displayBlack text-[26px] text-ink">{title}</Text>}

      <View className="flex-row items-center gap-1">
        {actions.map((a) => (
          <Pressable
            key={a.label}
            onPress={a.onPress}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            className="relative h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          >
            <Ionicons name={a.icon} size={22} color={C.ink} />
            {a.dot ? (
              <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-flame" />
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ----------------------------------------------------------- SectionHeader */

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 mt-8 flex-row items-center justify-between">
      <Text className="font-display text-[17px] text-ink">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} className="active:opacity-60">
          <Text className="font-bodyBold text-[13px] text-accent">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------- Chips */

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5"
    >
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            className={`rounded-full border px-4 py-2 active:opacity-70 ${
              on ? 'border-accent bg-accent' : 'border-surface2 bg-transparent'
            }`}
          >
            <Text
              className={`font-bodyMed text-[13px] ${on ? 'text-accentInk' : 'text-inkSoft'}`}
            >
              {o}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* -------------------------------------------------------------------- Text */

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
  icon,
}: {
  label: string;
  onPress?: () => void;
  tone?: 'accent' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const C = usePalette();
  const ghost = tone === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center justify-center gap-2 rounded-full px-6 py-4 active:opacity-80 ${
        ghost ? 'border border-surface2' : 'bg-accent'
      }`}
    >
      {icon ? <Ionicons name={icon} size={17} color={ghost ? C.ink : C.accentInk} /> : null}
      <Text className={`font-bodyBold text-[15px] ${ghost ? 'text-ink' : 'text-accentInk'}`}>
        {label}
      </Text>
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

/* ------------------------------------------------------------ ThemeToggle */

/**
 * Three states, matching how the OS works. A two-way switch strands anyone who
 * wants to go back to following their phone.
 *
 * TODO(contributor): persist the choice
 * Resets on restart. Store it and apply before first paint.
 * difficulty: easy
 */
export function useThemeCycle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const next = { light: 'dark', dark: 'system', system: 'light' } as const;
  const current = (colorScheme ?? 'system') as keyof typeof next;
  const icon: keyof typeof Ionicons.glyphMap =
    current === 'light' ? 'sunny-outline' : current === 'dark' ? 'moon-outline' : 'contrast-outline';
  return { icon, cycle: () => setColorScheme(next[current]) };
}
