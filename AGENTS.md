# AGENTS.md

## Commands

- `npm run serve` - Dev server (Vue CLI)
- `npm run build` - Production build to `dist/`
- `npm run test:unit` - Run Jest unit tests (Vue CLI preset)
- `npm run test:e2e` - Run E2E tests via Obscura + Puppeteer (requires `tools/obscura.exe`, run `npm run serve` first)
- `npm run lint` - Lint with ESLint + Prettier

## E2E Testing with Obscura + Puppeteer

Obscura (in `tools/`) is a Rust-based headless browser. E2E tests in `tests/e2e/` use `puppeteer-core` connected to Obscura's CDP server.

### Quick Start
1. `npm run serve` — start the dev server
2. `npm run test:e2e` — run E2E tests (starts Obscura automatically)

### Install / Update Obscura
```bash
# Download latest Windows binary from GitHub releases
# https://github.com/h4ckf0r0day/obscura/releases
# Extract obscura.exe and obscura-worker.exe to tools/
```

## Architecture

- **Entry**: `src/main.js` → mounts App, dispatches `initSpots` and `initTheme`
- **State**: `src/store/index.js` uses Vuex with Firebase real-time sync via `onValue` listener on `Garage` ref
- **Router**: `src/router/index.js` uses `createWebHistory` with `process.env.BASE_URL`
- **Firebase config**: `src/firebase/config.js`

## Critical Config

- **`vue.config.js`**: `publicPath: "/parking-project/"` — required for GitHub Pages deployment; changing this breaks deploy
- **`jsconfig.json`**: `@/*` aliases to `src/*`
- **Jest**: Uses `@vue/cli-plugin-unit-jest` preset; test files in `tests/unit/` with `.spec.{js,ts}` extension

## Firebase Structure

```
Garage/
├── Floor1/     (spots A1-A5)
├── Floor2/     (spots B1-B5)
└── Floor3/     (spots C1-C5)

Manual/
├── emergency_open: 0|1
├── entry_open: 0|1
└── exit_open: 0|1
```

Spot status: `0`=free, `1`=occupied, `2`=reserved, `3`=maintenance
Gate values: `0`=closed, `1`=open

## Deployment

- GitHub Pages via `.github/workflows/deploy.yml`
- Auto-deploys on push to `main`
- CI uses `npm ci` + `npm run build`, deploys `./dist`
- Node 20 in CI

## Linting Rules

- ESLint extends `plugin:vue/vue3-essential` + `eslint:recommended`
- `vue/multi-word-component-names` is disabled
- Prettier integration enabled
- Parser: `@babel/eslint-parser`

## Notes

- No TypeScript — plain JavaScript
- No typecheck command in scripts
- Sass/SCSS supported (sass-loader + sass installed)
- Firebase v12+ (modular API: `ref`, `onValue` from `firebase/database`)
- No testing framework installed yet — testing done via Chrome Dev MCP agent sessions

## Coding Standards

### Clean Code Principles
- **Single Responsibility**: Each function/component does one thing well. Split when it does 2+ unrelated things.
- **DRY**: Extract shared logic into composables, utilities, or constants. No copy-paste.
- **Meaningful names**: Variables/functions should describe intent (`isLoading` not `flag`, `fetchSpots()` not `getData()`).
- **Small functions**: Max ~30 lines. If longer, extract sub-functions.
- **Early returns**: Use guard clauses instead of deep `if` nesting.
- **No magic numbers**: Use named constants (`SPOT_STATUS.FREE` not `0`).

### Database Rules (Firebase)
- **Never hardcode credentials** — always use `process.env.VUE_APP_*`
- **Vuex is the single source of truth**: Subscribe to Firebase via `onValue` once in `store/index.js`. Never re-listen in components.
- **No direct writes from components** — dispatch store actions only.
- **Validate before write**: Check data shape/types before committing to Firebase.
- **Keep reads minimal**: Only subscribe to the data you need.
- **Handle errors gracefully**: Use `console.error` for failures, show user feedback, never silently break state.
- **No `console.log` in production code** — use `.error` for real issues. Clean up debug logs before committing.

