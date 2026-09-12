import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Label, Screen, SectionHeader } from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { joinablePot, modeLabel, naira } from '../../src/mock/data';

/**
 * Closes the invite loop: someone shares a code in WhatsApp, you paste it here
 * and see what you're joining before any money moves.
 *
 * TODO(contributor): look the code up for real
 * Currently any code resolves to one mock pot. steppal-core exposes
 * GET /v1/pots/invite/:code — public and unauthenticated, so the preview works
 * before sign-in. Handle a bad code and an already-started pot.
 * difficulty: easy
 */
export default function JoinPot() {
  const C = usePalette();
  const [code, setCode] = useState('');
  const [found, setFound] = useState(false);

  const look = () => {
    if (code.trim().length < 4) {
      return Alert.alert('Check the code', 'Invite codes look like WALK-4821.');
    }
    setFound(true);
  };

  const join = () =>
    Alert.alert(
      'Demo build',
      `You would join ${joinablePot.name} and ${naira(joinablePot.stakeKobo)} would be held.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/pots') }],
    );

  return (
    <Screen>
      <View className="flex-row items-center px-5 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="font-displayBlack text-[30px] leading-9 text-ink">Join a pot</Text>
        <Body dim className="mt-2">
          Paste the code a friend sent you.
        </Body>

        <View className="mt-8 flex-row gap-3">
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              setFound(false);
            }}
            placeholder="WALK-4821"
            placeholderTextColor={C.inkFaint}
            autoCapitalize="characters"
            className="flex-1 rounded-2xl bg-surface px-5 py-4 font-displayBlack text-[18px] tracking-widest text-ink"
          />
          <Pressable
            onPress={look}
            accessibilityLabel="Find pot"
            className="h-[58px] w-[58px] items-center justify-center rounded-2xl bg-accent active:opacity-80"
          >
            <Ionicons name="search" size={20} color={C.accentInk} />
          </Pressable>
        </View>

        {found ? (
          <>
            <SectionHeader title="You're joining" />
            <Card>
              <Text className="font-display text-xl text-ink">{joinablePot.name}</Text>
              <Body dim className="mt-1">
                {joinablePot.host} started it · {joinablePot.startsIn}
              </Body>

              <View className="mt-5 gap-px overflow-hidden rounded-xl bg-surface2">
                {[
                  ['Stake', naira(joinablePot.stakeKobo)],
                  ['Settles as', modeLabel[joinablePot.mode]],
                  ['People in', `${joinablePot.members} so far`],
                  ['Runs for', '7 days'],
                ].map(([k, v]) => (
                  <View key={k} className="flex-row justify-between bg-surface px-4 py-3">
                    <Body dim>{k}</Body>
                    <Text className="font-bodyBold text-[14px] text-ink">{v}</Text>
                  </View>
                ))}
              </View>

              <View className="mt-5 flex-row items-start gap-2">
                <Ionicons name="lock-closed" size={14} color={C.money} />
                <Body dim className="flex-1">
                  {naira(joinablePot.stakeKobo)} leaves your wallet and is held by the
                  contract until the week closes.
                </Body>
              </View>
            </Card>

            <View className="mt-6">
              <Button label={`Join for ${naira(joinablePot.stakeKobo)}`} icon="enter-outline" onPress={join} />
            </View>
          </>
        ) : (
          <View className="mt-10 items-center gap-3">
            <Ionicons name="ticket-outline" size={34} color={C.inkFaint} />
            <Body dim className="text-center">
              No code? Ask a friend to share theirs from their pot.
            </Body>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
