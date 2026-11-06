import {
  syncSteps,
  flushStepQueue,
  enqueueSteps,
  getPendingStepQueue,
  clearPendingStepQueue,
  STEPS_QUEUE_STORAGE_KEY,
} from '../steps';
import { isLive, api } from '../client';
import { getStepSource } from '../../health';
import { tokenStore } from '../storage';

const mockSecureStorage = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStorage.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStorage.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStorage.delete(key);
  }),
}));

jest.mock('../client', () => ({
  isLive: jest.fn(),
  api: jest.fn(),
}));

jest.mock('../../health', () => ({
  getStepSource: jest.fn(),
}));

describe('Step Sync & Offline Queue Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockSecureStorage.clear();
    await clearPendingStepQueue();
  });

  afterEach(async () => {
    await clearPendingStepQueue();
  });

  describe('Queue Storage & Deduplication', () => {
    it('initial queue is empty', async () => {
      const queue = await getPendingStepQueue();
      expect(queue).toEqual([]);
    });

    it('enqueues items and deduplicates by day keeping higher step count', async () => {
      await enqueueSteps([
        { day: '2026-11-01', steps: 5000, source: 'health_connect' },
        { day: '2026-11-02', steps: 8000, source: 'health_connect' },
      ]);

      // Add day with higher step count for 2026-11-01, and lower for 2026-11-02
      await enqueueSteps([
        { day: '2026-11-01', steps: 6500, source: 'health_connect' },
        { day: '2026-11-02', steps: 7000, source: 'health_connect' },
        { day: '2026-11-03', steps: 10000, source: 'health_connect' },
      ]);

      const queue = await getPendingStepQueue();
      expect(queue).toHaveLength(3);
      expect(queue).toEqual([
        { day: '2026-11-01', steps: 6500, source: 'health_connect' },
        { day: '2026-11-02', steps: 8000, source: 'health_connect' },
        { day: '2026-11-03', steps: 10000, source: 'health_connect' },
      ]);
    });

    it('handles corrupted JSON in storage gracefully', async () => {
      await tokenStore().set(STEPS_QUEUE_STORAGE_KEY, 'not-valid-json');
      const queue = await getPendingStepQueue();
      expect(queue).toEqual([]);
    });
  });

  describe('flushStepQueue', () => {
    it('skips flush when demo mode is active', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(false);
      await enqueueSteps([{ day: '2026-11-01', steps: 5000, source: 'health_connect' }]);

      const result = await flushStepQueue();
      expect(result).toEqual({ status: 'skipped', reason: 'demo_mode' });
      expect(api).not.toHaveBeenCalled();
    });

    it('returns zero accepted when queue is empty', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(true);
      const result = await flushStepQueue();
      expect(result).toEqual({ status: 'synced', accepted: 0, clamped: 0 });
      expect(api).not.toHaveBeenCalled();
    });

    it('submits queued steps and clears queue on success', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(true);
      await enqueueSteps([
        { day: '2026-11-01', steps: 5000, source: 'health_connect' },
        { day: '2026-11-02', steps: 7500, source: 'health_connect' },
      ]);

      const mockSubmitSteps = jest.fn().mockResolvedValue({
        accepted: 2,
        clamped: 0,
        rejected: [],
      });
      (api as unknown as jest.Mock).mockReturnValue({
        submitSteps: mockSubmitSteps,
      });

      const result = await flushStepQueue();
      expect(result).toEqual({ status: 'synced', accepted: 2, clamped: 0 });
      expect(mockSubmitSteps).toHaveBeenCalledWith([
        { day: '2026-11-01', steps: 5000, source: 'health_connect' },
        { day: '2026-11-02', steps: 7500, source: 'health_connect' },
      ]);

      // Queue is empty after successful flush
      const queue = await getPendingStepQueue();
      expect(queue).toEqual([]);
    });

    it('preserves queue when API throws on flush', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(true);
      await enqueueSteps([{ day: '2026-11-01', steps: 5000, source: 'health_connect' }]);

      (api as unknown as jest.Mock).mockReturnValue({
        submitSteps: jest.fn().mockRejectedValue(new Error('Server unavailable')),
      });

      const result = await flushStepQueue();
      expect(result).toEqual({ status: 'failed', error: 'Server unavailable' });

      // Queue must remain intact for next retry
      const queue = await getPendingStepQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].day).toBe('2026-11-01');
    });
  });

  describe('syncSteps with Offline Enqueue & Merge', () => {
    it('skips sync when in demo mode', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(false);

      const result = await syncSteps();
      expect(result).toEqual({ status: 'skipped', reason: 'demo_mode' });
      expect(api).not.toHaveBeenCalled();
    });

    it('queues steps when API submission fails', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(true);
      (getStepSource as jest.Mock).mockReturnValue({
        name: 'health_connect',
        getRange: jest.fn().mockResolvedValue([
          { day: '2026-11-04', steps: 4000 },
          { day: '2026-11-05', steps: 9500 },
        ]),
      });

      (api as unknown as jest.Mock).mockReturnValue({
        submitSteps: jest.fn().mockRejectedValue(new Error('Connection lost')),
      });

      const result = await syncSteps();
      expect(result).toEqual({ status: 'failed', error: 'Connection lost' });

      const queue = await getPendingStepQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].day).toBe('2026-11-04');
      expect(queue[1].day).toBe('2026-11-05');
    });

    it('merges existing queued steps with current range on next sync', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(true);

      // Pre-seed offline queue with a past day
      await enqueueSteps([{ day: '2026-11-03', steps: 6000, source: 'health_connect' }]);

      (getStepSource as jest.Mock).mockReturnValue({
        name: 'health_connect',
        getRange: jest.fn().mockResolvedValue([
          { day: '2026-11-04', steps: 8000 },
          { day: '2026-11-05', steps: 11000 },
        ]),
      });

      const mockSubmit = jest.fn().mockResolvedValue({
        accepted: 3,
        clamped: 0,
        rejected: [],
      });
      (api as unknown as jest.Mock).mockReturnValue({ submitSteps: mockSubmit });

      const result = await syncSteps();
      expect(result).toEqual({ status: 'synced', accepted: 3, clamped: 0 });

      // All 3 days sent together in one request
      expect(mockSubmit).toHaveBeenCalledWith([
        { day: '2026-11-03', steps: 6000, source: 'health_connect' },
        { day: '2026-11-04', steps: 8000, source: 'health_connect' },
        { day: '2026-11-05', steps: 11000, source: 'health_connect' },
      ]);

      // Queue cleared after successful combined sync
      expect(await getPendingStepQueue()).toEqual([]);
    });

    it('flushes pending queue when range returns empty', async () => {
      (isLive as unknown as jest.Mock).mockReturnValue(true);
      await enqueueSteps([{ day: '2026-11-02', steps: 4500, source: 'health_connect' }]);

      (getStepSource as jest.Mock).mockReturnValue({
        name: 'health_connect',
        getRange: jest.fn().mockResolvedValue([]),
      });

      const mockSubmit = jest.fn().mockResolvedValue({
        accepted: 1,
        clamped: 0,
        rejected: [],
      });
      (api as unknown as jest.Mock).mockReturnValue({ submitSteps: mockSubmit });

      const result = await syncSteps();
      expect(result).toEqual({ status: 'synced', accepted: 1, clamped: 0 });
      expect(await getPendingStepQueue()).toEqual([]);
    });
  });
});
