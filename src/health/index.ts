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
 * native module in node_modules but NOT into an already-built APK. So each
 * candidate is required in a try/catch and skipped if its native side is
 * missing.
 *
 * Force sample data with EXPO_PUBLIC_STEP_SOURCE=mock — useful when recording
 * a demo, where the same numbers on every take matter more than real ones.
 */
let cached: StepSource | null = null;

export function getStepSource(): StepSource {
  if (cached) return cached;

  if (process.env.EXPO_PUBLIC_STEP_SOURCE === 'mock') {
    cached = MockStepSource;
    return cached;
  }

  if (Platform.OS === 'android') {
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
