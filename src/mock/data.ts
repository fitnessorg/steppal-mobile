/**
 * Mock data for the demo build.
 *
 * Everything the app shows comes from here. When the API lands, this file is
 * what gets replaced — screens read from these shapes, so swapping the source
 * doesn't touch the UI.
 *
 * TODO(contributor): replace with @steppal/sdk calls
 * Each export below maps to an endpoint in steppal-core. Keep the shapes
 * identical so screens don't change. Start with todaySteps and activePot.
 * difficulty: medium
 */

export type PotMode = 'winner_takes_all' | 'forfeit';
export type PotStatus = 'active' | 'settled';

export const user = {
  name: 'Stephen',
  handle: '+234 903 843 9205',
  dailyGoal: 10_000,
  joined: 'Aug 2026',
};

/** Today, and the six days before it. Index 6 is today. */
export const week = [
  { day: 'Thu', steps: 9_210, goalMet: true },
  { day: 'Fri', steps: 11_340, goalMet: true },
  { day: 'Sat', steps: 12_050, goalMet: true },
  { day: 'Sun', steps: 7_980, goalMet: false },
  { day: 'Mon', steps: 10_420, goalMet: true },
  { day: 'Tue', steps: 10_880, goalMet: true },
  { day: 'Wed', steps: 8_412, goalMet: false },
];

export const todaySteps = 8_412;
export const lastSynced = '2 min ago';

export type Member = {
  id: string;
  name: string;
  steps: number;
  daysMet: number;
  isYou?: boolean;
};

export type Pot = {
  id: string;
  name: string;
  mode: PotMode;
  status: PotStatus;
  stakeKobo: number;
  potKobo: number;
  dayOf: number;
  totalDays: number;
  inviteCode: string;
  members: Member[];
  /** Only on settled pots. */
  payoutKobo?: number;
};

export const pots: Pot[] = [
  {
    id: 'lagos-walkers',
    name: 'Lagos Walkers',
    mode: 'forfeit',
    status: 'active',
    stakeKobo: 500_000,
    potKobo: 900_000,
    dayOf: 5,
    totalDays: 7,
    inviteCode: 'WALK-4821',
    members: [
      { id: '1', name: 'Tunde', steps: 61_204, daysMet: 5 },
      { id: '2', name: 'You', steps: 58_890, daysMet: 4, isYou: true },
      { id: '3', name: 'Ada', steps: 52_117, daysMet: 4 },
      { id: '4', name: 'Chidi', steps: 44_003, daysMet: 3 },
      { id: '5', name: 'Ife', steps: 39_560, daysMet: 2 },
      { id: '6', name: 'Kemi', steps: 31_200, daysMet: 1 },
    ],
  },
  {
    id: 'office-sprint',
    name: 'Office Sprint',
    mode: 'winner_takes_all',
    status: 'settled',
    stakeKobo: 300_000,
    potKobo: 1_200_000,
    dayOf: 7,
    totalDays: 7,
    inviteCode: 'SPRT-1190',
    payoutKobo: 1_200_000,
    members: [
      { id: '2', name: 'You', steps: 78_430, daysMet: 7, isYou: true },
      { id: '7', name: 'Bisi', steps: 71_002, daysMet: 6 },
      { id: '8', name: 'Femi', steps: 66_890, daysMet: 5 },
      { id: '9', name: 'Nneka', steps: 60_110, daysMet: 5 },
    ],
  },
];

export const activePot = pots.find((p) => p.status === 'active')!;

export type LedgerEntry = {
  id: string;
  label: string;
  sub: string;
  amountKobo: number;
};

export const wallet = {
  availableKobo: 1_450_000,
  heldKobo: 500_000,
  ledger: [
    { id: 'l1', label: 'Office Sprint payout', sub: 'Won · 3 Sept', amountKobo: 1_200_000 },
    { id: 'l2', label: 'Lagos Walkers stake', sub: 'Held · 7 Sept', amountKobo: -500_000 },
    { id: 'l3', label: 'Missed daily goal', sub: 'Forfeit · Sun', amountKobo: -100_000 },
    { id: 'l4', label: 'Deposit', sub: 'GTBank transfer · 1 Sept', amountKobo: 750_000 },
  ] as LedgerEntry[],
};

export const stats = {
  potsPlayed: 4,
  potsWon: 2,
  totalSteps: 412_880,
  bestDay: 14_902,
};

/* ---------------------------------------------------------------- helpers */

export function naira(kobo: number): string {
  const sign = kobo < 0 ? '-' : '';
  return `${sign}₦${Math.abs(kobo / 100).toLocaleString('en-NG')}`;
}

export function steps(n: number): string {
  return n.toLocaleString('en-NG');
}

export const modeLabel: Record<PotMode, string> = {
  winner_takes_all: 'Winner takes all',
  forfeit: 'Forfeit pot',
};
