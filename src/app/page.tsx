'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNavStore } from '@/stores/nav-store';
import AtlasLanding from '@/components/layout/atlas-landing';
import AtlasSidebar from '@/components/layout/atlas-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Loader2 } from 'lucide-react';

// Page components
import DashboardPage from '@/components/dashboard/dashboard-page';
import WalletsPage from '@/components/wallet/wallets-page';
import DepositsPage from '@/components/wallet/deposits-page';
import SwapsPage from '@/components/wallet/swaps-page';
import WithdrawalsPage from '@/components/wallet/withdrawals-page';
import TransactionsPage from '@/components/wallet/transactions-page';
import KycPage from '@/components/kyc/kyc-page';
import AdminTicketsPage from '@/components/dashboard/admin-tickets-page';
import AdminUsersPage from '@/components/dashboard/admin-users-page';
import AdminFeesPage from '@/components/dashboard/admin-fees-page';
import AdminOrganizationsPage from '@/components/dashboard/admin-organizations-page';
import MerchantLinksPage from '@/components/dashboard/merchant-links-page';
import MerchantApiKeysPage from '@/components/dashboard/merchant-api-keys-page';
import MerchantCheckoutsPage from '@/components/dashboard/merchant-checkouts-page';

const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  wallets: WalletsPage,
  deposits: DepositsPage,
  swaps: SwapsPage,
  withdrawals: WithdrawalsPage,
  transactions: TransactionsPage,
  kyc: KycPage,
  'admin-tickets': AdminTicketsPage,
  'admin-users': AdminUsersPage,
  'admin-fees': AdminFeesPage,
  'admin-organizations': AdminOrganizationsPage,
  'merchant-links': MerchantLinksPage,
  'merchant-api-keys': MerchantApiKeysPage,
  'merchant-checkouts': MerchantCheckoutsPage,
};

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Painel de Controlo',
  wallets: 'Carteiras',
  deposits: 'Depositar',
  swaps: 'Swap',
  withdrawals: 'Levantar',
  transactions: 'Transações',
  kyc: 'Verificação KYC',
  'admin-tickets': 'Tickets / Operações',
  'admin-users': 'Utilizadores',
  'admin-fees': 'Taxas & Comissões',
  'admin-organizations': 'Organizações',
  'merchant-links': 'Links de Pagamento',
  'merchant-api-keys': 'API Keys',
  'merchant-checkouts': 'Checkouts',
};

function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const onMount = () => setHydrated(true);
    onMount();
  }, []);
  return hydrated;
}

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { currentPage, sidebarOpen, toggleSidebar, setPage } = useNavStore();
  const hydrated = useHydrated();

  // Listen for auth events
  useEffect(() => {
    const handleAuth = () => setPage('dashboard');
    const handleLogout = () => setPage('dashboard');
    window.addEventListener('atlas:authenticated', handleAuth);
    window.addEventListener('atlas:logout', handleLogout);
    return () => {
      window.removeEventListener('atlas:authenticated', handleAuth);
      window.removeEventListener('atlas:logout', handleLogout);
    };
  }, [setPage]);

  // Loading during hydration
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0f0d]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-sm text-zinc-500">A carregar Atlas Core...</span>
        </div>
      </div>
    );
  }

  // Not authenticated → show landing page
  if (!isAuthenticated) {
    return <AtlasLanding />;
  }

  // Authenticated → show dashboard layout
  const PageComponent = PAGE_COMPONENTS[currentPage] || DashboardPage;
  const pageTitle = PAGE_TITLES[currentPage] || 'Painel';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AtlasSidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 text-zinc-400 hover:text-zinc-200 shrink-0"
                aria-label="Abrir menu"
              >
                <Menu className="size-4" />
              </Button>
            )}
            <h1 className="text-base font-semibold text-zinc-100 truncate">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-[10px] px-2 py-0 h-5 border-zinc-700 text-zinc-500 bg-zinc-900"
            >
              Atlas Core v1.0
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <PageComponent />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
