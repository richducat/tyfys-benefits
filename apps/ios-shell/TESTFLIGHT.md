# TYFYS iOS TestFlight Prep

## 1) Build and sync the bundled app

```bash
cd apps/ios-shell
npm install
npm run ios:sync
npm run ios:open
```

## 2) Configure signing in Xcode

1. Open target `App`.
2. Go to `Signing & Capabilities`.
3. Select your Apple Developer Team.
4. Confirm Bundle Identifier is unique if `com.tyfys.app` is already used.
5. Keep `Automatically manage signing` enabled.

## 3) Set versioning for upload

1. Open target `General`.
2. Set `Version` such as `1.0.0`.
3. Set `Build` and increment it for every upload.

## 4) Device smoke test

1. Plug in an iPhone and select it as the run target.
2. Launch the app from Xcode.
3. Verify:
   - the bundled app opens without hitting a remote shell URL at boot
   - onboarding and login work
   - dossier upload opens camera/photo picker correctly
   - Zoho sync works against `https://app.tyfys.net`
   - premium CTA stays in the mobile-safe specialist flow

## 5) Archive and upload to TestFlight

1. In Xcode choose `Product` -> `Archive`.
2. In Organizer select the archive.
3. Click `Distribute App`.
4. Choose `App Store Connect`.
5. Complete the upload flow.

## Runtime

- The native app boots the bundled TYFYS app from `apps/ios-shell/www/`.
- Live API traffic goes to `https://app.tyfys.net`.
- If you change the shared app source, rerun `npm run ios:sync` before archiving.
