import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { router } from 'expo-router';
import { bootstrapSession, hasSeenOnboarding } from '../src/session';

/**
 * Launch screen. The native splash (flame ground, white mark) hands over to
 * this, which holds the mark for a beat then routes on.
 *
 * Always flame regardless of theme — a brand moment shouldn't flip with the
 * OS, and it makes the handover from the native splash seamless.
 */
export default function Launch() {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // The splash beat and the session restore run together. Whichever finishes
    // last decides when we route, so a fast restore still gets the full brand
    // moment and a slow one never shows a half-drawn screen.
    let cancelled = false;
    const beat = new Promise((resolve) => setTimeout(resolve, 1400));

    void Promise.all([beat, bootstrapSession()]).then(([, session]) => {
      if (cancelled) return;
      if (session.status === 'signed-out') return router.replace('/sign-in');
      router.replace(hasSeenOnboarding() ? '/(tabs)/home' : '/onboarding');
    });

    return () => {
      cancelled = true;
    };
  }, [fade, rise]);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FF4A1C' }}>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }] }}>
        <Image
          source={require('../assets/steppal-mark.png')}
          style={{ width: 200, height: 138, resizeMode: 'contain', tintColor: '#FFFFFF' }}
        />
      </Animated.View>
      <Animated.Text
        style={{ opacity: fade, color: '#FFFFFF', fontFamily: 'Unbounded_800ExtraBold' }}
        className="mt-6 text-2xl tracking-tight"
      >
        STEPPAL
      </Animated.Text>
    </View>
  );
}
