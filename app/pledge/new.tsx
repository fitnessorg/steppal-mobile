import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Screen, SectionHeader } from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { user } from '../../src/mock/data';
import { createPledge } from '../../src/store/feed';

const TARGETS = [50_000, 70_000, 100_000, 140_000];

export default function NewPledge() {
  const C = usePalette();
  const [body, setBody] = useState('');
  const [target, setTarget] = useState(70_000);
  const [days, setDays] = useState('7');

  // TODO(contributor): call create_goal on goal-escrow
  // A pledge is a Goal with the poster as beneficiary and no initial funding.
  // Tips arrive later through fund().
  // difficulty: hard
  const post = () => {
    if (body.trim().length < 10) {
      return Alert.alert('Say a bit more', 'People back a promise, not a number.');
    }
    const d = Number(days);
    if (!Number.isFinite(d) || d < 1 || d > 30) {
      return Alert.alert('Pick 1 to 30 days', 'Long pledges lose attention.');
    }

    const pledge = createPledge({
      kind: 'pledge',
      author: user.name,
      body,
      targetSteps: target,
      days: d,
    });
    router.replace(`/pledge/${pledge.id}`);
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
        <Text className="font-displayBlack text-[30px] leading-9 text-ink">Post a pledge</Text>
        <Body dim className="mt-2">
          Say what you will do. People who want you to do it can put money behind it. Hit the
          goal and it is yours.
        </Body>

        <SectionHeader title="The promise" />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="100,000 steps this week or I never speak on fitness again."
          placeholderTextColor={C.inkFaint}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="min-h-[120px] rounded-2xl bg-surface px-5 py-4 font-body text-[16px] leading-6 text-ink"
        />

        <SectionHeader title="Step target" />
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

        <SectionHeader title="Days to do it" />
        <TextInput
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
          className="rounded-2xl bg-surface px-5 py-4 font-body text-[16px] text-ink"
        />

        <Card className="mt-6">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle-outline" size={18} color={C.inkSoft} />
            <Body dim className="flex-1">
              Tips are held by the contract, not by StepPal. Miss the goal and every backer
              takes their own money back — nobody loses anything but you.
            </Body>
          </View>
        </Card>

        <View className="mt-6">
          <Button label="Post it" icon="megaphone-outline" onPress={post} />
        </View>
      </ScrollView>
    </Screen>
  );
}
