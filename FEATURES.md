# Feature Brainstorm

Potential features for the parking project, grouped by impact and scope.

---

## Tier 1 — High Impact, Reasonable Scope

- [ ] **Availability counter per floor** — Show "5/10 free" badges on each floor header for at-a-glance info
- [ ] **Floor 3 (Section C) visual** — Already exists in Firebase as `Floor3` (C1-C5) but not rendered on the UI; add a third floor or merge into Floor 2
- [ ] **Admin: manual spot override** — Admin clicks a spot to set its status (maintenance, reserved) directly from the dashboard
- [ ] **Forgot password / email verification** — Auth UX gap: no password reset or email verification flow
- [ ] **Spot search bar** — Type "B3" to auto-scroll, highlight, and draw the path (URL `?slot=` already works, needs an input)

---

## Tier 2 — Nice-to-Have

- [ ] **Parking timer** — Track how long a spot has been occupied, show duration on hover/click
- [ ] **Reservation system** — User reserves a spot for a time window, spot status changes to `2` (reserved)
- [ ] **History & analytics** — Log occupancy changes over time, show simple charts for admin (daily peaks, free spot trends)
- [ ] **PWA support** — Service worker, web manifest, installable on mobile homescreen
- [ ] **Fee calculator** — Calculate parking fee based on duration and configurable rate

---

## Tier 3 — Stretch Goals

- [ ] **License plate entry** — Enter plate number at check-in, display on spot card
- [ ] **Push notifications** — Firebase Cloud Messaging for "your spot is ready", "gate opened", etc.
- [ ] **Multi-language toggle** — English alongside Arabic
- [ ] **Parking prediction** — Show "usually free at this time" hints based on historical data
- [ ] **Spot favorites** — Save frequently used spots for quick navigation
- [ ] **Entry/exit gate animations** — Visual feedback on the floor layout when gates open/close
- [ ] **Guest mode** — Browse without login (currently works, but a deliberate guest entry flow)

---

*Checklist format — mark `[x]` as features are implemented.*
