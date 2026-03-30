# TYFYS Mobile Shell

This Capacitor project packages the TYFYS app as native iOS and Android apps while keeping the live backend and Zoho sync shared with the website.

## What ships in the app

- The TYFYS app UI is bundled locally into `www/`.
- Mobile API calls are routed to `https://app.tyfys.net`.
- Native plugins are enabled for app lifecycle, browser handoff, filesystem/share, keyboard, and status bar behavior.

## Local setup

```bash
cd apps/ios-shell
npm install
npm run build:web
npm run ios:sync
npm run android:sync
```

## Useful commands

```bash
npm run ios:open
npm run ios:build:nosign
npm run android:open
npm run android:build:debug
```

## Notes

- `npm run build:web` rebuilds the shared TYFYS bundle from `apps/tyfys-platform/src/tyfys-platform-app.jsx` and copies it into the mobile shell.
- iOS and Android both run the bundled app locally; they do not load `tyfys.net` remotely at boot.
- The live backend remains `https://app.tyfys.net`, so mobile and web stay in sync.
