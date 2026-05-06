# UK Prayer Times

A React Native mobile app built with Expo that displays accurate Islamic prayer times for any UK postcode, including the Hijri date.

## Features

- Look up prayer times by UK postcode
- Displays all five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) plus Sunrise
- Shows the current Hijri (Islamic calendar) date
- Persists your last-used location across app restarts
- Dark UI themed around deep navy (`#0f1923`)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54 (bare/managed) |
| Language | TypeScript |
| Navigation | State-based (no expo-router) |
| Architecture | `newArchEnabled: false` (Fabric disabled) |

## APIs

| API | Purpose | Key required |
|---|---|---|
| [postcodes.io](https://postcodes.io) | Postcode → lat/lng | No |
| [AlAdhan.com](https://aladhan.com/prayer-times-api) | Prayer times + Hijri date | No |

**Calculation settings:** Karachi method (`method=1`), Hanafi Asr (`school=1`)

## Project Structure

```
uk-prayer-times/
├── App.tsx                  # Root — manages screen state
├── index.ts                 # Expo entry point
├── screens/
│   ├── SetupScreen.tsx      # Postcode input screen
│   └── PrayersScreen.tsx    # Prayer times display screen
├── services/
│   ├── postcodes.ts         # postcodes.io API client
│   └── aladhan.ts           # AlAdhan API client
├── types/
│   └── index.ts             # Shared TypeScript types
└── assets/                  # App icons and splash images
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device (iOS or Android)

### Installation

```bash
git clone https://github.com/essamE-dev/uk-prayer-times.git
cd uk-prayer-times
npm install
```

### Running the app

```bash
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Platform-specific builds

```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Browser (metro bundler)
```

## Auto-push Hook

A post-commit hook is included to automatically push commits to GitHub. Install it with:

```bash
cp hooks/post-commit .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

After installing, every `git commit` will automatically push to `origin/main`.

## Backup Branch

A stable backup snapshot is kept on the `backup/stable-v1.0` branch. To restore:

```bash
git checkout backup/stable-v1.0
```

## Contributing

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Open a pull request

## License

MIT
