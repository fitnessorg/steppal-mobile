import { Pressable, Text, View } from 'react-native';

/**
 * Two-or-three way switch inside a screen. Used for Leaderboard/Chat on pot
 * detail — the same job Strava's Progress/Activities/Gallery row does.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row rounded-full bg-surface p-1">
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            className={`flex-1 items-center rounded-full py-2.5 ${on ? 'bg-surface2' : ''}`}
          >
            <Text
              className={`font-bodyBold text-[13px] ${on ? 'text-ink' : 'text-inkFaint'}`}
            >
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
