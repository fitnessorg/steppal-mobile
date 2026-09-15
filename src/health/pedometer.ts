import { Pedometer } from 'expo-sensors';
import { toDayKey, type DailySteps, type HealthStatus, type StepSource } from './types';

/**
 * Reads the phone's hardware step counter through expo-sensors.
 *
 * Works in Expo Go, so contributors and demos need no custom build.
 *
 * Android limitation, and it is a real one: only LIVE counting is available.
 * `getStepCountAsync` is iOS-only, so on Android this source knows nothing
 * about steps taken before the app opened. It accumulates from subscription.
 *
 * That makes it the right source for a "walk now" screen and the wrong source
 * for a seven-day leaderboard — which is why Health Connect stays the primary
 * source when a build has it.
 */
let live = 0;
let sub: { remove: () => void } | null = null;

/** Starts accumulating. Safe to call repeatedly. Returns an unsubscribe. */
export function startLiveCount(onChange?: (total: number) => void) {
  if (sub) return () => {};

  sub = Pedometer.watchStepCount((result) => {
    live += result.steps;
    onChange?.(live);
  });

  return () => {
    sub?.remove();
    sub = null;
  };
}

export function getLiveCount() {
  return live;
}

export function resetLiveCount() {
  live = 0;
}

export const PedometerStepSource: StepSource = {
  name: 'pedometer',

  async status(): Promise<HealthStatus> {
    try {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return 'unsupported';
      const { granted } = await Pedometer.getPermissionsAsync();
      return granted ? 'ready' : 'permission_denied';
    } catch {
      return 'unknown';
    }
  },

  async requestPermission(): Promise<boolean> {
    const { granted } = await Pedometer.requestPermissionsAsync();
    return granted;
  },

  async getRange(from: Date, to: Date): Promise<DailySteps[]> {
    const out: DailySteps[] = [];
    const cursor = new Date(from);
    const todayKey = toDayKey(new Date());

    // iOS can answer for past days; Android cannot, so those days report 0.
    while (cursor <= to) {
      const key = toDayKey(cursor);
      let steps = 0;

      if (key === todayKey) {
        steps = live;
      } else {
        try {
          const start = new Date(cursor);
          start.setHours(0, 0, 0, 0);
          const end = new Date(cursor);
          end.setHours(23, 59, 59, 999);
          const res = await Pedometer.getStepCountAsync(start, end);
          steps = res?.steps ?? 0;
        } catch {
          steps = 0; // Android: no history available.
        }
      }

      out.push({ day: key, steps });
      cursor.setDate(cursor.getDate() + 1);
    }

    return out;
  },
};
