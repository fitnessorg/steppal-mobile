import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Label, Screen, SectionHeader } from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { findByCode, joinByCode } from '../../src/store/pots';
import { modeLabel, naira, type Pot } from '../../src/mock/data';

/**
 * Closes the invite loop: someone shares a code, you paste it, you see exactly
 * what you are joining before any money moves.
 */
export default function JoinPot() {
  const C = usePalette();
  const [code, setCode] = useState('');
  const [found, setFound] = useState<Pot | null>(null);

  const look = () => {
    const hit = findByCode(code);
    if (!hit) {
      return Alert.alert('No pot with that code', 'Check it with whoever sent it.');
    }
    setFound(hit);
  };

  const join = () => {
    if (!found) return;
    const pot = joinByCode(found.inviteCode);
    if (!pot) return;
    router.replace(`/pot/${pot.id}`);
  };

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
              setFound(null);
            }}
            onSubmitEditing={look}
            placeholder="RUN-2290"
            placeholderTextColor={C.inkFaint}
            autoCapitalize="characters"
            returnKeyType="search"
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
              <Text className="font-display text-xl text-ink">{found.name}</Text>
              <Body dim className="mt-1">
                {found.members[0]?.name} started it
              </Body>

              <View className="mt-5 gap-px overflow-hidden rounded-xl bg-surface2">
                {[
                  ['Stake', naira(found.stakeKobo)],
                  ['Settles as', modeLabel[found.mode]],
                  ['People in', `${found.members.length} so far`],
                  ['Runs for', `${found.totalDays} days`],
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
                  {naira(found.stakeKobo)} leaves your wallet and is held by the contract
                  until the week closes.
                </Body>
              </View>
            </Card>

            <View className="mt-6">
              <Button
                label={`Join for ${naira(found.stakeKobo)}`}
                icon="enter-outline"
                onPress={join}
              />
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
