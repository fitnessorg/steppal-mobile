import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Label, Screen, SectionHeader } from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { naira } from '../../src/mock/data';
import { createPledge } from '../../src/store/feed';

const FRIENDS = ['Tunde', 'Ada', 'Chidi', 'Kemi', 'Ife'];
const TARGETS = [50_000, 70_000, 100_000];
const AMOUNTS = [2_000, 5_000, 10_000];

/**
 * Set a goal for a friend and fund it. The money leaves your wallet now and
 * reaches theirs only if they hit the number.
 */
export default function SponsorFriend() {
  const C = usePalette();
  const [friend, setFriend] = useState('');
  const [target, setTarget] = useState(70_000);
  const [amount, setAmount] = useState('5000');
  const [days, setDays] = useState('7');

  // TODO(contributor): call create_goal then fund on goal-escrow
  // Beneficiary is the friend, funder is you. The contract needs no permission
  // from the friend, because giving someone money should not require it.
  // difficulty: hard
  const send = () => {
    if (!friend) return Alert.alert('Pick someone', 'Choose who is walking.');

    const naira_ = Number(amount);
    if (!Number.isFinite(naira_) || naira_ < 100) {
      return Alert.alert('Too small', 'Put at least ₦100 behind it.');
    }
    const d = Number(days);
    if (!Number.isFinite(d) || d < 1 || d > 30) {
      return Alert.alert('Pick 1 to 30 days', '');
    }

    const pledge = createPledge({
      kind: 'sponsored',
      author: friend,
      body: `You set ${friend} a goal: ${target.toLocaleString('en-NG')} steps. Hit it and the money is theirs.`,
      targetSteps: target,
      days: d,
      seedKobo: Math.round(naira_ * 100),
    });

    Alert.alert(
      'Demo build',
      `${naira(Math.round(naira_ * 100))} would be locked in escrow for ${friend}.`,
      [{ text: 'OK', onPress: () => router.replace(`/pledge/${pledge.id}`) }],
    );
  };

  return (
    <Screen>
      <View className="flex-row items-center px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Cancel"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="close" size={24} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="font-displayBlack text-[30px] leading-9 text-ink">Sponsor a friend</Text>
        <Body dim className="mt-2">
          Set someone a step goal and put money behind it. The money leaves your wallet now and
          reaches theirs only if they hit the number.
        </Body>

        <SectionHeader title="Who is walking" />
        <View className="flex-row flex-wrap gap-2">
          {FRIENDS.map((f) => {
            const on = f === friend;
            return (
              <Pressable
                key={f}
                onPress={() => setFriend(f)}
                className={`flex-row items-center gap-2 rounded-full border px-3 py-2 active:opacity-70 ${
                  on ? 'border-flame bg-flame' : 'border-surface2'
                }`}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full ${
                    on ? 'bg-white/25' : 'bg-surface2'
                  }`}
                >
                  <Text
                    className={`font-displayBlack text-[11px] ${on ? 'text-white' : 'text-inkSoft'}`}
                  >
                    {f.slice(0, 1)}
                  </Text>
                </View>
                <Text
                  className={`font-bodyBold text-[13px] ${on ? 'text-white' : 'text-inkSoft'}`}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Their target" />
        <View className="flex-row flex-wrap gap-2">
          {TARGETS.map((t) => {
            const on = t === target;
            return (
              <Pressable
                key={t}
                onPress={() => setTarget(t)}
                className={`rounded-full border px-4 py-2.5 active:opacity-70 ${
                  on ? 'border-accent bg-accent' : 'border-surface2'
                }`}
              >
                <Text
                  className={`font-bodyBold text-[13px] ${on ? 'text-accentInk' : 'text-inkSoft'}`}
                >
                  {t.toLocaleString('en-NG')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="What it is worth" />
        <View className="flex-row flex-wrap gap-2">
          {AMOUNTS.map((a) => {
            const on = String(a) === amount;
            return (
              <Pressable
                key={a}
                onPress={() => setAmount(String(a))}
                className={`rounded-full border px-4 py-2.5 active:opacity-70 ${
                  on ? 'border-money bg-money' : 'border-surface2'
                }`}
              >
                <Text
                  className={`font-bodyBold text-[13px] ${on ? 'text-white' : 'text-inkSoft'}`}
                >
                  ₦{a.toLocaleString('en-NG')}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          className="mt-3 rounded-2xl bg-surface px-5 py-4 font-displayBlack text-[20px] text-ink"
        />

        <SectionHeader title="Days to do it" />
        <TextInput
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
          className="rounded-2xl bg-surface px-5 py-4 font-body text-[16px] text-ink"
        />

        <Card className="mt-6">
          <Label>What happens to the money</Label>
          <View className="mt-3 gap-3">
            {[
              ['lock-closed', `${naira(Math.round(Number(amount || 0) * 100))} is locked in escrow now`],
              ['walk', `${friend || 'They'} walk. Steps come from their phone.`],
              ['checkmark-circle', 'Goal hit: the money is released to them'],
              ['arrow-undo', 'Goal missed: you take it back in full'],
            ].map(([icon, text]) => (
              <View key={text} className="flex-row items-start gap-3">
                <Ionicons name={icon as never} size={16} color={C.inkSoft} />
                <Body dim className="flex-1">
                  {text}
                </Body>
              </View>
            ))}
          </View>
        </Card>

        <View className="mt-6">
          <Button label="Lock it in" icon="gift-outline" onPress={send} />
        </View>
      </ScrollView>
    </Screen>
  );
}
