import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { router } from 'expo-router';

/**
 * Launch screen. The native splash (flame, logo) hands over to this, which
 * holds the mark for a beat and then settles into the app.
 *
 * Deliberately short — long branded intros are charming once and irritating
 * every time after.
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

    const t = setTimeout(() => router.replace('/(tabs)/home'), 1400);
    return () => clearTimeout(t);
  }, [fade, rise]);

  return (
    <View className="flex-1 items-center justify-center bg-flame">
      <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }] }}>
        <Image
          source={require('../assets/splash-icon.png')}
          style={{ width: 200, height: 138, resizeMode: 'contain' }}
        />
      </Animated.View>
      <Animated.Text
        style={{ opacity: fade }}
        className="mt-6 font-displayBlack text-2xl tracking-tight text-ink"
      >
        STEPPAL
      </Animated.Text>
    </View>
  );
}
