# Contributing to StepPal Mobile

Thanks for picking this up. A few things worth knowing before you start.

## The UI is intentionally ugly — please don't restyle it

This app is built to ~65% on purpose, with the UI kept deliberately plain: system fonts, one accent
colour, no custom components beyond what's strictly needed, no animations. It **will** be redesigned
later as a separate effort. If you spend a weekend making a screen pretty, that work will very likely
be thrown away. Please put your effort into `TODO(contributor)` tasks instead — see
[CONTRIBUTING-TASKS.md](./CONTRIBUTING-TASKS.md) for the full list, grouped easiest first.

## Finding something to work on

1. Check [CONTRIBUTING-TASKS.md](./CONTRIBUTING-TASKS.md) for tasks pulled straight from
   `TODO(contributor)` comments in the code.
2. Grep the codebase for `TODO(contributor)` directly — the list file and the code should always agree;
   if they don't, that's itself worth a small PR.
3. Comment on the matching GitHub issue (or open one) before starting, so two people don't build the
   same thing.

## Branch naming

```
<type>/<short-description>
```

Examples: `feat/pot-detail-leaderboard`, `fix/otp-resend-timer`, `chore/upgrade-expo-sdk`.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(pots): add pot detail screen
fix(auth): correct OTP resend countdown
chore(deps): bump expo-router
```
