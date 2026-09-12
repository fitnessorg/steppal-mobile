import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Divider, Label, Screen, SectionHeader } from '../../../src/components/ui';
import { usePalette } from '../../../src/theme';
import { naira, pots, steps } from '../../../src/mock/data';

/**
 * The money moment. Shown when a pot settles.
 *
 * The payout counts up rather than appearing — a number that climbs reads as
 * something being paid, which is the whole feeling this screen exists for.
 */
export default function PotResult() {
  const C = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pot = pots.find((p) => p.id === id) ?? pots[1];
  const payout = pot.payoutKobo ?? 0;

  const count = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0.9)).current;
  const amount = useRef<Text>(null);

  useEffect(() => {
    count.addListener(({ value }) => {
      amount.current?.setNativeProps({ text: naira(Math.round(value)) });
    });

    Animated.sequence([
      Animated.spring(pop, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(count, {
        toValue: payout,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    return () => count.removeAllListeners();
  }, [count, pop, payout]);

  const ranked = [...pot.members].sort((a, b) => b.steps - a.steps);

  return (
    <Screen>
      <View className="flex-row items-center justify-end px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.replace('/(tabs)/pots')}
          accessibilityLabel="Close"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="close" size={24} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="items-center pt-6">
          <Animated.View style={{ transform: [{ scale: pop }] }}>
            <View className="h-20 w-20 items-center justify-center rounded-full bg-accent">
              <Ionicons name="trophy" size={38} color={C.accentInk} />
            </View>
          </Animated.View>

          <Label tone="accent">Week closed</Label>
          <Text className="mt-3 font-display text-xl text-ink">{pot.name}</Text>

          <Text
            ref={amount}
            className="mt-4 font-displayBlack text-[54px] leading-[58px] text-accent"
          >
            {naira(0)}
          </Text>
          <Body dim className="mt-1">
            paid to your wallet
          </Body>
        </View>

        <Card className="mt-8">
          <View className="flex-row items-start gap-3">
            <Ionicons name="shield-checkmark" size={20} color={C.accent} />
            <View className="flex-1">
              <Text className="font-bodyBold text-[15px] text-ink">Settled by the contract</Text>
              <Body dim className="mt-1">
                Results were posted, the 24-hour dispute window closed with no flags, and
                the pot paid out on its own. Nobody had to be trusted.
              </Body>
            </View>
          </View>
        </Card>

        <SectionHeader title="Final standings" />
        <Card className="p-0">
          {ranked.map((m, i) => (
            <View key={m.id}>
              {i > 0 ? <Divider /> : null}
              <View className={`flex-row items-center px-5 py-4 ${m.isYou ? 'bg-surface2' : ''}`}>
                <Text className="w-7 font-bodyBold text-[14px] text-inkFaint">{i + 1}</Text>
                <Text
                  className={`flex-1 font-bodyMed text-[15px] ${m.isYou ? 'text-accent' : 'text-ink'}`}
                >
                  {m.name}
                </Text>
                <Text className="font-bodyBold text-[15px] text-ink">{steps(m.steps)}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/*
          TODO(contributor): rematch creates the next pot
          Most groups never recreate a pot by hand, but almost all will tap
          "Run it back". Prefill create with the same members, stake and mode.
          difficulty: easy
        */}
        <View className="mt-8 gap-3">
          <Button
            label="Run it back"
            icon="refresh"
            onPress={() => router.push('/pot/create')}
          />
          <Button
            label="Back to pots"
            tone="ghost"
            onPress={() => router.replace('/(tabs)/pots')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
