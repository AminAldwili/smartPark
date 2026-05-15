# Parking Project — Setup Guide

Complete guide to replicate this parking management system on a new machine.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ (18-24 compatible) | [nodejs.org](https://nodejs.org/) |
| npm | Ships with Node | — |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| Browser | Chrome / Edge / Firefox | — |

> **Recommended**: Use [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node.js versions. The CI uses Node 20.

---

## 1. Clone the Repository

```bash
git clone https://github.com/AminAldwili/parking-project.git
cd parking-project
```

---

## 2. Install Dependencies

```bash
npm install
```

> **Troubleshooting**: If you get `node-sass` errors, install Python 3 and run:
> ```bash
> npm rebuild node-sass
> ```

---

## 3. Environment Variables

Create a file named `.env.local` in the project root with these exact values:

```ini
VUE_APP_FIREBASE_API_KEY=AIzaSyDEVwENvKXnGmt74Y83Z9d7Jem_YNrSHXI
VUE_APP_FIREBASE_DATABASE_URL=https://smartparkingsystem-9d3ae-default-rtdb.firebaseio.com
VUE_APP_FIREBASE_PROJECT_ID=smartparkingsystem-9d3ae
VUE_APP_FIREBASE_AUTH_DOMAIN=smartparkingsystem-9d3ae.firebaseapp.com
```

These connect to the shared `smartparkingsystem-9d3ae` Firebase project (RTDB + Auth + Firestore).

---

## 4. Firebase Data Setup

### 4a. Realtime Database

Go to **Firebase Console → smartparkingsystem-9d3ae → Realtime Database → Import JSON** and import:

```json
{
  "Garage": {
    "Floor1": { "A1": 0, "A2": 0, "A3": 0, "A4": 0, "A5": 0 },
    "Floor2": { "B1": 0, "B2": 0, "B3": 0, "B4": 0, "B5": 0 },
    "Floor3": { "C1": 0, "C2": 0, "C3": 0, "C4": 0, "C5": 0 }
  },
  "Manual": {
    "emergency_open": 0,
    "entry_open": 0,
    "exit_open": 0
  }
}
```

**Spot status values**: `0`=free, `1`=occupied, `2`=reserved, `3`=maintenance  
**Gate values**: `0`=closed, `1`=open

**RTDB Security Rules** (for development — set in Firebase Console → Realtime Database → Rules):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> **Warning**: The `true` rules allow anyone to read/write. Restrict in production using Firebase Auth rules.

### 4b. Firestore

The app uses Firestore for the `users` collection (auth admin roles).

Go to **Firebase Console → Firestore Database → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    function isOwnDocument(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow create: if isAuthenticated() && request.auth.uid == userId
        && request.resource.data.isAdmin == false;
      allow read: if isOwnDocument(userId) || isAdmin();
      allow update: if isOwnDocument(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['isAdmin']);
      allow update: if isAdmin() && 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isAdmin']);
      allow delete: if isAdmin();
    }
  }
}
```

### 4c. Firebase Auth

Enable **Sign-in method → Email/Password** in Firebase Console → Authentication.

---

## 5. Run Dev Server

```bash
npm run serve
```

Opens at **http://localhost:8080/parking-project/**

### Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Home — parking floors, spot navigation, path drawing | Public |
| `/about` | Project info page | Public |
| `/account` | Login / Sign up | Public |
| `/dashboard` | Admin panel (gate controls, user management) | Admin only |

Navigate to a spot via URL: `/?slot=B3`

---

## 6. Build for Production

```bash
npm run build
```

Output goes to `dist/`. Served at `/parking-project/` subpath (configured in `vue.config.js`).

---

## 7. Testing

### Unit Tests

```bash
npm run test:unit
```

Jest test files in `tests/unit/` (`*.spec.js`).

### E2E Tests (Obscura + Puppeteer)

Requires the Obscura headless browser binary:

1. Download the latest **Windows** release from:  
   https://github.com/h4ckf0r0day/obscura/releases
2. Extract `obscura.exe` and `obscura-worker.exe` into the `tools/` directory
3. Start the dev server: `npm run serve`
4. In a second terminal: `npm run test:e2e`

E2E specs live in `tests/e2e/`.

---

## 8. Lint

```bash
npm run lint
```

Runs ESLint + Prettier. Must pass before every commit.

---

## 9. GitHub Pages Deploy

Pushing to the `main` branch auto-deploys via GitHub Actions (see `.github/workflows/deploy.yml`).

### Required GitHub Secrets

If you fork the repo, add these in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `VUE_APP_FIREBASE_API_KEY` | `AIzaSyDEVwENvKXnGmt74Y83Z9d7Jem_YNrSHXI` |
| `VUE_APP_FIREBASE_DATABASE_URL` | `https://smartparkingsystem-9d3ae-default-rtdb.firebaseio.com` |
| `VUE_APP_FIREBASE_PROJECT_ID` | `smartparkingsystem-9d3ae` |

