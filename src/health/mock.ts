import { week } from '../mock/data';
import { toDayKey, type DailySteps, type HealthStatus, type StepSource } from './types';

/**
 * Plausible fake data. This is how contributors without an Android device work,
 * and how the demo build runs. Values line up with src/mock/data.ts so the
 * leaderboard and the step count agree.
 */
export const MockStepSource: StepSource = {
  name: 'mock',

  async status(): Promise<HealthStatus> {
    return 'ready';
  },

  async requestPermission() {
    return true;
  },

  async getRange(from: Date, to: Date): Promise<DailySteps[]> {
    const out: DailySteps[] = [];
    const cursor = new Date(from);
    let i = 0;

    while (cursor <= to) {
      out.push({
        day: toDayKey(cursor),
        steps: week[i % week.length].steps,
      });
      cursor.setDate(cursor.getDate() + 1);
      i += 1;
    }

    return out;
  },
};
