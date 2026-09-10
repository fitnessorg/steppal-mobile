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
