# Android Local QA Setup

Last checked: 2026-05-01

This checklist prepares a local Android emulator for Phase 3 Quick Add persistence QA. It does not add new product behavior, migrations, live safe-to-spend, reconciliation, mobile CSV import, or Phase 4 work.

## Android Studio Setup

From the Android Studio Welcome screen:

1. Click **More Actions**.
2. Click **Virtual Device Manager**.
3. Click **Create Device**.
4. Select **Pixel 7** or **Pixel 8**.
5. Select the latest stable Android system image.
6. Download the image if Android Studio prompts for it.
7. Click **Finish**.
8. Start the emulator with the Play button.

## ADB Check

Use the SDK-local `adb` if `adb` is not on the shell PATH:

```sh
~/Library/Android/sdk/platform-tools/adb devices
```

Expected result when the emulator is running:

```text
emulator-5554	device
```

Optional PATH setup for future shells:

```sh
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
```

## Required Mobile Env

Local Android emulator QA needs:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_APP_SCHEME=dart-finance
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

`10.0.2.2` is the Android emulator alias for the host Mac. Inside the emulator, `localhost` points at the Android device itself, not the Next.js dev server running on macOS.

Only public/client-safe values belong in `apps/mobile/.env.local`. Do not add Supabase service-role keys, private keys, or server secrets to mobile env files.

## Start Servers

Start the web dev server from the repo root:

```sh
pnpm --dir apps/web dev
```

Start the mobile Expo server from a second terminal:

```sh
pnpm --dir apps/mobile start -- --clear
```

When the Expo terminal is ready, press `a` to open the app on the running Android emulator.

## Quick Add Manual QA

1. Start the web dev server.
2. Start the mobile Expo server.
3. Open the Android emulator.
4. Press `a` in the Expo terminal.
5. Sign in.
6. Confirm the auth callback returns to the app.
7. Open Quick Add.
8. Enter `1240`.
9. Confirm the UI formats it as `EUR 12.40` / `€12.40`.
10. Select a category.
11. Save.
12. Confirm the success state.
13. Check the web Transactions page for the new manual expense.
14. Confirm `source = manual` if visible, or inspect DB/API if available.
15. Confirm `import_batch_id = null` if inspectable.
16. Sign out.
17. Confirm a signed-out user cannot save.

## No Active Account Behavior

If the signed-in user has no active account available for manual transaction creation, the mobile API is expected to return `422`. QA should treat that as an honest setup/data prerequisite failure, not as a mobile crash. Create or select an active account through the existing supported flow before retrying Quick Add persistence.

## Verification Results

Commands run locally on 2026-05-01:

```sh
pnpm install
pnpm --dir apps/mobile exec expo install --check
npx expo-doctor
pnpm tsc --noEmit
pnpm --dir apps/mobile typecheck
pnpm --filter @dart/mobile typecheck
pnpm --filter @dart/mobile test
pnpm --filter @dart/web test
pnpm test
pnpm typecheck
```

Results:

- `pnpm install`: passed.
- `pnpm --dir apps/mobile exec expo install --check`: passed after SDK 52 dependency alignment.
- `npx expo-doctor`: passed, 17/17 checks.
- `pnpm tsc --noEmit`: passed.
- `pnpm --dir apps/mobile typecheck`: passed after refreshing workspace dependencies with `pnpm install`.
- `pnpm --filter @dart/mobile typecheck`: passed after refreshing workspace dependencies with `pnpm install`.
- `pnpm --filter @dart/mobile test`: passed, 25 tests.
- `pnpm --filter @dart/web test`: passed, 115 tests.
- `pnpm test`: passed, 190 total tests across mobile, web, and core.
- `pnpm typecheck`: failed on the known pre-existing `apps/web/src/transactions/matching.test.ts` `exactOptionalPropertyTypes` issue.

Secret scan:

```sh
rg -n "service role|service_role|SUPABASE_SERVICE_ROLE|SECRET|PRIVATE_KEY" apps/mobile || true
```

Result: no mobile service-role or private-key marker matches found.

## Troubleshooting

- If `adb` is not found, use `~/Library/Android/sdk/platform-tools/adb` directly or add that directory to PATH.
- If `adb devices` shows no emulator, confirm the Android Studio device is fully booted and unlocked.
- If mobile cannot reach the API, confirm `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000` and that `pnpm --dir apps/web dev` is running.
- If `.env.local` changes, restart Expo with `pnpm --dir apps/mobile start -- --clear` so Metro reloads public Expo env values.
- If Metro reports `Unable to resolve "@babel/runtime/helpers/interopRequireDefault"`, confirm `@babel/runtime` is installed in `apps/mobile/package.json`, then run `pnpm install`.
- If Expo reports `Unable to resolve asset "./assets/icon.png"`, confirm `apps/mobile/assets/icon.png` exists. The current PNG is a local QA placeholder and should be replaced with the final Dart Finance brand icon before beta release.
- If Android shows a `react-native-screens` Fabric/codegen error such as `Unknown prop type for "type": "undefined"`, confirm SDK 52-compatible native navigation packages are installed with `pnpm --dir apps/mobile exec expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated`.
- If `expo-doctor` reports missing Expo peer dependencies, run `pnpm --dir apps/mobile exec expo install expo-font expo-constants expo-linking`.
- If `expo-doctor` reports SDK version mismatches, prefer `pnpm --dir apps/mobile exec expo install <package>` for the named package instead of broad manual upgrades.
- If Expo Go reports a version mismatch, update Expo Go in the emulator to the SDK 52-compatible version recommended by the Expo terminal. This is emulator app state, not a repo code change.
- If Android shows a 16 KB page size compatibility warning, treat it as non-blocking unless the app still crashes after Metro bundling and runtime dependency issues are fixed.
- If auth callback does not return to the app, confirm the app scheme is `dart-finance` and the Supabase dashboard redirect URLs include the mobile callback URL used by the app.
- If Quick Add returns `401`, sign in again and confirm the mobile app has a fresh Supabase session.
- If Quick Add returns `422`, confirm the user has an active account available for manual transaction creation.
- If Expo does not open Android after pressing `a`, confirm the emulator is visible in `adb devices`, then restart the Expo server.
