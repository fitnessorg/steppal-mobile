/**
 * Feed mock data.
 *
 * Shapes mirror the Goal struct in contracts/goal-escrow, so wiring the real
 * contract later is a swap of the data source, not a rewrite of the screens.
 */

export type PledgeStatus = 'open' | 'attested' | 'paid' | 'refunding';
export type PledgeKind = 'pledge' | 'sponsored';

export type Funder = {
  id: string;
  name: string;
  amountKobo: number;
  isYou?: boolean;
};

export type Pledge = {
  id: string;
  kind: PledgeKind;
  /** Who has to walk. */
  author: string;
  /** Who set the goal, when someone set it for a friend. */
  sponsor?: string;
  body: string;
  targetSteps: number;
  currentSteps: number;
  /** Human deadline, e.g. "3 days left". */
  deadline: string;
  status: PledgeStatus;
  funders: Funder[];
  potKobo: number;
  postedAt: string;
  cheers: number;
};

export const pledges: Pledge[] = [
  {
    id: 'ada-100k',
    kind: 'pledge',
    author: 'Ada',
    body: 'Doing 100,000 steps this week or I never speak on fitness again. Hold me to it.',
    targetSteps: 100_000,
    currentSteps: 100_000,
    deadline: 'Finished',
    status: 'paid',
    funders: [
      { id: 'f1', name: 'Tunde', amountKobo: 200_000 },
      { id: 'f2', name: 'Kemi', amountKobo: 100_000 },
      { id: 'f3', name: 'You', amountKobo: 50_000, isYou: true },
    ],
    potKobo: 350_000,
    postedAt: '6d',
    cheers: 41,
  },
  {
    id: 'chidi-80k',
    kind: 'pledge',
    author: 'Chidi',
    body: '80k steps before Sunday. Lagos traffic means I am walking anyway.',
    targetSteps: 80_000,
    currentSteps: 62_400,
    deadline: '3 days left',
    status: 'open',
    funders: [
      { id: 'f4', name: 'Bisi', amountKobo: 150_000 },
      { id: 'f5', name: 'Femi', amountKobo: 50_000 },
    ],
    potKobo: 200_000,
    postedAt: '4d',
    cheers: 18,
  },
  {
    id: 'you-from-tunde',
    kind: 'sponsored',
    author: 'You',
    sponsor: 'Tunde',
    body: 'Tunde set you a goal: 70,000 steps this week. Hit it and the money is yours.',
    targetSteps: 70_000,
    currentSteps: 58_890,
    deadline: '2 days left',
    status: 'open',
    funders: [{ id: 'f6', name: 'Tunde', amountKobo: 500_000 }],
    potKobo: 500_000,
    postedAt: '5d',
    cheers: 7,
  },
  {
    id: 'kemi-50k',
    kind: 'sponsored',
    author: 'Kemi',
    sponsor: 'Ada',
    body: 'Ada set Kemi a goal: 50,000 steps. Kemi says it is harassment. Kemi is walking.',
    targetSteps: 50_000,
    currentSteps: 51_200,
    deadline: 'Awaiting attestation',
    status: 'attested',
    funders: [{ id: 'f7', name: 'Ada', amountKobo: 300_000 }],
    potKobo: 300_000,
    postedAt: '7d',
    cheers: 63,
  },
  {
    id: 'femi-120k',
    kind: 'pledge',
    author: 'Femi',
    body: 'Training for the Lagos City Marathon. 120,000 steps. Tips go to my race entry.',
    targetSteps: 120_000,
    currentSteps: 31_050,
    deadline: '5 days left',
    status: 'open',
    funders: [],
    potKobo: 0,
    postedAt: '1d',
    cheers: 4,
  },
];

/** Suggested tip amounts in naira. */
export const TIP_PRESETS = [500, 1_000, 2_000, 5_000];
