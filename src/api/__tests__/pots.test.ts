import { daysElapsed, toAppPot, summaryToAppPot } from '../pots';
import type { PotDetail, PotSummary } from '../../sdk';

// Mock currentUser from session
jest.mock('../../session', () => ({
  currentUser: jest.fn(() => ({ id: 'user-1', phone: '+2348012345678' })),
}));

describe('Pots API & Model Mapping', () => {
  describe('daysElapsed', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('calculates standard 7-day pot within the same month', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-03T12:00:00Z'));

      const result = daysElapsed('2026-06-01', '2026-06-07');
      expect(result.totalDays).toBe(7);
      expect(result.dayOf).toBe(3);
    });

    it('handles month boundaries properly (e.g. Feb to Mar)', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-02T12:00:00Z'));

      // 2026 is non-leap year (Feb has 28 days: Feb 27, 28, Mar 1, 2, 3 = 5 days)
      const result = daysElapsed('2026-02-27', '2026-03-03');
      expect(result.totalDays).toBe(5);
      expect(result.dayOf).toBe(4);
    });

    it('handles year transitions', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2027-01-01T12:00:00Z'));

      const result = daysElapsed('2026-12-30', '2027-01-05');
      expect(result.totalDays).toBe(7);
      expect(result.dayOf).toBe(3);
    });

    it('clamps dayOf to 1 when current date is before start date', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-20T00:00:00Z'));

      const result = daysElapsed('2026-06-01', '2026-06-07');
      expect(result.dayOf).toBe(1);
      expect(result.totalDays).toBe(7);
    });

    it('clamps dayOf to totalDays when current date exceeds end date', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-15T00:00:00Z'));

      const result = daysElapsed('2026-06-01', '2026-06-07');
      expect(result.dayOf).toBe(7);
      expect(result.totalDays).toBe(7);
    });
  });

  describe('toAppPot', () => {
    it('maps PotDetail to application Pot shape with user resolution', () => {
      const detail: PotDetail = {
        id: 'pot-42',
        name: 'Morning Striders',
        stakeKobo: 500000,
        memberCount: 3,
        dailyGoal: 10000,
        startsOn: '2026-06-01',
        endsOn: '2026-06-07',
        status: 'running',
        inviteCode: 'STRIDE1',
        members: [
          {
            userId: 'user-1',
            displayName: 'Og',
            avatarSeed: 'og',
            totalSteps: 45000,
            daysHit: 5,
            byDay: [],
          },
          {
            userId: 'user-2',
            displayName: 'Tunde',
            avatarSeed: 'tunde',
            totalSteps: 42000,
            daysHit: 4,
            byDay: [],
          },
        ],
      };

      const pot = toAppPot(detail);

      expect(pot.id).toBe('pot-42');
      expect(pot.name).toBe('Morning Striders');
      expect(pot.mode).toBe('forfeit');
      expect(pot.status).toBe('active');
      expect(pot.potKobo).toBe(1500000); // 500000 * 3
      expect(pot.inviteCode).toBe('STRIDE1');
      expect(pot.members).toHaveLength(2);

      // Current user should be identified as "You" with isYou flag
      const me = pot.members.find((m) => m.id === 'user-1');
      expect(me?.name).toBe('You');
      expect(me?.isYou).toBe(true);

      const other = pot.members.find((m) => m.id === 'user-2');
      expect(other?.name).toBe('Tunde');
      expect(other?.isYou).toBeUndefined();
    });

    it('extracts payoutKobo when user won a settled pot', () => {
      const detail: PotDetail = {
        id: 'pot-settled',
        name: 'Victory Run',
        stakeKobo: 100000,
        memberCount: 2,
        dailyGoal: 8000,
        startsOn: '2026-05-01',
        endsOn: '2026-05-07',
        status: 'settled',
        inviteCode: 'VIC123',
        members: [],
        results: [
          {
            userId: 'user-1',
            daysHit: 7,
            daysPossible: 7,
            totalSteps: 60000,
            metGoal: true,
            payoutKobo: 150000,
          },
          {
            userId: 'user-2',
            daysHit: 3,
            daysPossible: 7,
            totalSteps: 25000,
            metGoal: false,
            payoutKobo: 0,
          },
        ],
      };

      const pot = toAppPot(detail);
      expect(pot.status).toBe('settled');
      expect(pot.payoutKobo).toBe(150000);
    });
  });

  describe('summaryToAppPot', () => {
    it('creates an AppPot with empty members from summary', () => {
      const summary: PotSummary = {
        id: 'pot-sum-1',
        name: 'Weekly Jog',
        stakeKobo: 250000,
        memberCount: 4,
        dailyGoal: 10000,
        startsOn: '2026-06-01',
        endsOn: '2026-06-07',
        status: 'running',
        inviteCode: 'JOG444',
      };

      const pot = summaryToAppPot(summary);
      expect(pot.id).toBe('pot-sum-1');
      expect(pot.members).toEqual([]);
      expect(pot.potKobo).toBe(1000000);
    });
  });
});
