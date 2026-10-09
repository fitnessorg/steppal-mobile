import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Label, Screen } from '../src/components/ui';
import { usePalette } from '../src/theme';
import { api } from '../src/api/client';
import { setSignedIn, hasSeenOnboarding } from '../src/session';
import { StepPalError } from '../src/sdk';

/**
 * Phone sign-in, two steps on one screen.
 *
 * No passwords and no email. A Nigerian user has a phone number and a group
 * chat; asking them to invent a password for a step app is a reason not to
 * finish signing up.
 *
 * Errors are shown inline rather than in an Alert. An alert interrupts, and
 * the thing you want to re-read while fixing a typo is the field you typed
 * into.
 */
export default function SignIn() {
  const C = usePalette();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeInput = useRef<TextInput>(null);

  const requestCode = async () => {
    setBusy(true);
    setError(null);
    try {
      await api().requestCode(phone);
      setStep('code');
      setTimeout(() => codeInput.current?.focus(), 50);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await api().verifyCode(phone, code, name.trim() || undefined);
      setSignedIn(session.user);
      router.replace(hasSeenOnboarding() ? '/(tabs)/home' : '/onboarding');
    } catch (err) {
      setError(messageFor(err));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View className="flex-1 justify-center px-5">
        <Label tone="flame">{step === 'phone' ? 'Sign in' : 'Check your messages'}</Label>

        <Text className="mt-3 font-displayBlack text-[32px] leading-10 text-ink">
          {step === 'phone' ? 'What is your number?' : `We sent a code to ${phone}`}
        </Text>

        <Body dim className="mt-3">
          {step === 'phone'
            ? 'No password. We send a six-digit code and that is the whole sign up.'
            : 'Six digits. It expires in ten minutes.'}
        </Body>

        {step === 'phone' ? (
          <>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="0803 123 4567"
              placeholderTextColor={C.inkFaint}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              className="mt-8 rounded-2xl border border-surface2 px-5 py-4 font-bodyMed text-[17px] text-ink"
              style={{ color: C.ink }}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name (optional)"
              placeholderTextColor={C.inkFaint}
              className="mt-3 rounded-2xl border border-surface2 px-5 py-4 font-bodyMed text-[17px] text-ink"
              style={{ color: C.ink }}
            />
          </>
        ) : (
          <TextInput
            ref={codeInput}
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            placeholderTextColor={C.inkFaint}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            className="mt-8 rounded-2xl border border-surface2 px-5 py-4 text-center font-displayBlack text-[28px] tracking-[8px] text-ink"
            style={{ color: C.ink }}
          />
        )}

        {error ? (
          <Text className="mt-3 font-bodyMed text-[13px] text-flame">{error}</Text>
        ) : null}

        <View className="mt-6">
          {busy ? (
            <View className="items-center py-4">
              <ActivityIndicator color={C.accent} />
            </View>
          ) : (
            <Button
              label={step === 'phone' ? 'Send me a code' : 'Sign in'}
              onPress={step === 'phone' ? requestCode : verify}
            />
          )}
        </View>

        {step === 'code' ? (
          <Pressable
            onPress={() => {
              setStep('phone');
              setCode('');
              setError(null);
            }}
            className="mt-5 active:opacity-60"
          >
            <Text className="text-center font-bodyMed text-[13px] text-inkFaint">
              Wrong number? Go back
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

/**
 * Server codes are stable identifiers, not prose — so the words a user reads
 * are chosen here, where they can be changed without touching the API.
 */
function messageFor(err: unknown): string {
  if (err instanceof StepPalError) {
    switch (err.code) {
      case 'invalid_phone':
        return 'That does not look like a phone number.';
      case 'too_many_requests':
        return 'Too many codes requested. Try again in an hour.';
      case 'invalid_code':
        return 'That code is wrong or has expired.';
      default:
        return 'Something went wrong. Try again.';
    }
  }
  return 'Could not reach StepPal. Check your connection.';
}
