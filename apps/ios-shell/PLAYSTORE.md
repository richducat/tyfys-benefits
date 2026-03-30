# TYFYS Android Play Store Prep

## 1) Build and sync the bundled app

```bash
cd apps/ios-shell
npm install
npm run android:sync
npm run android:open
```

## 2) Configure Android Studio

1. Open the `android/` project in Android Studio.
2. Set the application id if `com.tyfys.app` is already taken.
3. Confirm the release signing config or create a Play upload key.

## 3) Release checks

Verify on a physical Android device:

- onboarding and login work
- dossier upload opens file picker/camera flows
- Zoho sync works against `https://app.tyfys.net`
- the app stays portrait on phones
- premium CTA stays in the mobile-safe specialist flow

## 4) Build release artifacts

Use Android Studio or Gradle to generate the release `AAB` for Play Console upload after Java/Android SDK are installed locally.

## Runtime

- The Android app boots the bundled TYFYS app from `apps/ios-shell/www/`.
- Live API traffic goes to `https://app.tyfys.net`.
- If the TYFYS source changes, rerun `npm run android:sync` before building the release bundle.