### Refactoring Guidelines
- **Preserve behavior first**: Refactor = same behavior, better structure. New behavior = new feature.
- **Small incremental changes**: One concern at a time. Verify after each step.
- **Remove dead code**: Delete unused imports, functions, variables, CSS. Don't comment out code — git has history.
- **Verify visually**: Test via Chrome Dev MCP or manual browser testing after each refactor.
- **Run lint and build**: `npm run lint && npm run build` must pass after every refactor.

### Performance Rules
- **CSS over JS**: Use `@media`, `clamp()`, `transition` instead of JS calculations for responsive/animation behavior.
- **Avoid unnecessary re-renders**: Use `computed` for derived state. Avoid inline object/array creation in templates.
- **Debounce/throttle events**: For `scroll`, `resize`, `input` — never raw listeners on frequent events.
- **Minimize DOM reads**: Cache `getBoundingClientRect()` results. Don't read layout properties in loops.
- **Lazy load routes**: Vue Router code-splitting for non-critical pages (`component: () => import(...)`).
- **Bundle awareness**: Keep `chunk-vendors` under 400 KiB. Audit large dependencies before adding new ones.
- **Never create circular DOM feedback**: JS that changes DOM size must NOT trigger the same listener that caused the change (e.g., ResizeObserver → JS resize → ResizeObserver loop).

### Readability & Comments
- **Self-documenting code**: Write code that explains itself through naming and structure.
- **Comments explain WHY, not WHAT**: `// retry to handle Firebase latency` is good. `// set status to 0` is not.
- **JSDoc for public APIs**: Components, composables, store actions, and utilities should have JSDoc blocks.
- **Comment complex logic only**: Clever algorithms or workarounds deserve a brief explanation.
- **No redundant comments**: Remove comments that repeat the obvious.
- **TODO/FIXME format**: Use `// TODO: <description>` or `// FIXME: <issue>` for known items.
- **Arabic UI, English code**: User-facing text is Arabic. All code, comments, and commit messages are in English.

## Component Communication & State Flow

### Data Flow
- **Props down, events up**: Parent → Child via props. Child → Parent via `emit()`.
- **Global state via Vuex**: Theme, Firebase data, spot data. Only Vuex reads/writes Firebase.
- **Composables for shared UI logic**: Tooltip state, animations, form validation — not Vuex.

### Vuex Rules
- **Actions**: Async operations (Firebase reads/writes, API calls). Components call `dispatch()`.
- **Mutations**: Synchronous state updates only. Called by actions, never directly by components.
- **State**: Never mutated directly from components. Always via mutations.
- **Getters**: Derived state. Use instead of computing in templates.

### Component Lifecycle
- **`onMounted`**: Initialize listeners, set up subscriptions.
- **`onUnmounted`**: Clean up listeners, clear timers, unsubscribe.
- **`watch`/`computed`**: Reactive derivations. Prefer `computed` over `watch` when possible.

## CSS & Styling Conventions

### CSS Variables (Design Tokens)
- All colors, spacing, typography, shadows, animations defined as CSS variables in `App.vue` `:root`
- Dark mode = default `:root`, Light mode = `:root.light`
- Token naming: `--{category}-{variant}` (e.g., `--spot-free`, `--space-md`, `--text-lg`)

### Responsive Strategy
- **CSS `clamp()`** for fluid sizing: `clamp(min, preferred, max)`
- **No JS resize logic** for layout — use `@media` queries and `clamp()`
- Breakpoints: `480px`, `768px`, `1400px` max-width container

### Scoped vs Global
- **Scoped styles** for component-specific styles (default)
- **Global styles** in `App.vue` for design tokens, resets, body rules
- **Teleported components** (tooltips, modals) use unscoped `<style>` since they're outside component DOM tree

### Naming
- **BEM-inspired**: `.block__element--modifier` (e.g., `.spot-card__indicator`, `.is-free`, `.is-hovered`)
- **State classes**: Prefix with `is-` or `has-` (e.g., `is-active`, `has-error`)
- **Utility classes**: Avoid. Use CSS variables instead.

## Git & Security Rules

