# MiniLedger

Dosto ko diye gaye udhaar track karne ka chhota app.

- **Backend:** Node.js + Express + TypeScript + PostgreSQL
- **App:** React Native (Expo)
- **Features:** phone + mock OTP login (OTP server log mein print hota hai), loan add, repaid mark, summary (total lent / repaid / overdue), overdue highlight, receipt photo upload, input validation (zod), basic tests (jest)

## Folder structure
```
miniledger/
  backend/    -> API server
  app-src/    -> React Native app ka code (Expo project mein copy karna hai, neeche dekho)
```

## Requirements
Node.js 18+, PostgreSQL, Expo Go app (phone mein), phone aur laptop same WiFi pe.

## 1. Backend chalao
```bash
cd backend
npm install
copy .env.example .env      # Windows (Mac/Linux: cp .env.example .env)
```
`.env` kholke `YOURPASSWORD` ki jagah apna postgres password daalo.

Database banao (ek baar):
```bash
psql -U postgres -c "CREATE DATABASE miniledger;"
npm run db:init             # users, otps, loans tables bana deta hai
npm run dev
```
`Server running on http://localhost:3000` dikhega. `http://localhost:3000/health` kholke check karo.

Tests: `npm test`

## 2. App chalao
Repo ke root se:
```bash
npx create-expo-app@latest app --template blank-typescript
cd app
npx expo install @react-native-async-storage/async-storage expo-image-picker
```
Phir `app-src` ke andar ki **App.tsx** (replace karo) aur **src** folder `app` mein copy karo.

`app/src/config.ts` kholke `API_URL` mein laptop ka IP daalo (`ipconfig` -> IPv4 Address), jaise `http://192.168.1.5:3000`.

```bash
npx expo start
```
Phone ke Expo Go se QR scan karo.

## API
| Method | Endpoint | Kaam | Auth |
|---|---|---|---|
| POST | /auth/request-otp | `{phone}` -> OTP server log mein | No |
| POST | /auth/verify-otp | `{phone, otp}` -> JWT token | No |
| POST | /loans | `friend_name, amount, due_date, receipt(optional file)` (multipart) | Yes |
| GET | /loans | mere saare loans | Yes |
| PATCH | /loans/:id/repay | repaid mark karo | Yes |
| GET | /summary | `total_lent, total_repaid, overdue_amount` | Yes |

Overdue = jo repaid nahi hai **aur** due date aaj se pehle ki hai.

## Notes
- OTP 5 minute valid hai aur ek baar use ho sakta hai.
- Windows Firewall port 3000 pe popup de to **Allow** karo, warna phone server tak nahi pahunch payega.
