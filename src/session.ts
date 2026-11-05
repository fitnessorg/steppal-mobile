import { useSyncExternalStore } from 'react';
import { api, isLive, onTokenChange, restoreSession } from './api/client';
import { tokenStore } from './api/storage';
import type { User } from './sdk';

/**
 * Who is signed in, and whether we have finished asking.
 *
 * The three-state `status` matters more than it looks. Without "loading", the
 * app flashes the sign-in screen for a frame on every cold start while the
 * keychain read is in flight, and a returning user sees a login form they do
 * not need. Routing waits for a definite answer.
 */

export type SessionState =
  { status: 'loading' } | { status: 'signed-out' } | { status: 'signed-in'; user: User };

let state: SessionState = { status: 'loading' };
const listeners = new Set<() => void>();

function set(next: SessionState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSession(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function currentUser(): User | null {
  return state.status === 'signed-in' ? state.user : null;
}

/**
 * Called once at launch.
 *
 * In demo mode there is nothing to restore and no server to ask, so it signs
 * in a local stand-in immediately — the mock screens expect a user.
 */
export async function bootstrapSession(): Promise<SessionState> {
  try {
    const stored = await tokenStore().get(ONBOARDING_KEY);
    seenOnboarding = stored === 'true';
  } catch {
    // If storage read fails, leave default in-memory state
  }

  if (!isLive()) {
    set({ status: 'signed-in', user: DEMO_USER });
    return state;
  }

  const tokens = await restoreSession();
  if (!tokens) {
    set({ status: 'signed-out' });
    return state;
  }

  try {
    // The access token is probably expired after a night in a pocket; the SDK
    // refreshes and retries inside this one call.
    set({ status: 'signed-in', user: await api().me() });
  } catch {
    set({ status: 'signed-out' });
  }

  return state;
}

export function setSignedIn(user: User) {
  set({ status: 'signed-in', user });
}

export async function signOut() {
  if (isLive()) await api().logout();
  set({ status: 'signed-out' });
}

/** The SDK clears tokens when a refresh token is dead. Follow it out. */
onTokenChange((tokens) => {
  if (!tokens && isLive() && state.status === 'signed-in') {
    set({ status: 'signed-out' });
  }
});

export const DEMO_USER: User = {
  id: 'demo-user',
  phone: '+2348000000000',
  displayName: 'You',
  avatarSeed: 'you',
  dailyGoal: 10000,
};

/* ------------------------------------------------------------- onboarding */

export const ONBOARDING_KEY = 'steppal.onboarding_seen';
let seenOnboarding = false;

export function hasSeenOnboarding() {
  return seenOnboarding;
}

export function markOnboardingSeen() {
  seenOnboarding = true;
  void tokenStore()
    .set(ONBOARDING_KEY, 'true')
    .catch(() => {});
}

export function resetOnboardingForTest() {
  seenOnboarding = false;
}
