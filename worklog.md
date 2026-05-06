---
Task ID: 1
Agent: Main Agent
Task: Restructure Frontend to Atlas Core - Complete Fintech Web3 Command Center

Work Log:
- Explored current project structure (clean Next.js 16 + shadcn/ui scaffold)
- Installed axios for API client
- Created TypeScript types from Prisma Schema (src/types/atlas.ts) - all enums, models, request/response types, RBAC permissions
- Created API client with JWT interceptors (src/lib/api/client.ts) - axios instance, token management, all API modules (auth, wallets, transactions, deposits, swaps, withdrawals, kyc, fees, tickets, organizations, users, merchant)
- Created Auth Store with Zustand (src/stores/auth-store.ts) - RBAC permissions matrix, role-based access, token/user persistence
- Created Navigation Store (src/stores/nav-store.ts) - client-side SPA routing, 14 pages
- Created Theme Provider (src/providers/theme-provider.tsx)
- Updated Root Layout with Atlas Core branding (dark theme, Inter + JetBrains Mono fonts)
- Created Mock Data (src/lib/mock-data.ts) - wallets, transactions, fees, KYC profile, tickets, organizations, users, tier limits, deposit routes
- Built Login Page (src/components/layout/atlas-login.tsx) - glassmorphism, emerald/teal, dev mode with 5 roles
- Built Sidebar (src/components/layout/atlas-sidebar.tsx) - full RBAC navigation, collapsible, 5 sections
- Built Root Page (src/app/page.tsx) - auth gate, SPA routing, hydration-safe
- Built Dashboard Overview (src/components/dashboard/dashboard-page.tsx) - stats, wallets, transactions, quick actions
- Built Wallet Pages (5 files): wallets, deposits (4-step wizard), swaps (quote + execution), withdrawals (bank/crypto), transactions (filters + table + pagination)
- Built KYC Page (src/components/kyc/kyc-page.tsx) - progressive tiers 0-3, forms, external verification
- Built Admin Pages (5 files): tickets, users, fees, organizations + merchant links, API keys
- Fixed lint error (setState-in-effect) in page.tsx
- All lint checks pass, dev server returns 200

Stage Summary:
- Complete Atlas Core frontend built with 20+ components
- TypeScript types rigorously match Prisma schema
- API client configured with JWT interceptors ready for Atlas Core Banking REST API
- RBAC with 5 roles: Customer, Merchant, Super Merchant, Admin, Operator
- All mock data ready for development without backend
- Dark theme, institutional Web3 aesthetic with emerald/teal accents
- SPA architecture on single `/` route using zustand navigation store
