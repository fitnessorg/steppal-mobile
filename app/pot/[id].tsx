import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Card, Divider, Label, Screen, SectionHeader } from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { modeLabel, naira, pots, steps } from '../../src/mock/data';

export default function PotDetail() {
  const C = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pot = pots.find((p) => p.id === id) ?? pots[0];
  const settled = pot.status === 'settled';
  const ranked = [...pot.members].sort((a, b) =>
    pot.mode === 'forfeit' ? b.daysMet - a.daysMet || b.steps - a.steps : b.steps - a.steps,
  );

  const share = () =>
    Share.share({
      message: `Join my StepPal pot "${pot.name}" — code ${pot.inviteCode}. ${naira(
        pot.stakeKobo,
      )} each, 7 days, most consistent wins.`,
    });

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </Pressable>
        {!settled ? (
          <Pressable
            onPress={share}
            accessibilityLabel="Share invite"
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          >
            <Ionicons name="share-outline" size={21} color={C.ink} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Label tone={settled ? undefined : 'flame'}>
          {settled ? 'Settled' : `Day ${pot.dayOf} of ${pot.totalDays}`}
        </Label>
        <Text className="mt-2 font-displayBlack text-[30px] leading-9 text-ink">{pot.name}</Text>
        <Body dim className="mt-2">
          {modeLabel[pot.mode]} · {naira(pot.stakeKobo)} each · {pot.members.length} people
        </Body>

        <Card className="mt-6">
          {settled ? (
            <>
              <Label tone="accent">You won</Label>
              <Text className="mt-2 font-displayBlack text-[40px] leading-[44px] text-accent">
                +{naira(pot.payoutKobo ?? 0)}
              </Text>
              <Body dim className="mt-2">
                Paid to your wallet automatically. Dispute window closed with no flags.
              </Body>
            </>
          ) : (
            <>
              <Label>In the pot</Label>
              <Text className="mt-2 font-displayBlack text-[40px] leading-[44px] text-money">
                {naira(pot.potKobo)}
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <Ionicons name="lock-closed" size={13} color={C.inkFaint} />
                <Body dim>Held by the contract until the week closes</Body>
              </View>
            </>
          )}
        </Card>

        <SectionHeader title={pot.mode === 'forfeit' ? 'Days hit, then steps' : 'Steps this week'} />
        <Card className="p-0">
          {ranked.map((m, i) => (
            <View key={m.id}>
              {i > 0 ? <Divider /> : null}
              <View className={`flex-row items-center px-5 py-4 ${m.isYou ? 'bg-surface2' : ''}`}>
                <Text className="w-7 font-bodyBold text-[14px] text-inkFaint">{i + 1}</Text>
                <View className="flex-1">
                  <Text
                    className={`font-bodyMed text-[15px] ${m.isYou ? 'text-accent' : 'text-ink'}`}
                  >
                    {m.name}
                  </Text>
                  <Body dim className="mt-0.5">
                    {m.daysMet} of {pot.totalDays} days hit
                  </Body>
                </View>
                <Text className="font-bodyBold text-[15px] text-ink">{steps(m.steps)}</Text>
              </View>
            </View>
          ))}
        </Card>

        {!settled ? (
          <>
            <SectionHeader title="Bring someone in" />
            <Pressable onPress={share} className="active:opacity-80">
              <Card className="flex-row items-center justify-between">
                <View>
                  <Label>Invite code</Label>
                  <Text className="mt-1.5 font-displayBlack text-2xl tracking-widest text-ink">
                    {pot.inviteCode}
                  </Text>
                </View>
                <Ionicons name="share-outline" size={22} color={C.accent} />
              </Card>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
