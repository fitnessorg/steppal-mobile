import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, H1, Label, Screen } from '../../src/components/ui';
import { modeLabel, naira, pots } from '../../src/mock/data';

export default function Pots() {
  const active = pots.filter((p) => p.status === 'active');
  const past = pots.filter((p) => p.status === 'settled');

  return (
    <Screen>
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="pt-6">
          <H1>Pots</H1>
        </View>

        <View className="mt-6">
          <Button label="Start a pot" onPress={() => router.push('/pot/create')} />
        </View>

        <View className="mt-8 gap-3">
          <Label tone="accent">Running</Label>
          {active.map((p) => (
            <Pressable key={p.id} onPress={() => router.push(`/pot/${p.id}`)} className="active:opacity-80">
              <Card>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="font-display text-lg text-ink">{p.name}</Text>
                    <Body dim className="mt-1">
                      {modeLabel[p.mode]} · {p.members.length} people
                    </Body>
                  </View>
                  <View className="items-end">
                    <Text className="font-bodyBold text-[15px] text-money">{naira(p.potKobo)}</Text>
                    <Body dim className="mt-1">
                      Day {p.dayOf}/{p.totalDays}
                    </Body>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <View className="mt-8 gap-3">
          <Label>Finished</Label>
          {past.map((p) => (
            <Pressable key={p.id} onPress={() => router.push(`/pot/${p.id}`)} className="active:opacity-80">
              <Card>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="font-display text-lg text-ink">{p.name}</Text>
                    <Body dim className="mt-1">
                      {modeLabel[p.mode]} · settled
                    </Body>
                  </View>
                  <View className="items-end">
                    <Text className="font-bodyBold text-[15px] text-accent">
                      +{naira(p.payoutKobo ?? 0)}
                    </Text>
                    <Body dim className="mt-1">
                      You won
                    </Body>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
