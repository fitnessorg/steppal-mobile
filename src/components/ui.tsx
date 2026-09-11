import { Pressable, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ------------------------------------------------------------------ Screen */

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ground">
      {children}
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------- Text */

export function H1({ children }: { children: React.ReactNode }) {
  return <Text className="font-displayBlack text-3xl leading-tight text-ink">{children}</Text>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <Text className="font-display text-xl leading-tight text-ink">{children}</Text>;
}

export function Label({ children, tone }: { children: React.ReactNode; tone?: 'accent' | 'flame' }) {
  const color = tone === 'accent' ? 'text-accent' : tone === 'flame' ? 'text-flame' : 'text-inkFaint';
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
    <Text className={`font-body text-[15px] leading-6 ${dim ? 'text-inkSoft' : 'text-ink'} ${className}`}>
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
    tone === 'accent' ? 'bg-accent' : tone === 'flame' ? 'bg-flame' : 'bg-transparent border border-surface2';
  const fg = tone === 'ghost' ? 'text-ink' : tone === 'flame' ? 'text-ink' : 'text-accentInk';

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

/**
 * Seven squares, one per day. Filled = goal met. This is the single clearest
 * picture of how the week is going, so it appears on Home and on pot detail.
 */
export function DayGrid({ days }: { days: { day: string; goalMet: boolean }[] }) {
  return (
    <View className="flex-row justify-between">
      {days.map((d, i) => (
        <View key={i} className="items-center gap-2">
          <View
            className={`h-9 w-9 rounded-lg ${d.goalMet ? 'bg-accent' : 'bg-surface2'}`}
          />
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
