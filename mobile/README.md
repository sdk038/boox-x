# Daler AI Mobile (React Native / Expo)

AI-first mobile client for iOS and Android.

## MVP Scope
- Auth (login/register + guest mode)
- AI chat
- AI project generation
- AI presentations generation
- RU/EN language switch

## Run locally
1. Copy env file:
   - `cp .env.example .env`
2. Set backend API URL in `.env`:
   - `EXPO_PUBLIC_API_URL=https://your-backend-domain/api`
3. Install dependencies:
   - `npm install`
4. Start:
   - `npm run start`

## Build profiles (EAS)
- `development` for local/internal development client
- `preview` for QA/internal testers
- `production` for stores

## Release checklist
1. Create Expo account and initialize EAS project:
   - `npx eas login`
   - `npx eas init`
2. Update identifiers in `app.json`:
   - `ios.bundleIdentifier`
   - `android.package`
3. Configure production API URL in `eas.json`.
4. Build binaries:
   - iOS: `npx eas build --platform ios --profile preview`
   - Android: `npx eas build --platform android --profile preview`
5. Submit builds:
   - TestFlight: `npx eas submit --platform ios --profile production`
   - Google Play Internal testing: `npx eas submit --platform android --profile production`

## Store prerequisites
- Apple Developer account
- Google Play Console account
- Privacy policy URL
- App metadata and screenshots
