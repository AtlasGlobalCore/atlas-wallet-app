---
Task ID: 1
Agent: Main Agent
Task: Clone, deploy and fix atlas-wallet-app for API connection adaptation

Work Log:
- Cloned https://github.com/AtlasGlobalCore/atlas-wallet-app.git to /home/z/atlas-wallet-app
- Explored full project structure: Next.js 16 + Tailwind CSS 4 + shadcn/ui + Prisma + Zustand
- Installed all dependencies with `bun install` (827 packages)
- Pushed Prisma schema to SQLite database
- Identified and fixed 3 bugs preventing compilation:
  1. Store missing `userEmail` and `userBalance` properties - added `selectUserEmail` and `selectUserBalance` computed selectors
  2. `next.config.ts` missing image domains for CoinGecko external images - added `remotePatterns` for `assets.coingecko.com`
  3. `DialogContent` using non-existent `showCloseButton` prop in `auth-modal.tsx` - removed the prop
- Fixed syntax error in `store.ts` where generic closing `>` was mangled to `()` during edit
- Started dev server on port 3000 - confirmed HTTP 200 response

Stage Summary:
- Project successfully deployed and running at http://localhost:3000
- All 6 API routes are functional (mock mode): /api/create-order, /api/convert, /api/auth/login, /api/auth/register, /api/gateway/status, /api/gateway/routes
- Landing page with crypto wallet simulator (Buy/Sell/Swap) working
- Dashboard with sidebar navigation (Overview/Statements/Payouts/Tickets) working
- Auth modal with dev login (Seller/Operator/Admin roles) available
- Gateway Panel (bottom-right terminal icon) shows real-time status
- All API functions in src/lib/api/wallet.ts return mock data, ready for real API connection
