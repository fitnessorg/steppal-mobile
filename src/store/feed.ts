import { useSyncExternalStore } from 'react';
import { pledges as seed, type Pledge, type PledgeKind } from '../mock/feed';
import { user } from '../mock/data';

/**
 * In-memory pledge store.
 *
 * Mirrors the state machine in contracts/goal-escrow: a pledge is Open while it
 * accepts money, Attested once a step count is reported, then Paid or
 * Refunding. Screens read that status rather than inventing their own.
 *
 * TODO(contributor): back this with the goal-escrow contract
 * createPledge maps to create_goal, tip to fund, markAttested to attest, and
 * claim to claim. The oracle signature and the 24-hour challenge window live
 * on chain; this store only needs to reflect them.
 * difficulty: hard
 */

type Listener = () => void;

let pledges: Pledge[] = [...seed];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* ------------------------------------------------------------------ reads */

export function usePledges(): Pledge[] {
  return useSyncExternalStore(
    subscribe,
    () => pledges,
    () => pledges,
  );
}

export function usePledge(id?: string): Pledge | undefined {
  return usePledges().find((p) => p.id === id);
}

/* ----------------------------------------------------------------- writes */

function slug(seedText: string): string {
  const base = seedText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  const taken = new Set(pledges.map((p) => p.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export type NewPledge = {
  kind: PledgeKind;
  /** Who walks. For a sponsored goal this is the friend, not the sponsor. */
  author: string;
  body: string;
  targetSteps: number;
  days: number;
  /** Sponsored goals are funded at creation. */
  seedKobo?: number;
};

export function createPledge(input: NewPledge): Pledge {
  const sponsored = input.kind === 'sponsored';
  const seedKobo = sponsored ? (input.seedKobo ?? 0) : 0;

  const pledge: Pledge = {
    id: slug(`${input.author}-${input.targetSteps}`),
    kind: input.kind,
    author: input.author,
    sponsor: sponsored ? user.name : undefined,
    body: input.body.trim(),
    targetSteps: input.targetSteps,
    currentSteps: 0,
    deadline: `${input.days} days left`,
    status: 'open',
    funders: seedKobo
      ? [{ id: `me-${Date.now()}`, name: 'You', amountKobo: seedKobo, isYou: true }]
      : [],
    potKobo: seedKobo,
    postedAt: 'now',
    cheers: 0,
  };

  pledges = [pledge, ...pledges];
  emit();
  return pledge;
}

/** Adds money. Tipping and sponsoring are the same call, as in the contract. */
export function tip(id: string, amountKobo: number) {
  if (amountKobo <= 0) return;

  pledges = pledges.map((p) => {
    if (p.id !== id) return p;

    const mine = p.funders.find((f) => f.isYou);
    const funders = mine
      ? p.funders.map((f) =>
          f.isYou ? { ...f, amountKobo: f.amountKobo + amountKobo } : f,
        )
      : [
          ...p.funders,
          { id: `me-${Date.now()}`, name: 'You', amountKobo, isYou: true as const },
        ];

    return { ...p, funders, potKobo: p.potKobo + amountKobo };
  });

  emit();
}

export function cheer(id: string) {
  pledges = pledges.map((p) => (p.id === id ? { ...p, cheers: p.cheers + 1 } : p));
  emit();
}

/** Demo helper: pretend the oracle reported a finished goal. */
export function markPaid(id: string) {
  pledges = pledges.map((p) =>
    p.id === id
      ? { ...p, status: 'paid' as const, currentSteps: p.targetSteps, deadline: 'Finished' }
      : p,
  );
  emit();
}

/* ---------------------------------------------------------------- helpers */

export function progressOf(p: Pledge): number {
  return Math.max(0, Math.min(1, p.currentSteps / p.targetSteps));
}

export function youFunded(p: Pledge): number {
  return p.funders.find((f) => f.isYou)?.amountKobo ?? 0;
}
