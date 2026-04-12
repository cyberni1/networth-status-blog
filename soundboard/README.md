# 🎛️ TikTok Soundboard

Persönliche Soundboard-App für iPhone. Sounds per Knopfdruck abspielen — das iPhone-Mikrofon nimmt den Lautsprecher-Sound auf, sodass TikTok-Zuschauer ihn hören.

## Setup

```bash
cd soundboard
npm install
npx expo start
```

Dann **Expo Go** aus dem App Store installieren und den QR-Code scannen.

## So funktioniert's mit TikTok Live

1. TikTok Live starten
2. Mit Swipe-Geste zur Soundboard-App wechseln
3. Button drücken → Sound spielt über Lautsprecher
4. TikTok-Mikrofon nimmt Lautsprecher auf → Zuschauer hören es

**Wichtig:** Lautstärke des iPhones aufdrehen!

## Features

- 12 Hot Buttons (3×4 Grid)
- Sounds per Knopfdruck abspielen
- Lange drücken = bearbeiten (Name, Sound, Icon, Farbe)
- Unterstützte Formate: MP3, WAV, M4A, AAC, OGG
- Dunkles UI optimiert für Streamer
- Spielt auch bei Stummschalten

## Für dauerhaften Einsatz (ohne Expo Go)

```bash
npx eas build --platform ios --profile preview
```
Erfordert einen Expo-Account (kostenlos) und ein Apple Developer Account.
