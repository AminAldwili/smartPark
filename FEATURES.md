# Roadmap

Living feature roadmap for the parking project, grouped by impact and scope.
Mark `[x]` as features are implemented.

**Progress:** ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ 8/22 (36%)

---

## Tier 1 — High Impact, Reasonable Scope

- [ ] **Firebase Security Rules (RTDB)** — Create `database.rules.json` with data validation + admin-only gate access. **Blocked:** needs MCU auth method (how does the ESP32 write without user login?)
- [ ] **QR scan user workflow** — When scanning a QR (`?slot=A1`): show pulse highlight on target spot, toast with status, validate spot ID exists, don't auto-clear path
- [ ] **About page content update** — Enrich with tech stack, stats (15 spots / 3 floors / 3 gates), admin dashboard mention, version info
- [ ] **UI bug fixes** — Audit missing `prefers-reduced-motion` blocks, font rendering edge cases (Tajawal used for English UI), RTL consistency
- [x] **Admin: manual spot override** — Admin clicks a spot in dashboard to set status (maintenance, reserved, free, occupied) via `SpotControlPanel.vue`
- [ ] **Availability counter per floor** — Show "5/10 free" badges on each floor header for at-a-glance info
- [ ] **Forgot password / email verification** — Auth UX gap: no password reset flow
- [ ] **Spot search bar** — Type "B3" to auto-scroll, highlight, and draw the path (URL `?slot=` already works, needs an input)

---

## Tier 2 — Nice-to-Have

- [ ] **AR/EN language toggle** — Full i18n via `vue-i18n`: toggle button in nav, swap `dir="rtl/ltr"`, switch fonts (Tajawal ↔ Inter), persist locale. ~15-20 files affected
- [x] **Parking timer** — Track how long a spot has been occupied, show duration on hover/click (built in `SpotControlPanel.vue`)
- [ ] **Reservation system** — User reserves a spot for a time window, spot status changes to `2` (reserved)
- [ ] **History & analytics** — Log occupancy changes over time, show simple charts for admin (daily peaks, free spot trends)
- [ ] **PWA support** — Service worker, web manifest, installable on mobile homescreen
- [ ] **Fee calculator** — Calculate parking fee based on duration and configurable rate

---

## Tier 3 — Stretch Goals

- [ ] **License plate entry** — Enter plate number at check-in, display on spot card
- [ ] **Push notifications** — Firebase Cloud Messaging for "your spot is ready", "gate opened", etc.
- [ ] **Parking prediction** — Show "usually free at this time" hints based on historical data
- [ ] **Spot favorites** — Save frequently used spots for quick navigation
- [ ] **Entry/exit gate animations** — Visual feedback on the floor layout when gates open/close
- [ ] **Guest mode** — Browse without login (currently works, but a deliberate guest entry flow)

---

## Parked / Blocked

- **Firebase Security Rules** — Waiting on MCU auth strategy. Options to investigate:
  - Firebase Database Secret (legacy, deprecated)
  - Service account + Admin SDK (requires backend)
  - Public write with validated schema + read restricted to auth
  - Separate IoT path (`/IoT/{spotId}`) + Cloud Function syncs to `Garage/`
