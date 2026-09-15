import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Body,
  Button,
  Card,
  Divider,
  Label,
  ProgressBar,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { naira, steps } from '../../src/mock/data';
import { TIP_PRESETS } from '../../src/mock/feed';
import { progressOf, tip, usePledge, youFunded } from '../../src/store/feed';

export default function PledgeDetail() {
  const C = usePalette();
  const { id, tip: openTip } = useLocalSearchParams<{ id: string; tip?: string }>();
  const pledge = usePledge(id);

  const [amount, setAmount] = useState('1000');
  const [tipping, setTipping] = useState(openTip === '1');

  if (!pledge) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="help-circle-outline" size={34} color={C.inkFaint} />
          <Body dim className="text-center">
            That pledge no longer exists.
          </Body>
          <Pressable onPress={() => router.replace('/(tabs)/feed')} className="active:opacity-70">
            <Text className="font-bodyBold text-[14px] text-accent">Back to feed</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const done = pledge.status === 'paid';
  const sponsored = pledge.kind === 'sponsored';
  const mine = youFunded(pledge);

  // TODO(contributor): call fund() on goal-escrow
  // This writes to the in-memory store. The contract's fund(id, funder, amount)
  // takes the money into escrow; the same call serves tips and sponsorships.
  // difficulty: hard
  const send = () => {
    const naira_ = Number(amount);
    if (!Number.isFinite(naira_) || naira_ < 100) {
      return Alert.alert('Too small', 'Tip at least ₦100.');
    }
    tip(pledge.id, Math.round(naira_ * 100));
    setTipping(false);
    Alert.alert(
      'Demo build',
      done
        ? `${naira(Math.round(naira_ * 100))} would go straight to ${pledge.author}.`
        : `${naira(Math.round(naira_ * 100))} would be held by the contract until ${pledge.author} hits the goal.`,
    );
  };

  const share = () =>
    Share.share({
      message: `${pledge.author} on StepPal: ${pledge.body} — ${steps(pledge.targetSteps)} steps. Back them.`,
    });

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/feed'))}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </Pressable>
        <Pressable
          onPress={share}
          accessibilityLabel="Share pledge"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="share-outline" size={21} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3">
          <View
            className={`h-12 w-12 items-center justify-center rounded-full ${
              sponsored ? 'bg-flame' : 'bg-accent'
            }`}
          >
            <Text
              className={`font-displayBlack text-lg ${sponsored ? 'text-white' : 'text-accentInk'}`}
            >
              {pledge.author.slice(0, 1)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-lg text-ink">{pledge.author}</Text>
            <Body dim className="mt-0.5">
              {sponsored ? `Goal set by ${pledge.sponsor}` : `Posted ${pledge.postedAt}`}
            </Body>
          </View>
        </View>

        <Text className="mt-5 font-body text-[17px] leading-7 text-ink">{pledge.body}</Text>

        <Card className="mt-6">
          <Label tone={done ? 'accent' : 'flame'}>
            {done ? 'Goal met' : pledge.status === 'attested' ? 'Awaiting attestation' : pledge.deadline}
          </Label>
          <Text className="mt-2 font-displayBlack text-[38px] leading-[42px] text-ink">
            {steps(pledge.currentSteps)}
          </Text>
          <Body dim>of {steps(pledge.targetSteps)} steps</Body>
          <View className="mt-4">
            <ProgressBar value={progressOf(pledge)} />
          </View>
        </Card>

        <Card className="mt-3">
          <Label>{done ? 'Paid out' : 'Held by the contract'}</Label>
          <Text
            className={`mt-2 font-displayBlack text-[34px] leading-[38px] ${
              done ? 'text-accent' : 'text-money'
            }`}
          >
            {naira(pledge.potKobo)}
          </Text>
          <View className="mt-3 flex-row items-start gap-2">
            <Ionicons
              name={done ? 'checkmark-circle' : 'lock-closed'}
              size={14}
              color={C.inkFaint}
            />
            <Body dim className="flex-1">
              {done
                ? `Released to ${pledge.author} when the goal was attested. Nobody had to be trusted.`
                : `Released only if ${pledge.author} hits the goal. Missed, and every backer takes their own money back.`}
            </Body>
          </View>
          {mine > 0 ? (
            <Body dim className="mt-3">
              You put in {naira(mine)}.
            </Body>
          ) : null}
        </Card>

        {/* ---- tip ---- */}
        {tipping ? (
          <Card className="mt-3 border border-accent">
            <Label tone="accent">{done ? 'Send a reward' : 'Back this pledge'}</Label>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {TIP_PRESETS.map((n) => {
                const on = String(n) === amount;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setAmount(String(n))}
                    className={`rounded-full border px-4 py-2 active:opacity-70 ${
                      on ? 'border-accent bg-accent' : 'border-surface2'
                    }`}
                  >
                    <Text
                      className={`font-bodyBold text-[13px] ${on ? 'text-accentInk' : 'text-inkSoft'}`}
                    >
                      ₦{n.toLocaleString('en-NG')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              className="mt-4 rounded-2xl bg-surface2 px-5 py-4 font-displayBlack text-[20px] text-ink"
            />

            <View className="mt-4 gap-2">
              <Button label={`Send ${naira(Math.round(Number(amount || 0) * 100))}`} icon="arrow-forward" onPress={send} />
              <Button label="Cancel" tone="ghost" onPress={() => setTipping(false)} />
            </View>
          </Card>
        ) : (
          <View className="mt-3">
            <Button
              label={done ? `Reward ${pledge.author}` : `Back ${pledge.author}`}
              icon="cash-outline"
              onPress={() => setTipping(true)}
            />
          </View>
        )}

        {/* ---- backers ---- */}
        <SectionHeader title={`Backers (${pledge.funders.length})`} />
        {pledge.funders.length === 0 ? (
          <Card className="items-center gap-2 py-7">
            <Ionicons name="people-outline" size={26} color={C.inkFaint} />
            <Body dim className="text-center">
              Nobody has backed this yet. Be first.
            </Body>
          </Card>
        ) : (
          <Card className="p-0">
            {pledge.funders.map((f, i) => (
              <View key={f.id}>
                {i > 0 ? <Divider /> : null}
                <View className={`flex-row items-center px-5 py-4 ${f.isYou ? 'bg-surface2' : ''}`}>
                  <Text
                    className={`flex-1 font-bodyMed text-[15px] ${f.isYou ? 'text-accent' : 'text-ink'}`}
                  >
                    {f.name}
                  </Text>
                  <Text className="font-bodyBold text-[15px] text-money">
                    {naira(f.amountKobo)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
