import { getStepSource } from '../health';
import { api, isLive } from './client';
import type { StepSource } from '../sdk';

/**
 * Pushes what the phone measured to the server, which is the only number pots
 * are scored on.
 *
 * Seven days every time, not just today. A phone that was offline on Tuesday
 * must be able to catch up, and the endpoint is idempotent on (user, day), so
 * resending a week costs one request and changes nothing that was already
 * right. Sending only today would mean a single missed sync silently loses a
 * day of someone's pot.
 */
export type SyncResult =
  | { status: 'synced'; accepted: number; clamped: number }
  | { status: 'skipped'; reason: 'demo_mode' | 'no_source' }
  | { status: 'failed'; error: string };

export async function syncSteps(days = 7): Promise<SyncResult> {
  if (!isLive()) return { status: 'skipped', reason: 'demo_mode' };

  const source = getStepSource();

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));

  try {
    const range = await source.getRange(from, to);
    if (range.length === 0) return { status: 'skipped', reason: 'no_source' };

    const result = await api().submitSteps(
      range.map((d) => ({
        day: d.day,
        steps: d.steps,
        source: source.name as StepSource,
      })),
    );

    // Rejections are the server disagreeing with the phone — a clock skewed
    // into tomorrow, or a backfill older than the settlement window. Worth
    // seeing in a log, not worth interrupting anyone over.
    if (result.rejected.length > 0) {
      console.warn('[steppal] server rejected days:', result.rejected);
    }

    return { status: 'synced', accepted: result.accepted, clamped: result.clamped };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : 'unknown' };
  }
}
