import { useSyncExternalStore } from 'react';
import {
  joinablePot,
  pots as seedPots,
  user,
  type ChatMessage,
  type Pot,
  type PotMode,
} from '../mock/data';

/**
 * In-memory pot store.
 *
 * Deliberately dependency-free: a module-level array plus useSyncExternalStore.
 * Screens subscribe, writes replace the array, React re-renders. That is all a
 * demo needs, and it keeps the shape of the data identical to what the API will
 * return.
 *
 * TODO(contributor): back this with @steppal/sdk
 * Replace the mutators with API calls and the reads with TanStack Query.
 * The exported hook signatures should not have to change.
 * difficulty: medium
 */

type Listener = () => void;

let pots: Pot[] = [...seedPots];
/** Pots you can join by code but are not a member of yet. */
let joinable: Pot[] = [
  {
    id: 'ikeja-early-birds',
    name: joinablePot.name,
    mode: joinablePot.mode,
    status: 'active',
    stakeKobo: joinablePot.stakeKobo,
    potKobo: joinablePot.stakeKobo * joinablePot.members,
    dayOf: 0,
    totalDays: 7,
    inviteCode: joinablePot.code,
    members: [
      { id: 'h1', name: joinablePot.host, steps: 0, daysMet: 0 },
      { id: 'h2', name: 'Femi', steps: 0, daysMet: 0 },
      { id: 'h3', name: 'Nneka', steps: 0, daysMet: 0 },
      { id: 'h4', name: 'Tobi', steps: 0, daysMet: 0 },
    ],
    chat: [],
  },
];

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* ------------------------------------------------------------------ reads */

export function usePots(): Pot[] {
  return useSyncExternalStore(
    subscribe,
    () => pots,
    () => pots,
  );
}

export function usePot(id?: string): Pot | undefined {
  const all = usePots();
  return all.find((p) => p.id === id);
}

export function useActivePot(): Pot | undefined {
  return usePots().find((p) => p.status === 'active');
}

/* ----------------------------------------------------------------- writes */

/**
 * Invite codes read out loud and get typed by hand, so: four letters from the
 * pot name, four digits, no ambiguous characters. Uniqueness is checked against
 * every code the app knows about.
 */
export function generateInviteCode(name: string): string {
  const letters = (name.replace(/[^a-zA-Z]/g, '').toUpperCase() + 'POT').slice(0, 4);
  const taken = new Set([...pots, ...joinable].map((p) => p.inviteCode));

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const code = `${letters}-${digits}`;
    if (!taken.has(code)) return code;
  }
  return `${letters}-${Date.now().toString().slice(-4)}`;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const taken = new Set(pots.map((p) => p.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export type NewPot = {
  name: string;
  mode: PotMode;
  stakeKobo: number;
  dailyGoal: number;
};

/** Creates the pot, puts you in it, holds your stake. Returns the new pot. */
export function createPot(input: NewPot): Pot {
  const pot: Pot = {
    id: slugify(input.name),
    name: input.name.trim(),
    mode: input.mode,
    status: 'active',
    stakeKobo: input.stakeKobo,
    potKobo: input.stakeKobo,
    dayOf: 1,
    totalDays: 7,
    inviteCode: generateInviteCode(input.name),
    members: [{ id: 'me', name: 'You', steps: 0, daysMet: 0, isYou: true }],
    chat: [
      {
        id: `sys-${Date.now()}`,
        name: '',
        body: `${user.name} started the pot · ${input.dailyGoal.toLocaleString('en-NG')} steps a day`,
        time: 'now',
        kind: 'system',
      },
    ],
  };

  pots = [pot, ...pots];
  emit();
  return pot;
}

/** Looks a code up without joining. Used for the preview before staking. */
export function findByCode(code: string): Pot | undefined {
  const needle = code.trim().toUpperCase();
  return [...joinable, ...pots].find((p) => p.inviteCode.toUpperCase() === needle);
}

/** Adds you to a joinable pot and moves it into your list. Returns the pot. */
export function joinByCode(code: string): Pot | undefined {
  const found = findByCode(code);
  if (!found) return undefined;
  if (pots.some((p) => p.id === found.id)) return found;

  const joined: Pot = {
    ...found,
    potKobo: found.potKobo + found.stakeKobo,
    members: [...found.members, { id: 'me', name: 'You', steps: 0, daysMet: 0, isYou: true }],
    chat: [
      ...found.chat,
      {
        id: `sys-${Date.now()}`,
        name: '',
        body: `${user.name} joined`,
        time: 'now',
        kind: 'system',
      },
    ],
  };

  joinable = joinable.filter((p) => p.id !== found.id);
  pots = [joined, ...pots];
  emit();
  return joined;
}

export function sendMessage(potId: string, body: string) {
  const text = body.trim();
  if (!text) return;

  const message: ChatMessage = {
    id: `local-${Date.now()}`,
    name: 'You',
    body: text,
    time: 'now',
    kind: 'text',
    isYou: true,
  };

  pots = pots.map((p) => (p.id === potId ? { ...p, chat: [...p.chat, message] } : p));
  emit();
}
