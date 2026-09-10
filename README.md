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
