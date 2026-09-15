import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Card, ProgressBar } from './ui';
import { usePalette } from '../theme';
import { naira, steps } from '../mock/data';
import { cheer, progressOf } from '../store/feed';
import type { Pledge } from '../mock/feed';

/**
 * One post in the feed. Reads as a social card first and a money object
 * second — the pledge is the content, the pot is a detail on it.
 */
export function PledgeCard({ pledge }: { pledge: Pledge }) {
  const C = usePalette();
  const done = pledge.status === 'paid';
  const attested = pledge.status === 'attested';
  const sponsored = pledge.kind === 'sponsored';

  return (
    <Pressable
      onPress={() => router.push(`/pledge/${pledge.id}`)}
      className="mb-3 active:opacity-80"
    >
      <Card>
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              sponsored ? 'bg-flame' : 'bg-accent'
            }`}
          >
            <Text
              className={`font-displayBlack text-[15px] ${
                sponsored ? 'text-white' : 'text-accentInk'
              }`}
            >
              {pledge.author.slice(0, 1)}
            </Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-bodyBold text-[15px] text-ink">{pledge.author}</Text>
              <Text className="font-body text-[12px] text-inkFaint">{pledge.postedAt}</Text>
            </View>
            {sponsored ? (
              <Text className="mt-0.5 font-bodyMed text-[11px] uppercase tracking-[1.5px] text-flame">
                Goal set by {pledge.sponsor}
              </Text>
            ) : null}
          </View>

          {done ? (
            <Ionicons name="checkmark-circle" size={20} color={C.accent} />
          ) : attested ? (
            <Ionicons name="hourglass-outline" size={18} color={C.money} />
          ) : null}
        </View>

        <Body className="mt-3">{pledge.body}</Body>

        <View className="mt-4">
          <ProgressBar value={progressOf(pledge)} />
          <View className="mt-2 flex-row justify-between">
            <Body dim>
              {steps(pledge.currentSteps)} / {steps(pledge.targetSteps)}
            </Body>
            <Body dim>{pledge.deadline}</Body>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between border-t border-surface2 pt-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name={done ? 'gift' : 'lock-closed'}
              size={14}
              color={done ? C.accent : C.money}
            />
            <Text className={`font-bodyBold text-[14px] ${done ? 'text-accent' : 'text-money'}`}>
              {pledge.potKobo > 0 ? naira(pledge.potKobo) : 'No tips yet'}
            </Text>
          </View>

          <View className="flex-row items-center gap-5">
            <Pressable
              onPress={() => cheer(pledge.id)}
              accessibilityLabel="Cheer"
              className="flex-row items-center gap-1.5 active:opacity-60"
            >
              <Ionicons name="flame-outline" size={17} color={C.inkFaint} />
              <Text className="font-bodyMed text-[13px] text-inkFaint">{pledge.cheers}</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push(`/pledge/${pledge.id}?tip=1`)}
              className="flex-row items-center gap-1.5 active:opacity-70"
            >
              <Ionicons name="cash-outline" size={17} color={C.accent} />
              <Text className="font-bodyBold text-[13px] text-accent">
                {done ? 'Reward' : 'Tip'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
