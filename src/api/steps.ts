import { getStepSource } from '../health';
import { api, isLive } from './client';
import { tokenStore } from './storage';
import type { StepSource } from '../sdk';

export const STEPS_QUEUE_STORAGE_KEY = 'steppal.offline_steps_queue';

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

export type QueuedStepDay = {
  day: string;
  steps: number;
  source: StepSource;
};

/**
 * Reads all pending step days waiting to be uploaded.
 */
export async function getPendingStepQueue(): Promise<QueuedStepDay[]> {
  try {
    const raw = await tokenStore().get(STEPS_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is QueuedStepDay =>
        typeof item?.day === 'string' &&
        typeof item?.steps === 'number' &&
        typeof item?.source === 'string',
    );
  } catch {
    return [];
  }
}

/**
 * Persists failed step days in the offline queue, deduplicating by day
 * and keeping the highest step count recorded for that calendar day.
 */
export async function enqueueSteps(items: QueuedStepDay[]): Promise<QueuedStepDay[]> {
  if (items.length === 0) return getPendingStepQueue();
  const existing = await getPendingStepQueue();
  const map = new Map<string, QueuedStepDay>();

  for (const item of existing) {
    map.set(item.day, item);
  }

  for (const item of items) {
    const prev = map.get(item.day);
    if (!prev) {
      map.set(item.day, item);
    } else {
      map.set(item.day, {
        day: item.day,
        steps: Math.max(prev.steps, item.steps),
        source: item.source,
      });
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
  await tokenStore().set(STEPS_QUEUE_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Empties the persistent upload queue.
 */
export async function clearPendingStepQueue(): Promise<void> {
  await tokenStore().remove(STEPS_QUEUE_STORAGE_KEY);
}

/**
 * Flushes queued offline steps to the server. Safe to call repeatedly;
 * idempotency on (user, day) guarantees no double counting.
 */
export async function flushStepQueue(): Promise<SyncResult> {
  if (!isLive()) return { status: 'skipped', reason: 'demo_mode' };

  const queue = await getPendingStepQueue();
  if (queue.length === 0) {
    return { status: 'synced', accepted: 0, clamped: 0 };
  }

  try {
    const result = await api().submitSteps(
      queue.map((d) => ({
        day: d.day,
        steps: d.steps,
        source: d.source,
      })),
    );

    if (result.rejected.length > 0) {
      console.warn('[steppal] server rejected queued days:', result.rejected);
    }

    await clearPendingStepQueue();
    return { status: 'synced', accepted: result.accepted, clamped: result.clamped };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function syncSteps(days = 7): Promise<SyncResult> {
  if (!isLive()) return { status: 'skipped', reason: 'demo_mode' };

  const source = getStepSource();

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));

  try {
    const range = await source.getRange(from, to);
    if (range.length === 0) {
      const pending = await getPendingStepQueue();
      if (pending.length > 0) {
        return await flushStepQueue();
      }
      return { status: 'skipped', reason: 'no_source' };
    }

    const currentDays: QueuedStepDay[] = range.map((d) => ({
      day: d.day,
      steps: d.steps,
      source: source.name as StepSource,
    }));

    // Merge any previously pending days with the fresh range so we catch up
    // everything in a single request.
    const pending = await getPendingStepQueue();
    const map = new Map<string, QueuedStepDay>();
    for (const p of pending) {
      map.set(p.day, p);
    }
    for (const d of currentDays) {
      const prev = map.get(d.day);
      map.set(d.day, {
        day: d.day,
        steps: prev ? Math.max(prev.steps, d.steps) : d.steps,
        source: d.source,
      });
    }

    const payload = Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));

    const result = await api().submitSteps(payload);

    if (result.rejected.length > 0) {
      console.warn('[steppal] server rejected days:', result.rejected);
    }

    await clearPendingStepQueue();
    return { status: 'synced', accepted: result.accepted, clamped: result.clamped };
  } catch (err) {
    // Preserve what we read locally in the offline queue so nothing is lost.
    try {
      const range = await source.getRange(from, to);
      if (range.length > 0) {
        await enqueueSteps(
          range.map((d) => ({
            day: d.day,
            steps: d.steps,
            source: source.name as StepSource,
          })),
        );
      }
    } catch {
      // Step reading error; previous queue is retained.
    }
    return { status: 'failed', error: err instanceof Error ? err.message : 'unknown' };
  }
}
