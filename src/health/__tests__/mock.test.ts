import { MockStepSource } from '../mock';
import { week } from '../../mock/data';

describe('src/health/mock', () => {
  it('always reports ready status and granted permissions', async () => {
    expect(MockStepSource.name).toBe('mock');
    expect(await MockStepSource.status()).toBe('ready');
    expect(await MockStepSource.checkPermission!()).toBe(true);
    expect(await MockStepSource.requestPermission()).toBe(true);
  });

  it('returns deterministic daily steps cycling through mock week data', async () => {
    const from = new Date('2026-09-01T10:00:00Z');
    const to = new Date('2026-09-08T10:00:00Z');

    const rows = await MockStepSource.getRange(from, to);
    expect(rows).toHaveLength(8);
    expect(rows[0]).toEqual({ day: '2026-09-01', steps: week[0].steps });
    expect(rows[6]).toEqual({ day: '2026-09-07', steps: week[6].steps });
    // Day 8 wraps around to index 0 of week
    expect(rows[7]).toEqual({ day: '2026-09-08', steps: week[0].steps });
  });
});