### Security
- **NEVER commit `.env.local`** or any file with API keys, tokens, passwords
- **NEVER commit `.firebase/` directory**
- If secrets leak: Force-push after history scrub, rotate keys immediately
- Use `process.env.VUE_APP_*` for all Firebase config values
- Client-side API keys are inherently public — secure data via Firebase Security Rules

### Commit Messages
- Format: `<type>: <short description>`
- Types: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `chore`
- Examples: `feat: add parking spot reservation`, `fix: tooltip positioning on scroll`
- Keep subject line under 72 characters

### Branch Naming
- Format: `<type>/<short-description>` (e.g., `feat/reserved-spots`, `fix/tooltip-scroll`)
- Merge to `main` via PR after CI passes

### Pre-Commit Checklist
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] No `console.log` left in code
- [ ] No hardcoded credentials
- [ ] No unused imports or dead code

## Error Handling Policy

### Firebase Errors
- **Connection failures**: Show user message, retry with exponential backoff, never crash
- **Permission denied**: Log with `console.error`, show friendly message, offer reconnect
- **Invalid data**: Validate on read, skip malformed entries, log with context

### State Errors
- **Invalid spot status**: Default to `SPOT_STATUS.FREE` with `console.warn`
- **Missing data**: Show loading/empty state, never `undefined` in UI
- **Store sync failures**: Retry `onValue` subscription, fallback to last known state

### User Feedback
- **Loading states**: Show spinner/skeleton while data fetches
- **Empty states**: Show friendly message when no data available
- **Error states**: Show actionable message with retry option
- **Never show stack traces or raw errors to users**

## Accessibility Standards

- **ARIA labels**: All interactive elements need `aria-label` (already done for spots)
- **Keyboard navigation**: `tabindex`, `@keydown.enter`, `@keydown.space` for clickable divs
- **Focus management**: Visible `:focus-visible` ring, never `outline: none` without replacement
- **Color contrast**: Meet WCAG AA minimum (4.5:1 for text, 3:1 for large text/UI)
- **Reduced motion**: Respect `prefers-reduced-motion` for animations
- **Screen reader support**: Use semantic HTML where possible, `aria-live` for dynamic content

## File Naming Conventions

- **Vue components**: `PascalCase.vue` (e.g., `ParkingSpot.vue`, `GlobalTooltip.vue`)
- **Composables**: `useCamelCase.js` (e.g., `useTooltip.js`)
- **Constants**: `UPPER_SNAKE_CASE.js` files, `UPPER_SNAKE_CASE` exports
- **Utilities**: `camelCase.js` (e.g., `formatDate.js`)
- **Store modules**: `camelCase.js` in `src/store/modules/`

## Deployment Process

### CI/CD (Automated)
- Push to `main` → GitHub Actions builds + deploys to GitHub Pages
- Workflow: `.github/workflows/deploy.yml`
- Uses `npm ci` + `npm run build`, deploys `./dist`
- Firebase config injected from GitHub Secrets

### Manual Deploy
```bash
npm run build
# dist/ is ready to deploy
```

### Rollback
- Revert to previous commit, push to `main` → auto-redeploys
- Or deploy previous commit's `dist/` manually

### Post-Deploy Checklist
- [ ] App loads at GitHub Pages URL
- [ ] Firebase connection works
- [ ] All floors/spots render correctly
- [ ] Theme toggle works
- [ ] No console errors in browser

## Known Issues

- `src/store/index.js` lines 61, 200: `no-console` ESLint warnings (acceptable for error logging)
- `chunk-vendors.950c8176.js` (386 KiB): Exceeds 244 KiB recommended limit — acceptable for current scope
- No Firebase Security Rules file yet — data is currently unprotected at the database level

## Project Roadmap / Tech Debt

- [ ] Add Firebase Security Rules to restrict read/write access
- [ ] Reduce `chunk-vendors` bundle size (audit Firebase SDK tree-shaking)
- [ ] Add unit tests (Jest setup when ready)
- [ ] Add error boundary component for graceful failure
- [ ] Add `prefers-reduced-motion` support for all CSS animations
- [ ] Consider Firestore migration for more complex queries (future)
