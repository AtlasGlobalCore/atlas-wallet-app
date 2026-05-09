# Atlas Core - Worklog

---
Task ID: 1
Agent: Main
Task: Fix client-side crash and implement UI improvements

Work Log:
- Diagnosed root cause: dev server OOM crash (JavaScript heap out of memory)
- Fixed `getUserRole()` missing from auth-store.ts (called in dashboard-page.tsx but not defined)
- Added `admin` role to ROLE_LABELS and ROLE_PERMISSIONS (type mismatch with UserRole)
- Converted page.tsx from 15 eager imports to dynamic lazy imports with `next/dynamic`
- Added PageErrorBoundary component for graceful error handling per page
- Added `allowedDevOrigins: ['*']` to next.config.ts for cross-origin preview support
- Restarted dev server with `NODE_OPTIONS="--max-old-space-size=512"` memory limit
- Created modern neon grid CSS effect (atlas-grid-bg, neon-sweep animations)
- Redesigned landing page with proper navigation bar (desktop links + mobile hamburger menu)
- Reordered landing page layout: auth block FIRST on mobile (order-1), crypto cards SECOND (order-2); desktop keeps LEFT=crypto, RIGHT=auth
- Enhanced SEO/metadata with Open Graph, Twitter Card, Viewport, robots config
- Added mobile-responsive stats row with horizontal scroll
- TradingView widget hidden on very small screens for better mobile UX
- All lint checks pass clean

Stage Summary:
- Server crash resolved: OOM + missing getUserRole() + eager imports
- Navigation bar added to landing page with responsive mobile menu
- Neon grid background with LED flow effect implemented
- Mobile-first layout: login/register appears first on smartphones
- SEO metadata fully configured (Open Graph, Twitter Cards, robots)
- All changes deployed and server running
