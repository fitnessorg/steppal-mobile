/**
 * Tiny in-memory session flags.
 *
 * TODO(contributor): persist onboarding state
 * Resets on every cold start, which suits a demo but not a real install. Store
 * it and read it before the first navigation so returning users skip straight
 * to Today.
 * difficulty: easy
 */
let seenOnboarding = false;

export function hasSeenOnboarding() {
  return seenOnboarding;
}

export function markOnboardingSeen() {
  seenOnboarding = true;
}
