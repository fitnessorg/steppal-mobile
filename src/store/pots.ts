import { useSyncExternalStore } from 'react';
import {
  joinablePot,
  pots as seedPots,
  user,
  type ChatMessage,
  type Pot,
  type PotMode,
} from '../mock/data';
import { isLive } from '../api/client';
import {
  createPotRemote,
  fetchPot,
  fetchPots,
  findByCodeRemote,
  joinByCodeRemote,
} from '../api/pots';

/**
 * In-memory pot store.
 *
 * Deliberately dependency-free: a module-level array plus useSyncExternalStore.
 * Screens subscribe, writes replace the array, React re-renders. That is all a
 * demo needs, and it keeps the shape of the data identical to what the API will
 * return.
 *
 * With EXPO_PUBLIC_API_URL set it is a cache in front of the API instead: the
 * mutators call the server and replace the array with what came back, and the
 * screens never learn the difference. Reads stay synchronous, which is what
 * keeps every screen unchanged between the two modes.
 *
 * TODO(contributor): replace the hand-rolled cache with TanStack Query
 * This has no retry, no stale-while-revalidate and no request de-duplication.
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

/**
 * Pulls the signed-in user's pots from the server.
 *
 * A no-op in demo mode, so screens can call it on mount without branching.
 */
export async function hydratePots(): Promise<void> {
  if (!isLive()) return;
  try {
    pots = await fetchPots();
    emit();
  } catch {
    // Keep whatever is already on screen. A failed refresh should not blank
    // a list the user was reading on a moving bus.
  }
}

/** Refreshes one pot with its standings, which the list view does not carry. */
export async function hydratePot(id: string): Promise<void> {
  if (!isLive()) return;
  try {
    const fresh = await fetchPot(id);
    pots = pots.some((p) => p.id === id)
      ? pots.map((p) => (p.id === id ? { ...fresh, chat: p.chat } : p))
      : [fresh, ...pots];
    emit();
  } catch {
    // Same reasoning as above.
  }
}

/** Creates the pot, puts you in it, holds your stake. Returns the new pot. */
export async function createPot(input: NewPot): Promise<Pot> {
  if (isLive()) {
    const pot = await createPotRemote({
      name: input.name.trim(),
      dailyGoal: input.dailyGoal,
      stakeKobo: input.stakeKobo,
    });
    pots = [pot, ...pots];
    emit();
    return pot;
  }

  return createPotLocal(input);
}

function createPotLocal(input: NewPot): Pot {
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
export async function findByCode(code: string): Promise<Pot | undefined> {
  if (isLive()) return findByCodeRemote(code.trim());

  const needle = code.trim().toUpperCase();
  return [...joinable, ...pots].find((p) => p.inviteCode.toUpperCase() === needle);
}

/** Adds you to a joinable pot and moves it into your list. Returns the pot. */
export async function joinByCode(code: string): Promise<Pot | undefined> {
  if (isLive()) {
    const joined = await joinByCodeRemote(code.trim());
    pots = [joined, ...pots.filter((p) => p.id !== joined.id)];
    emit();
    return joined;
  }

  const found = await findByCode(code);
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
