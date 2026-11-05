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

*Status:* Resolved. Onboarding completion is persisted in `tokenStore` under `steppal.onboarding_seen` and read during `bootstrapSession()` prior to initial routing.

### Persist the theme choice [COMPLETED]
**File:** `src/components/ui.tsx`, `src/theme.ts`, `app/_layout.tsx` · **Difficulty:** easy

*Status:* Resolved. User theme preference (`light`, `dark`, or `system`) is persisted via `persistTheme()` and applied in `RootLayout` before hiding the native splash screen, preventing cold-start theme flashes.

### Empty states for the live pot list
**File:** `app/(tabs)/pots.tsx` · **Difficulty:** easy

In live mode a new account has no pots and the list renders nothing at all.
Show something that explains how to start or join one.

---

## Wiring the app to the server

### Queue failed step uploads
**File:** `app/(tabs)/home.tsx`, `src/api/steps.ts` · **Difficulty:** medium

Steps sync on foreground. A failed upload is retried on the *next* foreground,
which on a bad connection can be hours. Queue them and flush on reconnect.

The endpoint is idempotent on `(user, day)`, so replaying a queue is safe by
construction — a duplicate flush changes nothing.

**Done when:** steps recorded offline arrive after reconnection, with no
double-counting.

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

### Finish the Health Connect permission flow
**File:** `app/onboarding.tsx`, `src/health/healthConnect.ts` · **Difficulty:** hard

Permission is requested and failures are handled, but the "Health Connect is
not installed" case only shows an alert. Add a Play Store deep link, and a way
back into the flow from the You tab for someone who declined.

**Done when:** a device with no Health Connect gets a working route to install
it, and a declined permission can be granted later without reinstalling.

### iOS support
**File:** `src/health/` · **Difficulty:** hard

Android only today. HealthKit is the iOS equivalent; the `StepSource` interface
already exists for exactly this, so no screen should need to change.

### Rematch creates the next pot
**File:** `app/pot/result/[id].tsx` · **Difficulty:** medium

Most groups never recreate a pot by hand, but almost all will tap "Run it
back". Prefill the create form with the same members, stake and goal.

---

## Testing

### There are no tests
**Difficulty:** medium

steppal-core has 43. This repo has none. Start with the parts where a bug is
silent rather than loud:

- `src/api/pots.ts` — the mapping from server pot to screen pot, especially
  `daysElapsed` around month boundaries and the final day.
- `src/store/pots.ts` — that live mode and demo mode produce the same shapes.
- `src/health/index.ts` — that a missing native module falls back rather than
  throwing.

Use `jest-expo` and React Native Testing Library. Snapshot tests of screens are
not what is needed here; the logic is.
