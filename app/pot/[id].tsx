import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Card, Divider, Label, Screen, SectionHeader } from '../../src/components/ui';
import { Segmented } from '../../src/components/segmented';
import { usePalette } from '../../src/theme';
import { sendMessage, usePot } from '../../src/store/pots';
import { modeLabel, naira, steps, type ChatMessage } from '../../src/mock/data';

const TABS = ['Leaderboard', 'Chat'] as const;
type Tab = (typeof TABS)[number];

function Bubble({ m }: { m: ChatMessage }) {
  if (m.kind === 'system') {
    return (
      <View className="my-2 items-center">
        <Text className="rounded-full bg-surface2 px-3 py-1.5 text-center font-body text-[12px] text-inkFaint">
          {m.body}
        </Text>
      </View>
    );
  }
  return (
    <View className={`mb-3 max-w-[80%] ${m.isYou ? 'self-end' : 'self-start'}`}>
      {!m.isYou ? (
        <Text className="mb-1 font-bodyMed text-[12px] text-inkFaint">{m.name}</Text>
      ) : null}
      <View className={`rounded-2xl px-4 py-3 ${m.isYou ? 'bg-accent' : 'bg-surface'}`}>
        <Text className={`font-body text-[15px] ${m.isYou ? 'text-accentInk' : 'text-ink'}`}>
          {m.body}
        </Text>
      </View>
    </View>
  );
}

export default function PotDetail() {
  const C = usePalette();
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const pot = usePot(id);

  const [tab, setTab] = useState<Tab>('Leaderboard');
  const [draft, setDraft] = useState('');

  const share = () => {
    if (!pot) return;
    Share.share({
      message: `Join my StepPal pot "${pot.name}" — code ${pot.inviteCode}. ${naira(
        pot.stakeKobo,
      )} each, ${pot.totalDays} days, most consistent wins.`,
    });
  };

  // Straight after creating, the only useful next action is inviting people.
  useEffect(() => {
    if (created === '1' && pot) {
      const t = setTimeout(share, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [created, pot?.id]);

  if (!pot) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="help-circle-outline" size={34} color={C.inkFaint} />
          <Body dim className="text-center">
            That pot no longer exists.
          </Body>
          <Pressable onPress={() => router.replace('/(tabs)/pots')} className="active:opacity-70">
            <Text className="font-bodyBold text-[14px] text-accent">Back to pots</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const settled = pot.status === 'settled';
  const alone = pot.members.length === 1;
  const ranked = [...pot.members].sort((a, b) =>
    pot.mode === 'forfeit' ? b.daysMet - a.daysMet || b.steps - a.steps : b.steps - a.steps,
  );

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/pots'))}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </Pressable>
        {settled ? (
          <Pressable
            onPress={() => router.push(`/pot/result/${pot.id}`)}
            accessibilityLabel="See result"
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          >
            <Ionicons name="trophy-outline" size={21} color={C.ink} />
          </Pressable>
        ) : (
          <Pressable
            onPress={share}
            accessibilityLabel="Share invite"
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          >
            <Ionicons name="share-outline" size={21} color={C.ink} />
          </Pressable>
        )}
      </View>

      <View className="px-5">
        <Label tone={settled ? undefined : 'flame'}>
          {settled ? 'Settled' : `Day ${pot.dayOf} of ${pot.totalDays}`}
        </Label>
        <Text className="mt-2 font-displayBlack text-[28px] leading-8 text-ink">{pot.name}</Text>
        <Body dim className="mt-1.5">
          {modeLabel[pot.mode]} · {naira(pot.stakeKobo)} each · {pot.members.length}{' '}
          {pot.members.length === 1 ? 'person' : 'people'}
        </Body>

        <View className="mt-5">
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>
      </View>

      {tab === 'Leaderboard' ? (
        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          {/* Fresh pot: the invite code is the whole job, so it goes first. */}
          {alone && !settled ? (
            <Pressable onPress={share} className="mt-5 active:opacity-80">
              <Card className="border border-accent">
                <Label tone="accent">Pot created · invite code</Label>
                <Text className="mt-2 font-displayBlack text-[32px] tracking-widest text-ink">
                  {pot.inviteCode}
                </Text>
                <Body dim className="mt-2">
                  Send this to your friends. They enter it under Pots, Join with code.
                </Body>
                <View className="mt-4 flex-row items-center gap-1.5">
                  <Ionicons name="share-outline" size={16} color={C.accent} />
                  <Text className="font-bodyBold text-[13px] text-accent">Share the code</Text>
                </View>
              </Card>
            </Pressable>
          ) : null}

          <Card className="mt-3">
            {settled ? (
              <>
                <Label tone="accent">You won</Label>
                <Text className="mt-2 font-displayBlack text-[40px] leading-[44px] text-accent">
                  +{naira(pot.payoutKobo ?? 0)}
                </Text>
                <Pressable
                  onPress={() => router.push(`/pot/result/${pot.id}`)}
                  className="mt-3 flex-row items-center gap-1.5 active:opacity-70"
                >
                  <Text className="font-bodyBold text-[13px] text-accent">See the payout</Text>
                  <Ionicons name="chevron-forward" size={14} color={C.accent} />
                </Pressable>
              </>
            ) : (
              <>
                <Label>In the pot</Label>
                <Text className="mt-2 font-displayBlack text-[40px] leading-[44px] text-money">
                  {naira(pot.potKobo)}
                </Text>
                <View className="mt-3 flex-row items-center gap-2">
                  <Ionicons name="lock-closed" size={13} color={C.inkFaint} />
                  <Body dim>
                    {alone ? 'Grows as people join' : 'Held by the contract until the week closes'}
                  </Body>
                </View>
              </>
            )}
          </Card>

          <SectionHeader
            title={pot.mode === 'forfeit' ? 'Days hit, then steps' : 'Steps this week'}
          />
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

          {!settled && !alone ? (
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
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            contentContainerClassName="px-5 pt-5 pb-4"
            showsVerticalScrollIndicator={false}
          >
            {pot.chat.length === 0 ? (
              <View className="mt-10 items-center gap-3">
                <Ionicons name="chatbubbles-outline" size={30} color={C.inkFaint} />
                <Body dim className="text-center">
                  Nothing said yet. Start the trash talk.
                </Body>
              </View>
            ) : (
              pot.chat.map((m) => <Bubble key={m.id} m={m} />)
            )}
          </ScrollView>

          <View className="flex-row items-center gap-2 border-t border-surface2 px-5 py-3">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => {
                sendMessage(pot.id, draft);
                setDraft('');
              }}
              placeholder="Say something"
              placeholderTextColor={C.inkFaint}
              returnKeyType="send"
              className="flex-1 rounded-full bg-surface px-5 py-3 font-body text-[15px] text-ink"
            />
            <Pressable
              onPress={() => {
                sendMessage(pot.id, draft);
                setDraft('');
              }}
              accessibilityLabel="Send"
              className="h-11 w-11 items-center justify-center rounded-full bg-accent active:opacity-80"
            >
              <Ionicons name="arrow-up" size={20} color={C.accentInk} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}
