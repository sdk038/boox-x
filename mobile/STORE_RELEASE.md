# Store Release Runbook

## 1) Accounts and access
- Create Apple Developer account.
- Create Google Play Console account.
- Add team members with release permissions.

## 2) App identity and metadata
- Confirm `ios.bundleIdentifier` in `app.json`.
- Confirm `android.package` in `app.json`.
- Prepare:
  - App name
  - Short and full description
  - Support email
  - Privacy policy URL
  - Screenshots (phone sizes for iOS and Android)

## 3) Build setup
- Login to Expo/EAS:
  - `npx eas login`
  - `npx eas init`
- Configure API URL:
  - `EXPO_PUBLIC_API_URL` in `eas.json` production profile.

## 4) Internal test release
- iOS (TestFlight):
  - `npm run build:ios:preview`
  - `npm run submit:ios`
- Android (Internal testing):
  - `npm run build:android:preview`
  - `npm run submit:android`

## 5) QA gates before production
- Auth login/register works.
- Guest access works for AI chat and presentations.
- Project generation requires auth.
- RU/EN switch works across all mobile screens.
- Network error and timeout states are visible and understandable.

## 6) Production release
- Promote tested build to production in App Store Connect.
- Promote tested build to production in Google Play.
