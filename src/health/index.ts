import { Platform } from 'react-native';
import { MockStepSource } from './mock';
import type { StepSource } from './types';

export * from './types';
export { startLiveCount, getLiveCount, resetLiveCount } from './pedometer';

/**
 * Picks the best step source this build can actually run, in order:
 *
 *   1. Health Connect — full seven-day history. Needs a dev build containing
 *      react-native-health-connect.
 *   2. Pedometer — hardware step counter via expo-sensors. Works in Expo Go,
 *      but Android gives live counting only, no history.
 *   3. Mock — sample data. Keeps the app runnable for everyone.
 *
 * Detection is at runtime, not a hand-flipped constant: `npm install` puts a
 * native module in node_modules but NOT into an already-built APK, and not
 * into Expo Go at all.
 *
 * Requiring the package is NOT a usable test. react-native-health-connect
 * imports cleanly with no native side present and hands back a proxy that only
 * throws when a method is finally called — which surfaced as an unhandled
 * rejection inside onboarding rather than a fallback. So the native module is
 * probed directly before Health Connect is accepted.
 *
 * Force sample data with EXPO_PUBLIC_STEP_SOURCE=mock — useful when recording
 * a demo, where the same numbers on every take matter more than real ones.
 */
/**
 * True only when the Health Connect native module is actually in this binary.
 *
 * Two guards, because either alone has a gap. Expo Go ships a fixed set of
 * native modules and ours is not among them, so it is ruled out by execution
 * environment. A custom dev build then still has to prove the module is
 * registered, since an older APK built before the package was installed will
 * not have it.
 */
function healthConnectLinked(): boolean {
  if (Platform.OS !== 'android') return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default;
    if (Constants?.executionEnvironment === 'storeClient') return false;
  } catch {
    // expo-constants missing is not a reason to give up; fall through.
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NativeModules, TurboModuleRegistry } = require('react-native');
    if (NativeModules?.HealthConnect) return true;
    return Boolean(TurboModuleRegistry?.get?.('HealthConnect'));
  } catch {
    return false;
  }
}

let cached: StepSource | null = null;

export function getStepSource(): StepSource {
  if (cached) return cached;

  if (process.env.EXPO_PUBLIC_STEP_SOURCE === 'mock') {
    cached = MockStepSource;
    return cached;
  }

  if (healthConnectLinked()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('./healthConnect') as { HealthConnectStepSource: StepSource };
      if (!mod?.HealthConnectStepSource) throw new Error('no export');
      cached = mod.HealthConnectStepSource;
      return cached;
    } catch {
      // Falls through to the pedometer.
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./pedometer') as { PedometerStepSource: StepSource };
    if (!mod?.PedometerStepSource) throw new Error('no export');
    cached = mod.PedometerStepSource;
    return cached;
  } catch {
    console.warn('[steppal] no step source available — using sample data');
    cached = MockStepSource;
    return cached;
  }
}

/** True when real device data is being read. Screens can label the difference. */
export function isLiveSource(): boolean {
  return getStepSource().name !== 'mock';
}

export function sourceLabel(): string {
  const n = getStepSource().name;
  if (n === 'health_connect') return 'Health Connect';
  if (n === 'pedometer') return 'Step counter';
  return 'Sample data';
}
