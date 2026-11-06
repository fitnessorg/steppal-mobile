import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  Body,
  Button,
  Card,
  Divider,
  Label,
  Logo,
  Screen,
  SectionHeader,
  useThemeCycle,
} from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { stats, steps, user } from '../../src/mock/data';
import { isLive } from '../../src/api/client';
import { signOut, useSession } from '../../src/session';
import {
  getStepSource,
  sourceLabel,
  openHealthConnectPlayStore,
  openHealthConnectSettingsSafe,
  type HealthStatus,
} from '../../src/health';

const STATS: [string, string][] = [
  ['Pots played', String(stats.potsPlayed)],
  ['Pots won', String(stats.potsWon)],
  ['Steps all time', steps(stats.totalSteps)],
  ['Best day', steps(stats.bestDay)],
];

export default function Profile() {
  const session = useSession();
  const C = usePalette();
  const theme = useThemeCycle();
  const source = getStepSource();

  const [healthStatus, setHealthStatus] = useState<HealthStatus | 'loading'>('loading');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const refreshHealth = useCallback(async () => {
    try {
      const s = await source.status();
      setHealthStatus(s);
      if (source.checkPermission) {
        const ok = await source.checkPermission();
        setHasPermission(ok);
      } else {
        setHasPermission(true);
      }
    } catch {
      setHealthStatus('unknown');
    }
  }, [source]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void refreshHealth();
    });
    return () => {
      active = false;
    };
  }, [refreshHealth]);

  const requestPermission = async () => {
    try {
      const ok = await source.requestPermission();
      setHasPermission(ok);
      if (ok) {
        Alert.alert('Permission granted', 'StepPal can now read your steps in the background.');
      } else {
        Alert.alert(
          'Permission denied',
          'Read access to steps was not granted. You can grant access from Health Connect settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open settings',
              onPress: () => {
                void openHealthConnectSettingsSafe();
              },
            },
          ],
        );
      }
    } catch {
      Alert.alert('Unable to request permission', 'Please check your Health Connect settings.');
    }
  };

  return (
    <Screen>
      <AppHeader
        title="You"
        actions={[
          { icon: theme.icon, label: 'Change theme', onPress: theme.cycle },
          { icon: 'settings-outline', label: 'Settings', onPress: () => {} },
        ]}
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        {/* ---- identity block, Strava-style: avatar, name, meta, actions ---- */}
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Text className="font-displayBlack text-2xl text-accentInk">
              {user.name.slice(0, 1)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-display text-xl text-ink">{user.name}</Text>
            <Body dim className="mt-0.5">
              {stats.potsPlayed} pots · joined {user.joined}
            </Body>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <Button label="Edit profile" tone="ghost" onPress={() => {}} />
          </View>
          <View className="flex-1">
            <Button label="Invite friends" tone="ghost" icon="share-outline" onPress={() => {}} />
          </View>
        </View>

        <SectionHeader title="Your numbers" />
        <Card className="p-0">
          {STATS.map(([k, v], i) => (
            <View key={k}>
              {i > 0 ? <Divider /> : null}
              <View className="flex-row items-center justify-between px-5 py-4">
                <Body dim>{k}</Body>
                <Text className="font-bodyBold text-[15px] text-ink">{v}</Text>
              </View>
            </View>
          ))}
        </Card>

        <SectionHeader title="Steps come from" />
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={source.name === 'health_connect' ? 'heart-circle-outline' : 'footsteps-outline'}
                size={22}
                color={C.accent}
              />
              <Text className="font-bodyMed text-[15px] text-ink">{sourceLabel()}</Text>
            </View>
            {source.name === 'health_connect' ? (
              <Label
                tone={
                  hasPermission
                    ? 'accent'
                    : healthStatus === 'not_installed' || hasPermission === false
                      ? 'flame'
                      : undefined
                }
              >
                {hasPermission
                  ? 'Connected'
                  : healthStatus === 'not_installed'
                    ? 'Not installed'
                    : hasPermission === false
                      ? 'Permission needed'
                      : 'Checking...'}
              </Label>
            ) : null}
          </View>

          {source.name === 'mock' ? (
            <Body dim className="mt-2">
              Demo build — steps are sample data. Install the development build on an Android phone to
              read real step history.
            </Body>
          ) : source.name === 'pedometer' ? (
            <Body dim className="mt-2">
              Using hardware pedometer. Counting steps live while StepPal is running.
            </Body>
          ) : (
            <View className="mt-2">
              {healthStatus === 'not_installed' ? (
                <>
                  <Body dim>
                    Health Connect is not installed on this device. Install it from Google Play to
                    enable background step tracking.
                  </Body>
                  <View className="mt-4">
                    <Button
                      label="Install from Google Play"
                      tone="accent"
                      icon="download-outline"
                      onPress={() => void openHealthConnectPlayStore()}
                    />
                  </View>
                </>
              ) : hasPermission === false ? (
                <>
                  <Body dim>
                    StepPal needs read permission for Steps to score pots. Permission was declined.
                  </Body>
                  <View className="mt-4 flex-row gap-3">
                    <View className="flex-1">
                      <Button
                        label="Grant permission"
                        tone="accent"
                        onPress={() => void requestPermission()}
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        label="Settings"
                        tone="ghost"
                        onPress={() => void openHealthConnectSettingsSafe()}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Body dim>
                    7-day step history synced directly from Android Health Connect.
                  </Body>
                  <Pressable
                    onPress={() => void openHealthConnectSettingsSafe()}
                    className="mt-3 flex-row items-center gap-1 active:opacity-60"
                  >
                    <Text className="font-bodyMed text-[13px] text-accent">
                      Manage permissions in Health Connect ↗
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </Card>

        {session.status === 'signed-in' && isLive() ? (
          <Card className="mt-3">
            <Label>Account</Label>
            <Text className="mt-2 font-bodyMed text-[15px] text-ink">
              {session.user.displayName}
            </Text>
            <Body dim className="mt-1">
              {session.user.phone}
            </Body>

            <Pressable
              onPress={() =>
                Alert.alert('Sign out?', 'You will need your phone to sign back in.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: () => {
                      void signOut().then(() => router.replace('/sign-in'));
                    },
                  },
                ])
              }
              className="mt-4 active:opacity-60"
            >
              <Text className="font-bodyBold text-[14px] text-flame">Sign out</Text>
            </Pressable>
          </Card>
        ) : null}

        <View className="mt-12 items-center gap-3 pb-2">
          <Logo size={32} />
          <Text
            onPress={() => Linking.openURL('https://github.com/fitnessorg')}
            className="font-bodyMed text-[14px] text-accent"
          >
            Open source on GitHub ↗
          </Text>
          <Body dim>StepPal 1.0.0 · demo build · Apache-2.0</Body>
        </View>
      </ScrollView>
    </Screen>
  );
}
