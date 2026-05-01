# 84 — Android Local QA Setup Guide

Date: 2026-04-30
Scope: Phase 3 Quick Add persistence — local Android testing on macOS.

This guide covers Android Studio installation, emulator setup, env configuration,
starting both servers, and a step-by-step Quick Add QA checklist.

---

## Prerequisites

- macOS (Apple Silicon or Intel)
- Homebrew installed (`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)
- Node.js 20+ and pnpm installed (`npm install -g pnpm`)
- Dart Finance repo cloned and `pnpm install` passing
- A Supabase project with a test account and magic-link auth enabled
- A Dart Finance account in that Supabase project with at least one active account row (required for Quick Add persistence)

---

## 1. Install Android Studio on macOS

1. Download Android Studio from the official site:
   https://developer.android.com/studio

   Choose the **macOS** download. For Apple Silicon, use the `.dmg` labelled **Apple Silicon (ARM)**.

2. Open the `.dmg` and drag Android Studio to `/Applications`.

3. Launch Android Studio. On first run, complete the **Setup Wizard**:
   - Choose **Standard** installation.
   - Accept all SDK license agreements when prompted.
   - Let it download the Android SDK, SDK Tools, and emulator components.

4. After the wizard finishes, verify the SDK path at:

   ```
   Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
   ```

   Note the **Android SDK Location** path (usually `~/Library/Android/sdk`).

5. Add Android tools to your shell PATH. Add these lines to `~/.zshrc` or `~/.bashrc`:

   ```bash
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
   ```

   Reload your shell:

   ```bash
   source ~/.zshrc
   ```

6. Verify the tools are on PATH:

   ```bash
   adb --version
   emulator -list-avds
   ```

---

## 2. Android SDK Setup

Android Studio installs the SDK automatically. For Expo SDK 52 (used by `apps/mobile`), you need at least **Android API level 34**.

To verify and install required SDK components:

1. Open Android Studio → **SDK Manager** (the icon in the top toolbar, or via Settings).
2. In the **SDK Platforms** tab, check that **Android 14.0 (API 34)** is installed. If not, tick it and click **Apply**.
3. In the **SDK Tools** tab, confirm these are installed:
   - Android SDK Build-Tools 34
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel HAXM (Intel Macs only) or Android Emulator Hypervisor Driver (Apple Silicon)

---

## 3. Create an Android Virtual Device (Emulator)

1. Open Android Studio → **Virtual Device Manager** (toolbar icon, or **Tools → Device Manager**).
2. Click **Create Device** (or **+** button).
3. Choose a hardware profile. Recommended: **Pixel 7** (medium screen, widely compatible with Expo).
4. Click **Next**.
5. Select a system image. Recommended:

   | Property | Value |
   |----------|-------|
   | Release name | UpsideDownCake |
   | API level | 34 |
   | ABI | arm64-v8a (Apple Silicon) or x86_64 (Intel) |
   | Target | Android 14.0 (Google APIs) |

   If the image is not downloaded, click the **Download** button next to it.

6. Click **Next** → **Finish**. The AVD appears in the Device Manager list.

---

## 4. Start the Android Emulator

### From Android Studio Device Manager

Click the **Run** (triangle) button next to your AVD in the Device Manager.

### From the terminal (after setup)

```bash
# List available AVDs
emulator -list-avds

# Start a specific AVD (replace name with your AVD name from the list)
emulator -avd Pixel_7_API_34
```

Wait for the emulator to fully boot to the Android home screen before proceeding.

---

## 5. Configure `apps/mobile/.env.local`

The mobile app reads environment variables from `apps/mobile/.env.local`. This file is gitignored — you must create it locally.

Copy the example file:

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

Edit `apps/mobile/.env.local` with your real values:

```bash
# Supabase project credentials (public/anon-safe values only)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_APP_SCHEME=dart-finance

# Web API base URL — used by the mobile API client to call /api/mobile/* routes
# Android emulator: use 10.0.2.2 (the emulator's alias for the Mac host)
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

> **Never add** `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, or `POSTGRES_URL` to any mobile env file.

### For a real Android device (instead of emulator)

The emulator uses `10.0.2.2` to reach the Mac host. A real device on the same Wi-Fi network must use your Mac's LAN IP address instead.

Find your Mac's LAN IP:

```bash
ipconfig getifaddr en0
```

Use that IP in `.env.local`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.x:3000
```

---

## 6. Configure Supabase Auth Redirect URL

For magic-link sign-in to reach the mobile app, add the custom scheme callback to your Supabase project's allowed redirect URLs.

1. Go to your Supabase project dashboard.
2. Navigate to **Authentication → URL Configuration**.
3. Under **Redirect URLs**, add:

   ```
   dart-finance://auth/callback
   ```

4. Confirm **Email** auth (magic links / OTP) is enabled under **Authentication → Providers → Email**.

---

## 7. Start the Next.js Web Server

The mobile API routes (`/api/mobile/categories`, `/api/mobile/transactions/manual`) run as part of the Next.js web app. The web server must be running before Quick Add can persist.

### Standard start (emulator only)

```bash
pnpm --dir apps/web dev
```

This starts Next.js on `http://localhost:3000`. The Android emulator accesses it via `http://10.0.2.2:3000`.

### For a real Android device on the same Wi-Fi

Next.js dev server binds to `localhost` by default, which is not reachable from other devices. To bind to all interfaces:

```bash
pnpm --dir apps/web dev -- --hostname 0.0.0.0
```

Then set `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.x:3000` (your Mac's LAN IP) in `apps/mobile/.env.local`.

> The web server also requires `DATABASE_URL` and Supabase env vars in `apps/web/.env.local` to insert transactions. Without them, the API routes return `503 DATABASE_NOT_CONFIGURED`.

---

## 8. Start the Expo Mobile App

In a new terminal:

```bash
pnpm --dir apps/mobile start
```

This starts the Metro bundler and prints a QR code and options to the terminal.

> Metro runs on `http://localhost:8081`. Keep this terminal open — it is the JS bundler for the app.

---

## 9. Launch on Android Emulator

With Metro running and the emulator booted:

Press **`a`** in the Metro terminal to open the app on the Android emulator.

Expo will install the Expo Go client (or your development build) on the emulator and launch the app.

Alternatively, scan the QR code from Metro with the **Expo Go** app on a real Android device.

---

## 10. Quick Add Manual QA Checklist

Complete all steps on the Android emulator (or device) with the web server and Metro running.

### Signed-Out Behavior

- [ ] Launch the app with no stored session (first install or after sign-out).
- [ ] Confirm the app routes immediately to `/auth/sign-in`.
- [ ] Confirm Home, Transactions, Bills, and Quick Add are not reachable while signed out.
- [ ] Confirm the Quick Add sheet, if opened somehow, shows "Sign in to save expenses." and has the Save button disabled.

### Sign-In via Magic Link

- [ ] Enter a valid test email on `/auth/sign-in` and tap **Send magic link**.
- [ ] Confirm the screen shows a "link sent" message.
- [ ] Open the magic link from the email on the Android emulator (paste the `dart-finance://auth/callback?code=...` URL via ADB or the emulator's browser).
  ```bash
  adb shell am start -a android.intent.action.VIEW -d "dart-finance://auth/callback?code=PASTE_CODE_HERE"
  ```
- [ ] Confirm `/auth/callback` shows a loading state, exchanges the code, and routes to the tab app.
- [ ] Confirm the Home screen shows the signed-in email.

### Quick Add — Amount Entry

- [ ] Open Quick Add from the Home or Quick Add tab.
- [ ] Confirm the Save button is **disabled** with zero amount.
- [ ] Tap digit keys and confirm the displayed amount updates:
  - Tapping `1`, `2`, `4`, `0` shows `€12.40` (1240 cents).
- [ ] Tap `⌫` to confirm backspace removes the last digit.
- [ ] Tap `00` to confirm double-zero appends correctly.
- [ ] Confirm leading zeros are stripped (e.g., `0`, then `5` shows `5`, not `05`).
- [ ] Confirm input is capped at 6 digits (max `999999` = €9999.99).

### Quick Add — Category Selection

- [ ] Confirm category chips are shown (either table-backed from `/api/mobile/categories` or the fallback list: Groceries, Transport, Dining, Health, Other).
- [ ] Tap a category chip and confirm it becomes highlighted.
- [ ] Confirm only one chip is active at a time.

### Quick Add — Successful Save

- [ ] Enter a valid amount (e.g., `5`, `0`, `0` → €5.00).
- [ ] Select a category.
- [ ] Tap **Save €5.00**.
- [ ] Confirm the button shows "Saving…" during the request.
- [ ] Confirm the button turns green and shows "Saved €5.00" on success.
- [ ] Confirm the screen navigates back to the previous tab after ~1.2 seconds.
- [ ] On the web app (`http://localhost:3000`), confirm the transaction appears in the transactions list with:
  - `source = manual`
  - `import_batch_id = null`
  - Amount = −500 cents (expenses are stored as negative cents)
  - `review_status = reviewed`

### Quick Add — No Active Account Error

If the signed-in user has no active account rows in the `accounts` table:

- [ ] Tap **Save** with a valid amount.
- [ ] Confirm an error banner appears with the message:
  > "No account is set up yet. Add an account on the web app first."
- [ ] Confirm a **Try again** button is shown.
- [ ] Add an account via the web app, return to Quick Add, and confirm save succeeds.

### Quick Add — Network / Server Error

- [ ] Stop the web server (`Ctrl-C` in the Next.js terminal).
- [ ] Tap **Save** in Quick Add.
- [ ] Confirm an error banner appears (e.g., "Network request failed." or a server error message).
- [ ] Confirm a **Try again** button is shown.
- [ ] Restart the web server and tap **Try again**; confirm the save succeeds.

### Sign-Out Behavior

- [ ] Tap **Sign out** on the Home screen.
- [ ] Confirm the app clears the session and routes back to `/auth/sign-in`.
- [ ] Close and reopen the app; confirm it stays on `/auth/sign-in` (session was cleared).

### Session Persistence Across Restart

- [ ] Sign in successfully.
- [ ] Close the emulator app (force-stop or press Home and swipe away).
- [ ] Reopen the app from the emulator home screen.
- [ ] Confirm the app routes directly to the tab app (session was restored from SecureStore).

### Security Check

- [ ] Confirm `apps/mobile/.env.local` does not contain `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, or `POSTGRES_URL`.
- [ ] Confirm no service role key appears in the Metro console output.

---

## 11. Troubleshooting

### Android emulator cannot reach `localhost`

The Android emulator runs in its own virtual network. `localhost` from inside the emulator refers to the emulator itself, not your Mac.

**Fix:** Always use `http://10.0.2.2:3000` for `EXPO_PUBLIC_API_BASE_URL` when testing on the emulator.

### Real Android device cannot reach the web server

A real device on Wi-Fi cannot reach `localhost` on your Mac.

**Fix:**
1. Find your Mac's LAN IP:
   ```bash
   ipconfig getifaddr en0
   ```
2. Set `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.x:3000` in `apps/mobile/.env.local`.
3. Start Next.js bound to all interfaces:
   ```bash
   pnpm --dir apps/web dev -- --hostname 0.0.0.0
   ```
4. Ensure both the Mac and device are on the **same Wi-Fi network**.
5. If still blocked, temporarily disable the Mac's firewall for the test session: **System Settings → Network → Firewall → Turn Off**.

### Environment variable change has no effect

Expo caches bundled JS. After editing `apps/mobile/.env.local`, you must restart Metro with cache cleared:

```bash
# Stop Metro (Ctrl-C), then restart with:
pnpm --dir apps/mobile start --clear
```

Or press **`r`** in the Metro terminal to reload. If the value still appears stale, press **`r`** twice or restart the emulator app.

### Supabase magic link does not open the app (Android emulator)

The emulator cannot open email links automatically. Use ADB to simulate the deep link:

1. Copy the full magic-link URL from your email client.
2. Extract the `dart-finance://auth/callback?code=...` part.
3. Run:
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "dart-finance://auth/callback?code=PASTE_CODE_HERE"
   ```

If the app is not registered as the handler for `dart-finance://`:
- Confirm `expo.scheme = "dart-finance"` in `apps/mobile/app.json`.
- Confirm `EXPO_PUBLIC_APP_SCHEME=dart-finance` in `apps/mobile/.env.local`.

### Supabase magic link redirects to the wrong URL

If clicking the email link opens a browser instead of the app:

1. Go to your Supabase project → **Authentication → URL Configuration**.
2. Confirm `dart-finance://auth/callback` is in the **Redirect URLs** list.
3. Confirm **no trailing slash** and the exact scheme matches `expo.scheme` in `app.json`.

### `422 NO_ACCOUNT_CONFIGURED` on Quick Add save

The Quick Add server route auto-selects the user's first active account. This error means the signed-in user has no active accounts in the database.

**Fix:**
1. Sign in to the web app at `http://localhost:3000`.
2. Navigate to the account management section and create at least one account (e.g., a checking account).
3. Return to the Android app and retry Quick Add.

### `503 DATABASE_NOT_CONFIGURED` from the API

The web server is running but `DATABASE_URL` is missing from `apps/web/.env.local`.

**Fix:** Add `DATABASE_URL=postgresql://...` to `apps/web/.env.local` and restart the web server.

### Expo cache artifacts cause render issues

If the UI shows stale content after code changes:

```bash
# Hard reset Metro cache
pnpm --dir apps/mobile start --clear
```

For emulator rendering issues, use **Developer Menu** (shake gesture or `Ctrl+M`) → **Reload**.

### Auth state loops / redirect loops on `/auth/callback`

If the callback route keeps redirecting:

1. Confirm the route guard allows `/auth/callback` even when `signed_in` — this is expected behavior so that callback links are not blocked by an existing session.
2. Check that `exchangeCodeForSession` is being called (look for errors in Metro console).
3. If the code is expired (Supabase codes are single-use and expire quickly), request a new magic link.

---

## Verification Results (as of Phase 3 main merge)

```
pnpm tsc --noEmit                → passed
pnpm --dir apps/mobile typecheck → passed
pnpm --filter @dart/mobile typecheck → passed
pnpm --filter @dart/mobile test  → 25 tests passed (1 file)
pnpm --filter @dart/web test     → 115 tests passed (19 files)
pnpm test                        → @dart/core 50, @dart/web 115, @dart/mobile 25 — all passed
```

### Known pre-existing typecheck failure

```
pnpm typecheck
```

Fails with:

```
apps/web/src/transactions/matching.test.ts(134,39): error TS2379
Argument of type '{ importedRowKey: string; importedTransactionId: undefined; }'
is not assignable to parameter of type 'Partial<ImportedMatchInput>'
with 'exactOptionalPropertyTypes: true'.
```

This is a pre-existing issue present since Phase 1. It is not caused by Phase 3 and is not fixed in Phase 3. All other packages — including `@dart/mobile` — typecheck cleanly inside this command before the web package fails.

### Secret scan result

```bash
rg -n "SERVICE_ROLE|SUPABASE_SERVICE_ROLE|PRIVATE_KEY|SECRET|service_role" apps/mobile
```

Result: **CLEAN** — no matches.

### API base URL environment variable

The mobile API client (`apps/mobile/src/api/client.ts`) reads:

```
EXPO_PUBLIC_API_BASE_URL
```

This variable must be set in `apps/mobile/.env.local` before starting Expo. It is included in `apps/mobile/.env.example` with the Android emulator default value (`http://10.0.2.2:3000`).
