const mockIsAvailableAsync = jest.fn();
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetStepCountAsync = jest.fn();
const mockWatchStepCount = jest.fn();

jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
    getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
    requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
    getStepCountAsync: (...args: unknown[]) => mockGetStepCountAsync(...args),
    watchStepCount: (...args: unknown[]) => mockWatchStepCount(...args),
  },
}));

import {
  PedometerStepSource,
  getLiveCount,
  resetLiveCount,
  startLiveCount,
} from '../pedometer';
import { toDayKey } from '../types';

describe('src/health/pedometer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetLiveCount();
  });

  it('evaluates status across sensor availability and permission states', async () => {
    mockIsAvailableAsync.mockResolvedValueOnce(false);
    expect(await PedometerStepSource.status()).toBe('unsupported');

    mockIsAvailableAsync.mockResolvedValueOnce(true);
    mockGetPermissionsAsync.mockResolvedValueOnce({ granted: false });
    expect(await PedometerStepSource.status()).toBe('permission_denied');

    mockIsAvailableAsync.mockResolvedValueOnce(true);
    mockGetPermissionsAsync.mockResolvedValueOnce({ granted: true });
    expect(await PedometerStepSource.status()).toBe('ready');

    mockIsAvailableAsync.mockRejectedValueOnce(new Error('sensor error'));
    expect(await PedometerStepSource.status()).toBe('unknown');
  });

  it('checks and requests permissions safely', async () => {
    mockGetPermissionsAsync.mockResolvedValueOnce({ granted: true });
    expect(await PedometerStepSource.checkPermission!()).toBe(true);

    mockGetPermissionsAsync.mockRejectedValueOnce(new Error('failed'));
    expect(await PedometerStepSource.checkPermission!()).toBe(false);

    mockRequestPermissionsAsync.mockResolvedValueOnce({ granted: true });
    expect(await PedometerStepSource.requestPermission()).toBe(true);
  });

  it('accumulates live steps via startLiveCount and cleans up on unsubscribe', () => {
    let listener: ((res: { steps: number }) => void) | undefined;
    const remove = jest.fn();
    mockWatchStepCount.mockImplementation((cb: (res: { steps: number }) => void) => {
      listener = cb;
      return { remove };
    });

    const updates: number[] = [];
    const stop = startLiveCount((total) => updates.push(total));
    // Calling startLiveCount while already subscribed is a safe no-op
    const noopStop = startLiveCount();
    noopStop();
    expect(mockWatchStepCount).toHaveBeenCalledTimes(1);

    listener?.({ steps: 120 });
    listener?.({ steps: 80 });
    expect(getLiveCount()).toBe(200);
    expect(updates).toEqual([120, 200]);

    stop();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('returns live count for today and queries getStepCountAsync (with 0 fallback) for past days', async () => {
    let listener: ((res: { steps: number }) => void) | undefined;
    mockWatchStepCount.mockImplementation((cb: (res: { steps: number }) => void) => {
      listener = cb;
      return { remove: jest.fn() };
    });
    const stop = startLiveCount();
    listener?.({ steps: 450 });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    mockGetStepCountAsync
      .mockResolvedValueOnce({ steps: 8100 }) // twoDaysAgo
      .mockRejectedValueOnce(new Error('not supported on Android')); // yesterday

    const range = await PedometerStepSource.getRange(twoDaysAgo, today);
    expect(range).toEqual([
      { day: toDayKey(twoDaysAgo), steps: 8100 },
      { day: toDayKey(yesterday), steps: 0 },
      { day: toDayKey(today), steps: 450 },
    ]);

    stop();
  });
});
