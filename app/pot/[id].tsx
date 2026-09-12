import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Card, Divider, Label, Screen, SectionHeader } from '../../src/components/ui';
import { Segmented } from '../../src/components/segmented';
import { usePalette } from '../../src/theme';
import { modeLabel, naira, pots, steps, type ChatMessage } from '../../src/mock/data';

const TABS = ['Leaderboard', 'Chat'] as const;
type Tab = (typeof TABS)[number];

function Bubble({ m }: { m: ChatMessage }) {
  if (m.kind === 'system') {
    return (
      <View className="my-2 items-center">
        <Text className="rounded-full bg-surface2 px-3 py-1.5 font-body text-[12px] text-inkFaint">
          {m.body}
        </Text>
      </View>
    );
  }
  return (
    <View className={`mb-3 max-w-[80%] ${m.isYou ? 'self-end' : 'self-start'}`}>
      {!m.isYou ? <Text className="mb-1 font-bodyMed text-[12px] text-inkFaint">{m.name}</Text> : null}
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const pot = pots.find((p) => p.id === id) ?? pots[0];
  const settled = pot.status === 'settled';

  const [tab, setTab] = useState<Tab>('Leaderboard');
  const [draft, setDraft] = useState('');
  const [chat, setChat] = useState(pot.chat);

  const ranked = [...pot.members].sort((a, b) =>
    pot.mode === 'forfeit' ? b.daysMet - a.daysMet || b.steps - a.steps : b.steps - a.steps,
  );

  const share = () =>
    Share.share({
      message: `Join my StepPal pot "${pot.name}" — code ${pot.inviteCode}. ${naira(
        pot.stakeKobo,
      )} each, 7 days, most consistent wins.`,
    });

  // TODO(contributor): real group chat
  // Messages are local state and vanish on reload. steppal-core needs a
  // messages table plus a Supabase-style realtime subscription; system messages
  // (goal met, forfeit, settlement) should be emitted by the server, not typed.
  // difficulty: hard
  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setChat([
      ...chat,
      { id: `local-${Date.now()}`, name: 'You', body, time: 'now', kind: 'text', isYou: true },
    ]);
    setDraft('');
  };

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
        <View className="flex-row">
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
      </View>

      <View className="px-5">
        <Label tone={settled ? undefined : 'flame'}>
          {settled ? 'Settled' : `Day ${pot.dayOf} of ${pot.totalDays}`}
        </Label>
        <Text className="mt-2 font-displayBlack text-[28px] leading-8 text-ink">{pot.name}</Text>
        <Body dim className="mt-1.5">
          {modeLabel[pot.mode]} · {naira(pot.stakeKobo)} each · {pot.members.length} people
        </Body>

        <View className="mt-5">
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>
      </View>

      {tab === 'Leaderboard' ? (
        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          <Card className="mt-5">
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
                  <Body dim>Held by the contract until the week closes</Body>
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
            {chat.map((m) => (
              <Bubble key={m.id} m={m} />
            ))}
          </ScrollView>

          <View className="flex-row items-center gap-2 border-t border-surface2 px-5 py-3">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder="Say something"
              placeholderTextColor={C.inkFaint}
              returnKeyType="send"
              className="flex-1 rounded-full bg-surface px-5 py-3 font-body text-[15px] text-ink"
            />
            <Pressable
              onPress={send}
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
