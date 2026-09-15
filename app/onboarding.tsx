import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, Label, Screen } from '../src/components/ui';
import { usePalette } from '../src/theme';
import { markOnboardingSeen } from '../src/session';
import { getStepSource } from '../src/health';

const GOALS = [6_000, 8_000, 10_000, 12_000, 15_000];

/**
 * First run: what the app is, where steps come from, what your goal is.
 *
 * Three steps, no account. The health permission step is the one that matters —
 * people need to know the number is read for them, not logged by them.
 *
 * TODO(contributor): request the real Health Connect permission
 * Step 2 fakes the grant. Wire react-native-health-connect: check
 * availability, request read permission for Steps, handle denial and the
 * "Health Connect not installed" case with a Play Store link.
 * difficulty: hard
 */
export default function Onboarding() {
  const C = usePalette();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(10_000);
  const [granted, setGranted] = useState(false);

  /**
   * Nothing here may throw into the void. A step source can fail for reasons
   * that are not the user's problem — no native module in this build, Health
   * Connect not installed, permission dialog dismissed — and every one of them
   * should end as a readable sentence, never an unhandled rejection.
   */
  const link = async () => {
    const source = getStepSource();

    if (source.name === 'mock') {
      setGranted(true);
      return Alert.alert(
        'Using sample data',
        'This build reads steps from a sample set. Install the dev build to read your real ones.',
      );
    }

    try {
      const status = await source.status();
      if (status === 'not_installed') {
        return Alert.alert(
          'Health Connect needed',
          'Install Health Connect from the Play Store, then come back.',
        );
      }
      if (status === 'unsupported') {
        setGranted(true);
        return Alert.alert(
          'Not on this device',
          'This phone has no Health Connect. StepPal will count steps live while the app is open.',
        );
      }
      setGranted(await source.requestPermission());
    } catch {
      setGranted(true);
      Alert.alert(
        'Could not reach your step data',
        'StepPal will count steps live while the app is open. You can connect health data later from You.',
      );
    }
  };

  const done = () => {
    markOnboardingSeen();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <View className="flex-row gap-1.5">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className={`h-1 w-8 rounded-full ${i <= step ? 'bg-accent' : 'bg-surface2'}`}
            />
          ))}
        </View>
        <Pressable onPress={done} className="active:opacity-60">
          <Text className="font-bodyMed text-[13px] text-inkFaint">Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        {step === 0 ? (
          <View className="pt-8">
            <Label tone="flame">How StepPal works</Label>
            <Text className="mt-3 font-displayBlack text-[34px] leading-10 text-ink">
              Put money on your step goal.
            </Text>
            <Body dim className="mt-4">
              Form a pot with friends. Everyone stakes the same amount. At the end of the
              week it settles itself — no treasurer, no chasing anyone.
            </Body>

            <View className="mt-8 gap-3">
              {[
                ['people-outline', 'Everyone stakes', 'Same amount in, held by the contract'],
                ['footsteps-outline', 'You walk', 'Steps read from your phone, nothing to log'],
                ['cash-outline', 'It settles', 'Pot pays out automatically on day seven'],
              ].map(([icon, title, sub]) => (
                <Card key={title} className="flex-row items-center gap-4">
                  <Ionicons name={icon as never} size={22} color={C.accent} />
                  <View className="flex-1">
                    <Text className="font-bodyBold text-[15px] text-ink">{title}</Text>
                    <Body dim className="mt-0.5">
                      {sub}
                    </Body>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View className="pt-8">
            <Label tone="flame">Step 2 of 3</Label>
            <Text className="mt-3 font-displayBlack text-[34px] leading-10 text-ink">
              Your steps come from your phone.
            </Text>
            <Body dim className="mt-4">
              StepPal reads your daily step count from Health Connect. Nothing to log by
              hand, and nothing to remember. We only ever read steps — never location,
              never anything else.
            </Body>

            <Pressable onPress={link} className="mt-8 active:opacity-80">
              <Card
                className={`flex-row items-center gap-4 ${granted ? 'border border-accent' : ''}`}
              >
                <Ionicons
                  name={granted ? 'checkmark-circle' : 'heart-circle-outline'}
                  size={26}
                  color={granted ? C.accent : C.inkSoft}
                />
                <View className="flex-1">
                  <Text className="font-bodyBold text-[15px] text-ink">
                    {granted ? 'Health Connect linked' : 'Link Health Connect'}
                  </Text>
                  <Body dim className="mt-0.5">
                    {granted ? 'Reading your step count' : 'Tap to allow step access'}
                  </Body>
                </View>
              </Card>
            </Pressable>

            <Body dim className="mt-4">
              Demo build uses sample data. With a dev build containing
              react-native-health-connect, this asks for real permission.
            </Body>
          </View>
        ) : null}

        {step === 2 ? (
          <View className="pt-8">
            <Label tone="flame">Step 3 of 3</Label>
            <Text className="mt-3 font-displayBlack text-[34px] leading-10 text-ink">
              Pick a daily goal.
            </Text>
            <Body dim className="mt-4">
              Hit it every day and you keep your stake. Miss a day and a slice goes to
              the pot. Pick something you can actually do on a bad day.
            </Body>

            <View className="mt-8 gap-3">
              {GOALS.map((g) => {
                const on = g === goal;
                return (
                  <Pressable key={g} onPress={() => setGoal(g)} className="active:opacity-80">
                    <Card
                      className={`flex-row items-center justify-between ${on ? 'border border-accent' : 'border border-transparent'}`}
                    >
                      <Text
                        className={`font-displayBlack text-xl ${on ? 'text-accent' : 'text-ink'}`}
                      >
                        {g.toLocaleString('en-NG')}
                      </Text>
                      <Ionicons
                        name={on ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={on ? C.accent : C.inkFaint}
                      />
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="mt-10">
          <Button
            label={step === 2 ? 'Start walking' : 'Continue'}
            icon={step === 2 ? 'checkmark' : 'arrow-forward'}
            onPress={() => (step === 2 ? done() : setStep(step + 1))}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
