import { joinablePot, modeLabel, naira, pots, stats, steps, user, wallet, week } from '../data';

describe('src/mock/data', () => {
  it('formats kobo amounts into Nigerian Naira strings with sign handling', () => {
    expect(naira(0)).toBe('₦0');
    expect(naira(100_000)).toBe('₦1,000');
    expect(naira(1_450_000)).toBe('₦14,500');
    expect(naira(-500_000)).toBe('-₦5,000');
  });

  it('formats step counts with locale thousands separators', () => {
    expect(steps(0)).toBe('0');
    expect(steps(10_000)).toBe('10,000');
    expect(steps(412_880)).toBe('412,880');
  });

  it('exposes human-readable labels for each pot settlement mode', () => {
    expect(modeLabel.winner_takes_all).toBe('Winner takes all');
    expect(modeLabel.forfeit).toBe('Forfeit pot');
  });

  it('maintains valid demo seed structures for week, pots, wallet, and user', () => {
    expect(user.dailyGoal).toBeGreaterThan(0);
    expect(week).toHaveLength(7);
    expect(pots.some((p) => p.status === 'active')).toBe(true);
    expect(pots.some((p) => p.status === 'settled')).toBe(true);
    expect(joinablePot.code).toBeTruthy();
    expect(wallet.ledger.length).toBeGreaterThan(0);
    expect(stats.totalSteps).toBeGreaterThan(0);
  });
});
