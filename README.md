# FocusPlay: calm ADHD-support PWA (prototype)

Plain HTML/CSS/JS with no build step. It works offline using a service worker and manifest. Run it with `python3 -m http.server` in this folder, then open `http://localhost:8000`.

## Features
- **Play:** "Surprise me" picks a random calming game. There are 5 games: memory match, breathing bubble, tap-the-color, word scramble and calm sort. Each takes 1–2 minutes.
- **Want:** a tracker for tasks and wishes, with done marks and a daily streak (local dates).
- **Day:** set work hours per day, sleep hours and an essentials allowance. A day bar shows how much free "me time" you have.
- **Remind:** break and wind-down reminders, plus custom task reminders. Each has a priority level:
  - Needed: a soft toast.
  - Important: a card that stays up, plus a notification.
  - Urgent: a full-screen alert with a repeating chime, snooze, vibration and a notification that stays until dismissed.
- **Gentle:** wellness nudges.
  - Presets: water, stretch, eyes, posture, breath, phone-away. You can also create your own.
  - Timing: every N minutes or at set times of day. Repeat always, on chosen weekdays, or within a date range. An optional active-hours window limits when they fire.
  - A water glass counter with a daily goal.
  - An in-app usage limit nudge, and a phone-free focus timer.
- **More:** themes (6 palettes plus a custom accent), a suggestion box (saved locally and sent by mailto to `SUPPORT_EMAIL`), refer-a-friend ($1 stacking credits, pending store setup), privacy information, and JSON export/import of your data.

## Privacy
There are no ads, no account and no analytics. All data stays in this device's localStorage. Usage tracking counts only time spent inside FocusPlay; web apps cannot read phone-wide usage.

## Limitations
- Reminders only fire while the app is open, in the foreground or a background tab. Closed-app delivery would need Web Push and a server.
- iOS needs the app installed to the home screen for notifications. Vibration doesn't work on iOS.
- **Refer-a-friend is a prototype only.** The planned reward is $1 back for every friend who buys with your code, and the credits stack. Codes (FOCUS-XXXX-XXXX, 8 random characters from an alphabet without 0/O/1/I/L) are generated on the device with crypto.getRandomValues and stored locally. True per-person uniqueness needs server-side issuance at store setup. and the credits counter stays at $0. Payout would be App Store or Google Play gift cards or promo codes issued by the developer. That needs a small backend to verify referrals: record the code at purchase, validate the store receipt, and tally credits per code.