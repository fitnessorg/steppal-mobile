# StepPal Mobile

StepPal is a group step-count challenge app: friends form a pot, each stakes money, and the pot is
settled at the end of the week based on who hit their step goals. This repo is the Android mobile
client, built with [Expo](https://expo.dev) and [expo-router](https://docs.expo.dev/router/introduction/).

This app talks to the StepPal backend exclusively through the [`@steppal/sdk`](https://github.com/)
package (from the `steppal-core` repo) — there is no raw `fetch` to the API anywhere in this codebase.

> **Status: ~65% built, on purpose.** This is an open-source project and large parts are deliberately
> left unfinished and marked `TODO(contributor)` so there's real work for contributors to pick up.
> See [CONTRIBUTING-TASKS.md](./CONTRIBUTING-TASKS.md) for the full list, and
> [CONTRIBUTING.md](./CONTRIBUTING.md) for how to submit a PR.

The UI is intentionally plain — no design polish, no animations, no custom components beyond what's
needed to show correct data and correct states. It will be redesigned later; right now it exists to
prove the app works.

## Why a "development build" and not Expo Go?

This app uses native modules (like `react-native-health-connect` for reading step data) that aren't
included in the stock Expo Go app you'd download from the Play Store. So instead of Expo Go, you build
your **own** custom version of the Expo client — called a _development build_ — that has those native
modules baked in. You install that once on your phone, and after that you can keep using the normal
fast JavaScript-only dev server (`npm start`) without rebuilding, the same way you would with Expo Go.

You only need to rebuild the development build when a _native_ dependency changes (a new native module,
a permission, an `app.json` native config change) — not when you change React code.

## Prerequisites

- **Node.js 20+** and npm
- An **Expo account** (free) — sign up at [expo.dev](https://expo.dev)
- An **Android phone** with USB debugging, or an Android emulator
- Windows, macOS, or Linux — this guide uses generic commands that work on all three

You do **not** need Android Studio installed to build with EAS (Expo's cloud build service does the
native build for you). You only need Android Studio if you want to build locally, which this guide
doesn't cover.

## 1. Clone and install

```bash
git clone <this-repo-url>
cd steppal-mobile
npm install
```

This project's `.npmrc` sets `legacy-peer-deps=true`. Some Expo SDK 57 packages currently ship peer
dependency ranges that npm's default (strict) resolver rejects even though the versions are compatible
in practice — this is a known upstream quirk, not a project-specific hack. `npm ci`/`npm install` will
pick this setting up automatically.

## 2. Log in to Expo/EAS

```bash
npx eas-cli login
```

If you don't have an Expo account yet, create one first at [expo.dev/signup](https://expo.dev/signup)
(or run `npx eas-cli register`).

## 3. Link this project to an EAS project

```bash
npx eas-cli init
```

This creates a project on your Expo account and writes an `extra.eas.projectId` into `app.json`. You
only need to do this once per clone/fork.

## 4. Build a development client for your phone

```bash
npx eas-cli build --profile development --platform android
```

This uploads your code to Expo's cloud build servers and compiles a real Android `.apk` with all native
modules included — takes roughly 10–20 minutes the first time. When it's done, the terminal (and the
[expo.dev](https://expo.dev) build page) will give you a link/QR code to download the `.apk`.

### Installing the APK on your phone

1. On your Android phone, open the build link from a browser (or scan the QR code EAS prints).
2. Download the `.apk`. Android will warn about installing from an unknown source — allow it for this
   file. This is normal for development builds; it's not a Play Store app yet.
3. Open the installed app once — you'll see a small "development client" screen, not your app yet.
   That's expected; it's waiting for a dev server to connect to.

## 5. Start the dev server

```bash
npm start
```

This prints a QR code. With the StepPal development client app open on your phone (same Wi-Fi network
as your computer), scan the QR code from inside the app (there's a scan button in the dev client), or
type the URL manually. The app will load and connect — from here on, editing and saving any file
hot-reloads on your phone in under a second, no rebuild needed.

## Everyday development after the first build

You only need to redo steps 4 (EAS build) when native config changes. Day to day:

```bash
npm start
```

...and keep the app open on your phone.

## Environment variables

Later phases add a `.env.example` for things like the API base URL and step-source mode
(`MockStepSource` vs. `HealthConnectStepSource`). Nothing needs `.env` yet at this stage — this section
will be filled in as those phases land. `.env` is gitignored; never commit real secrets.

## Useful scripts

| Command                 | What it does                                              |
| ------------------------ | ----------------------------------------------------------- |
| `npm start`             | Start the Metro dev server                                |
| `npm run android`       | Start dev server and open on a connected device/emulator  |
| `npm run lint`          | ESLint                                                     |
| `npm run format`        | Prettier — writes fixes                                   |
| `npm run format:check`  | Prettier — check only (used in CI)                         |
| `npm run typecheck`     | TypeScript, no emit                                        |

## Tech stack

- **Expo** (managed workflow, development build) + **expo-router** (file-based navigation)
- **NativeWind** (Tailwind classes for React Native styling)
- **TanStack Query** for server state, **Zustand** for local state
- **`react-native-health-connect`** for Android step data, behind a `StepSource` interface so an
  iOS/HealthKit implementation can be added later without touching call sites
- **expo-secure-store** for auth tokens
- **`@steppal/sdk`** for all backend calls

## Project structure

```
app/                  expo-router screens (file-based routing)
CONTRIBUTING-TASKS.md every TODO(contributor) as a ready-to-file issue
```

(`lib/` for the `StepSource` interface and SDK client setup arrives in later phases.)

## License

MIT — see [LICENSE](./LICENSE).
