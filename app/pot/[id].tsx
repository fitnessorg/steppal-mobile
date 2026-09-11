import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Card, Divider, H1, Label, Screen } from '../../src/components/ui';
import { modeLabel, naira, pots, steps } from '../../src/mock/data';

export default function PotDetail() {
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
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} className="pt-4 active:opacity-60">
          <Text className="font-bodyMed text-[14px] text-inkSoft">← Back</Text>
        </Pressable>

        <View className="mt-5">
          <Label tone={settled ? undefined : 'flame'}>
            {settled ? 'Settled' : `Day ${pot.dayOf} of ${pot.totalDays}`}
          </Label>
          <View className="mt-2">
            <H1>{pot.name}</H1>
          </View>
          <Body dim className="mt-2">
            {modeLabel[pot.mode]} · {naira(pot.stakeKobo)} each · {pot.members.length} people
          </Body>
        </View>

        {/* ---- the money ---- */}
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
              <Body dim className="mt-2">
                Held by the contract until the week closes. Nobody can touch it early.
              </Body>
            </>
          )}
        </Card>

        {/* ---- leaderboard ---- */}
        <View className="mt-8">
          <Label>{pot.mode === 'forfeit' ? 'Days hit, then steps' : 'Steps this week'}</Label>
          <Card className="mt-3 p-0">
            {ranked.map((m, i) => (
              <View key={m.id}>
                {i > 0 ? <Divider /> : null}
                <View
                  className={`flex-row items-center px-5 py-4 ${m.isYou ? 'bg-surface2' : ''}`}
                >
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
        </View>

        {/* ---- invite ---- */}
        {!settled ? (
          <Pressable onPress={share} className="mt-8 active:opacity-80">
            <Card>
              <Label>Invite code</Label>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-displayBlack text-2xl tracking-widest text-ink">
                  {pot.inviteCode}
                </Text>
                <Text className="font-bodyMed text-[13px] text-accent">Share →</Text>
              </View>
            </Card>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
