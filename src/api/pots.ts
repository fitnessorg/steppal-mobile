import type { Member, Pot } from '../mock/data';
import type { PotDetail, PotSummary } from '../sdk';
import { api } from './client';
import { currentUser } from '../session';

/**
 * Translates server pots into the shape the screens already render.
 *
 * The app's `Pot` carries things the API has no concept of — a chat thread, a
 * `mode`, a day counter. Those are presentation, and inventing server fields
 * for them would mean a schema change every time the UI changed its mind. So
 * the mapping fills them here and the screens stay untouched.
 */

function daysElapsed(startsOn: string, endsOn: string): { dayOf: number; totalDays: number } {
  const start = new Date(`${startsOn}T00:00:00`);
  const end = new Date(`${endsOn}T00:00:00`);
  const day = 24 * 60 * 60 * 1000;

  const totalDays = Math.round((end.getTime() - start.getTime()) / day) + 1;
  const elapsed = Math.round((Date.now() - start.getTime()) / day) + 1;

  return { totalDays, dayOf: Math.min(Math.max(elapsed, 1), totalDays) };
}

export function toAppPot(detail: PotDetail): Pot {
  const meId = currentUser()?.id;
  const { dayOf, totalDays } = daysElapsed(detail.startsOn, detail.endsOn);

  const members: Member[] = detail.members.map((m) => ({
    id: m.userId,
    name: m.userId === meId ? 'You' : m.displayName,
    steps: m.totalSteps,
    daysMet: m.daysHit,
    ...(m.userId === meId ? { isYou: true as const } : {}),
  }));

  const mine = detail.results?.find((r) => r.userId === meId);

  return {
    id: detail.id,
    name: detail.name,
    // Every pot on the server settles by forfeit; "winner takes all" was a
    // demo-only variant and the settlement engine never implemented it.
    mode: 'forfeit',
    status: detail.status === 'settled' ? 'settled' : 'active',
    stakeKobo: detail.stakeKobo,
    potKobo: detail.stakeKobo * detail.memberCount,
    dayOf,
    totalDays,
    inviteCode: detail.inviteCode,
    members,
    // TODO(contributor): pot chat has no server yet
    // Messages live only on the device that sent them. Add a messages table and
    // a websocket in steppal-core, then read the thread here.
    // difficulty: hard
    chat: [],
    ...(mine ? { payoutKobo: mine.payoutKobo } : {}),
  };
}

/** A summary has no members, so standings come back empty until opened. */
export function summaryToAppPot(summary: PotSummary): Pot {
  return toAppPot({ ...summary, members: [] });
}

export async function fetchPots(): Promise<Pot[]> {
  const summaries = await api().listPots();
  return summaries.map(summaryToAppPot);
}

export async function fetchPot(id: string): Promise<Pot> {
  return toAppPot(await api().getPot(id));
}

export async function createPotRemote(input: {
  name: string;
  dailyGoal: number;
  stakeKobo: number;
}): Promise<Pot> {
  const summary = await api().createPot({
    name: input.name,
    dailyGoal: input.dailyGoal,
    stakeKobo: input.stakeKobo,
    days: 7,
  });
  return summaryToAppPot(summary);
}

export async function findByCodeRemote(code: string): Promise<Pot | undefined> {
  try {
    return summaryToAppPot(await api().potByCode(code));
  } catch {
    return undefined;
  }
}

export async function joinByCodeRemote(code: string): Promise<Pot> {
  return summaryToAppPot(await api().joinPot(code));
}
