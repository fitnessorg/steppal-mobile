# Contributor tasks

Every `TODO(contributor)` comment in this repo, collected as issue-ready
entries. Grep for them any time:

```bash
grep -rn "TODO(contributor)" app src
```

If you start one, comment on the matching issue (or open one using the entry as
the body) so work does not collide.

---

## Good first issues

### Persist onboarding state [COMPLETED]

**File:** `src/session.ts` · **Difficulty:** easy

_Status:_ Resolved. Onboarding completion is persisted in `tokenStore` under `steppal.onboarding_seen` and read during `bootstrapSession()` prior to initial routing.

### Persist the theme choice [COMPLETED]

**File:** `src/components/ui.tsx`, `src/theme.ts`, `app/_layout.tsx` · **Difficulty:** easy

_Status:_ Resolved. User theme preference (`light`, `dark`, or `system`) is persisted via `persistTheme()` and applied in `RootLayout` before hiding the native splash screen, preventing cold-start theme flashes.

### Empty states for the live pot list [COMPLETED]

**File:** `app/(tabs)/pots.tsx` · **Difficulty:** easy

_Status:_ Resolved. Configured helpful empty state callout in `app/(tabs)/pots.tsx` displaying guidance and quick actions to start or join a pot when the list has no running or finished pots.

---

## Wiring the app to the server

### Queue failed step uploads [COMPLETED]

**File:** `app/(tabs)/home.tsx`, `src/api/steps.ts` · **Difficulty:** medium

_Status:_ Resolved. Failed step submissions are saved in persistent storage (`steppal.offline_steps_queue`) and deduplicated on `(user, day)`. The queue automatically flushes and retries upon reconnection, app foreground (`AppState`), and manual sync, guaranteeing no lost steps and no double-counting.

### Pot chat needs a server

**File:** `src/api/pots.ts` · **Difficulty:** hard

Messages live only on the device that sent them, so the chat in a shared pot is
not actually shared. Add a messages table and a websocket to steppal-core, then
read the thread here.

Decide what happens to the backlog when someone joins mid-pot, and whether
system messages ("Tunde joined") are stored or derived.

### Live standings instead of polling

**File:** `app/pot/[id].tsx` · **Difficulty:** medium

The pot screen pulls once when opened. A pot is a group watching each other, and
a screen that only updates on open feels dead. Subscribe once steppal-core
exposes the socket.

### Wire the wallet to a payment provider

**File:** `app/(tabs)/wallet.tsx` · **Difficulty:** hard

Both buttons are inert. steppal-core exposes the endpoints behind a
`PaymentProvider` interface, and the mock provider credits instantly — so this
can be built end to end with no payment account at all.

The hard half is **disbursement**, not collection: paying a winner who is not
the merchant. Check the provider has a transfer API before writing a line.

### Connect the feed to the escrow contract

**File:** `src/store/feed.ts` · **Difficulty:** hard

Pledges, tips and sponsored goals are mock-only. The shapes already mirror
`goal-escrow`: `createPledge` maps to `create_goal`, `tip` to `fund`,
`markAttested` to `attest`, `claim` to `claim`. The contract is deployed to
testnet at `CCEMDKD4POJ4H2EF3JSY73W33OVB34X7KWV7UM6VRESTPNTHJ4OG37TT`.

The oracle signature and the 24-hour challenge window live on chain; this store
only has to reflect them.

---

## Health and platform

### Finish the Health Connect permission flow [COMPLETED]

**File:** `app/onboarding.tsx`, `app/(tabs)/profile.tsx`, `src/health/healthConnect.ts` · **Difficulty:** hard

_Status:_ Resolved. Devices missing Health Connect receive direct Google Play Store deep links (with web fallback), and users who declined permission can inspect health connection status and grant permission or open settings directly from the Profile (You) tab.

### iOS support

**File:** `src/health/` · **Difficulty:** hard

Android only today. HealthKit is the iOS equivalent; the `StepSource` interface
already exists for exactly this, so no screen should need to change.

### Rematch creates the next pot [COMPLETED]

**File:** `app/pot/result/[id].tsx`, `app/pot/create.tsx` · **Difficulty:** medium

_Status:_ Resolved. Tapping "Run it back" routes to `app/pot/create.tsx` prefilled with the pot name, settlement mode, stake, and daily step goal via `useLocalSearchParams`.

---

## Testing

### There are no tests [COMPLETED]

**Difficulty:** medium

_Status:_ Resolved. Configured `jest-expo` test harness and authored 13 unit test suites (92 tests) covering `src/api/pots.ts` (including boundary date calculations), `src/store/pots.ts` (demo/live shape parity and actions), `src/api/steps.ts` (persistent offline step queue and deduplication), `src/health/` (Health Connect recovery, Pedometer, Mock, and graceful native fallback), `src/api/client.ts`, `src/api/storage.ts`, `src/store/feed.ts`, `src/session.ts`, and `src/theme.ts`.
