import { Platform } from 'react-native';
import { MockStepSource } from './mock';
import type { StepSource } from './types';

export * from './types';

/**
 * Flip to false once you have a dev build containing
 * react-native-health-connect. Until then the mock keeps the app runnable for
 * everyone, including contributors with no Android device.
 *
 * TODO(contributor): drive this from an env var rather than a constant
 * EXPO_PUBLIC_STEP_SOURCE=health_connect|mock, read via process.env.
 * difficulty: easy
 */
const USE_MOCK = true;

export function getStepSource(): StepSource {
  if (USE_MOCK || Platform.OS !== 'android') return MockStepSource;

  // Required lazily: importing the native module on a build that lacks it
  // throws at module load, which would take down the whole app.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { HealthConnectStepSource } = require('./healthConnect');
  return HealthConnectStepSource as StepSource;
}