The deploy workflow:
1. Checks out the repo
2. Sets up Node 20
3. Runs `npm ci`
4. Injects secrets as env vars
5. Runs `npm run build`
6. Uploads `dist/` as a Pages artifact
7. Deploys to GitHub Pages

---

## 10. Quick Reference

```bash
npm run serve          # Dev server → http://localhost:8080/parking-project/
npm run build          # Production build → dist/
npm run test:unit      # Jest unit tests
npm run test:e2e       # E2E tests (requires Obscura + dev server)
npm run lint           # ESLint + Prettier check
```

---

## 11. Project Structure

```
parking-project/
├── public/
├── src/
│   ├── main.js                  # Entry point
│   ├── App.vue                  # Root: CSS vars, nav, router-view, toasts, tooltip
│   ├── router/index.js          # 4 routes + admin guard
│   ├── store/
│   │   ├── index.js             # Spots, gates, theme + Firebase listeners
│   │   └── modules/auth.js      # Firebase Auth + Firestore user doc
│   ├── firebase/config.js       # Firebase init (reads VUE_APP_* env vars)
│   ├── constants/
│   │   ├── index.js             # Status codes, labels, sizes, colors, paths
│   │   └── ERROR_MESSAGES.js    # Auth error → Arabic messages
│   ├── composables/
│   │   ├── useToast.js          # Toast notifications
│   │   ├── useTooltip.js        # Hover tooltips
│   │   ├── useSpotFromUrl.js    # ?slot= param parser
│   │   └── useElementSize.js    # ResizeObserver helper
│   ├── views/
│   │   ├── HomeView.vue         # Main page: hero + ParkingFloors
│   │   ├── AboutView.vue        # Static about page
│   │   ├── AccountView.vue      # Login / signup form
│   │   └── Dashboard.vue        # Admin: gates + user grid
│   └── components/
│       ├── ParkingFloors.vue    # 2 floors, ramp, entry, path drawing
│       ├── ParkingFloor.vue     # Single floor grid with aisle
│       ├── ParkingSpot.vue      # Clickable spot card
│       ├── PathDrawer.vue       # SVG golden path overlay
│       ├── GateControls.vue     # Gate toggle switches
│       ├── ThemeToggle.vue      # Dark/light mode
│       ├── GlobalTooltip.vue    # Teleported tooltip
│       ├── ToastContainer.vue   # Teleported toast stack
│       └── UserDataGrid.vue     # Admin user table
├── tests/
│   ├── unit/                    # Jest unit tests
│   └── e2e/                     # E2E specs (Obscura + Puppeteer)
├── tools/                       # Obscura binaries (gitignored)
├── .env.local                   # Firebase config (gitignored)
├── vue.config.js                # publicPath: /parking-project/
├── package.json
└── AGENTS.md                    # Full project conventions & architecture
```

---

## 12. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `node-sass` build error | Node.js version mismatch | `npm rebuild node-sass` or install Python 3 |
| Blank page on dev server | Missing env vars | Ensure `.env.local` has all 4 `VUE_APP_FIREBASE_*` values |
| Firebase "permission denied" | RTDB rules too strict | Set rules to `{".read": true, ".write": true}` for dev |
| Auth not working | Email/password not enabled | Enable in Firebase Console → Authentication → Sign-in method |
| E2E tests fail | Obscura not in `tools/` | Download and extract `obscura.exe` + `obscura-worker.exe` |
| E2E tests fail | Dev server not running | Start dev server in separate terminal first |
| Can't log in | No user in Firestore | Sign up via `/account` or manually add a document to `users/{uid}` |
| Route 404 on refresh | SPA routing | Let Vue Router handle it — make sure dev server is on history mode |
