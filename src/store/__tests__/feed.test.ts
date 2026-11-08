jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useSyncExternalStore: (
    _subscribe: (cb: () => void) => () => void,
    getSnapshot: () => unknown,
  ) => getSnapshot(),
}));

describe('src/store/feed', () => {
  let feedStore: typeof import('../feed');

  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    feedStore = require('../feed');
  });

  it('exposes initial seed pledges via usePledges and usePledge', () => {
    const all = feedStore.usePledges();
    expect(all.length).toBeGreaterThanOrEqual(5);
    const first = feedStore.usePledge(all[0].id);
    expect(first).toEqual(all[0]);
    expect(feedStore.usePledge('non-existent')).toBeUndefined();
  });

  it('creates a self-pledge with zero initial pot and deduplicated slug', () => {
    const p1 = feedStore.createPledge({
      kind: 'pledge',
      author: 'Stephen',
      body: '  Walking 75k steps this week  ',
      targetSteps: 75_000,
      days: 7,
    });

    expect(p1.id).toBe('stephen-75000');
    expect(p1.body).toBe('Walking 75k steps this week');
    expect(p1.sponsor).toBeUndefined();
    expect(p1.potKobo).toBe(0);
    expect(p1.funders).toEqual([]);
    expect(p1.deadline).toBe('7 days left');

    // Creating another pledge with same author & targetSteps increments slug suffix
    const p2 = feedStore.createPledge({
      kind: 'pledge',
      author: 'Stephen',
      body: 'Second attempt at 75k',
      targetSteps: 75_000,
      days: 5,
    });
    expect(p2.id).toBe('stephen-75000-2');
  });

  it('creates a sponsored pledge funded with seedKobo from current user', () => {
    const sponsored = feedStore.createPledge({
      kind: 'sponsored',
      author: 'Tunde',
      body: 'Hit 60k steps for ₦5,000',
      targetSteps: 60_000,
      days: 4,
      seedKobo: 500_000,
    });

    expect(sponsored.kind).toBe('sponsored');
    expect(sponsored.sponsor).toBe('Stephen');
    expect(sponsored.potKobo).toBe(500_000);
    expect(sponsored.funders).toHaveLength(1);
    expect(sponsored.funders[0]).toMatchObject({
      name: 'You',
      amountKobo: 500_000,
      isYou: true,
    });
    expect(feedStore.youFunded(sponsored)).toBe(500_000);
  });

  it('accumulates tips from the current user and ignores non-positive amounts', () => {
    const target = feedStore.usePledge('chidi-80k')!;
    const initialPot = target.potKobo;
    expect(feedStore.youFunded(target)).toBe(0);

    feedStore.tip('chidi-80k', 0);
    feedStore.tip('chidi-80k', -500);
    expect(feedStore.usePledge('chidi-80k')!.potKobo).toBe(initialPot);

    feedStore.tip('chidi-80k', 100_000);
    const afterFirst = feedStore.usePledge('chidi-80k')!;
    expect(afterFirst.potKobo).toBe(initialPot + 100_000);
    expect(feedStore.youFunded(afterFirst)).toBe(100_000);

    // Tipping a second time merges into the existing isYou funder entry
    const funderCount = afterFirst.funders.length;
    feedStore.tip('chidi-80k', 50_000);
    const afterSecond = feedStore.usePledge('chidi-80k')!;
    expect(afterSecond.potKobo).toBe(initialPot + 150_000);
    expect(afterSecond.funders).toHaveLength(funderCount);
    expect(feedStore.youFunded(afterSecond)).toBe(150_000);
  });

  it('increments cheers and marks pledges paid', () => {
    const before = feedStore.usePledge('femi-120k')!;
    feedStore.cheer('femi-120k');
    expect(feedStore.usePledge('femi-120k')!.cheers).toBe(before.cheers + 1);

    feedStore.markPaid('femi-120k');
    const paid = feedStore.usePledge('femi-120k')!;
    expect(paid.status).toBe('paid');
    expect(paid.currentSteps).toBe(paid.targetSteps);
    expect(paid.deadline).toBe('Finished');
    expect(feedStore.progressOf(paid)).toBe(1);
  });

  it('clamps progressOf between 0 and 1', () => {
    const base = feedStore.usePledge('femi-120k')!;
    expect(feedStore.progressOf({ ...base, currentSteps: -50, targetSteps: 1000 })).toBe(0);
    expect(feedStore.progressOf({ ...base, currentSteps: 500, targetSteps: 1000 })).toBe(0.5);
    expect(feedStore.progressOf({ ...base, currentSteps: 1800, targetSteps: 1000 })).toBe(1);
  });
});
