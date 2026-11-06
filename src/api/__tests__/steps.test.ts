import { syncSteps } from '../steps';
import { isLive, api } from '../client';
import { getStepSource } from '../../health';

jest.mock('../client', () => ({
  isLive: jest.fn(),
  api: jest.fn(),
}));

jest.mock('../../health', () => ({
  getStepSource: jest.fn(),
}));

describe('Step Sync Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips sync when in demo mode (live mode disabled)', async () => {
    (isLive as unknown as jest.Mock).mockReturnValue(false);

    const result = await syncSteps();
    expect(result).toEqual({ status: 'skipped', reason: 'demo_mode' });
    expect(api).not.toHaveBeenCalled();
  });

  it('skips sync when step source produces no data', async () => {
    (isLive as unknown as jest.Mock).mockReturnValue(true);
    (getStepSource as jest.Mock).mockReturnValue({
      name: 'health_connect',
      getRange: jest.fn().mockResolvedValue([]),
    });

    const result = await syncSteps();
    expect(result).toEqual({ status: 'skipped', reason: 'no_source' });
    expect(api).not.toHaveBeenCalled();
  });

  it('submits steps to API and returns synced status on success', async () => {
    (isLive as unknown as jest.Mock).mockReturnValue(true);
    (getStepSource as jest.Mock).mockReturnValue({
      name: 'health_connect',
      getRange: jest.fn().mockResolvedValue([
        { day: '2026-11-01', steps: 8400 },
        { day: '2026-11-02', steps: 10200 },
      ]),
    });

    const mockSubmitSteps = jest.fn().mockResolvedValue({
      accepted: 2,
      clamped: 0,
      rejected: [],
    });
    (api as unknown as jest.Mock).mockReturnValue({
      submitSteps: mockSubmitSteps,
    });

    const result = await syncSteps();

    expect(result).toEqual({ status: 'synced', accepted: 2, clamped: 0 });
    expect(mockSubmitSteps).toHaveBeenCalledWith([
      { day: '2026-11-01', steps: 8400, source: 'health_connect' },
      { day: '2026-11-02', steps: 10200, source: 'health_connect' },
    ]);
  });

  it('returns failed status when API throws', async () => {
    (isLive as unknown as jest.Mock).mockReturnValue(true);
    (getStepSource as jest.Mock).mockReturnValue({
      name: 'health_connect',
      getRange: jest.fn().mockResolvedValue([{ day: '2026-11-01', steps: 5000 }]),
    });

    (api as unknown as jest.Mock).mockReturnValue({
      submitSteps: jest.fn().mockRejectedValue(new Error('Network timeout')),
    });

    const result = await syncSteps();
    expect(result).toEqual({ status: 'failed', error: 'Network timeout' });
  });
});
