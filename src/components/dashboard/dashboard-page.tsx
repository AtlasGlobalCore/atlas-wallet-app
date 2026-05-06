'use client';

import React from 'react';
import { useNavStore } from '@/stores/nav-store';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  TrendingUp,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import {
  mockWallets,
  mockTransactions,
  currencySymbols,
  currencyColors,
  transactionTypeLabels,
  transactionStatusColors,
} from '@/lib/mock-data';
import { Currency, TransactionType, TransactionStatus } from '@/types/atlas';

// --- Helpers ---

const fmt = (n: number) =>
  n.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CURRENCY_FLAGS: Record<Currency, string> = {
  [Currency.EUR]: '🇪🇺',
  [Currency.BRL]: '🇧🇷',
  [Currency.USDT]: '₮',
  [Currency.USD]: '🇺🇸',
};

const INCOMING_TYPES: TransactionType[] = [
  TransactionType.PROXY_INCOMING,
  TransactionType.SETTLEMENT,
  TransactionType.TRANSFER,
];

function isIncoming(tx: { type: TransactionType; status: TransactionStatus }): boolean {
  if (tx.type === TransactionType.TRANSFER && tx.status !== TransactionStatus.INCOMING) {
    return false;
  }
  return INCOMING_TYPES.includes(tx.type);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Sparkline SVG Generator (decorative) ---
function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 opacity-60" fill="none">
      <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Stat Card ---
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  gradientFrom,
  gradientTo,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="flex items-start gap-4">
        <div
          className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} p-2.5 shrink-0`}
        >
          <Icon className="size-5 text-zinc-100" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-400 truncate">{label}</p>
          <p className="text-2xl font-bold text-zinc-100 mt-0.5 truncate">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp
              className={`size-3.5 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}
            />
            <span
              className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {trend}
            </span>
            <span className="text-xs text-zinc-500 ml-1">vs. mês anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Wallet Card ---
function WalletCard({ wallet }: { wallet: (typeof mockWallets)[number] }) {
  const colorClass = currencyColors[wallet.currency];
  const symbol = currencySymbols[wallet.currency];
  const flag = CURRENCY_FLAGS[wallet.currency];
  const total =
    wallet.balanceAvailable +
    wallet.balancePending +
    wallet.balanceIncoming +
    wallet.balanceBlocked;
  const availablePct = total > 0 ? (wallet.balanceAvailable / total) * 100 : 0;

  // Generate decorative sparkline data
  const sparkData = [
    wallet.balanceAvailable * 0.7,
    wallet.balanceAvailable * 0.85,
    wallet.balanceAvailable * 0.75,
    wallet.balanceAvailable * 0.9,
    wallet.balanceAvailable * 0.95,
    wallet.balanceAvailable * 0.88,
    wallet.balanceAvailable,
  ];

  const sparkColor =
    wallet.currency === Currency.EUR
      ? '#60a5fa'
      : wallet.currency === Currency.BRL
        ? '#4ade80'
        : wallet.currency === Currency.USDT
          ? '#34d399'
          : '#fbbf24';

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 py-4">
      <CardContent className="space-y-4">
        {/* Currency header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{flag}</span>
            <span className={`text-sm font-semibold ${colorClass}`}>
              {wallet.currency}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-zinc-700 text-zinc-500"
            >
              {wallet.walletReference}
            </Badge>
          </div>
          <Wallet className="size-4 text-zinc-500" />
        </div>

        {/* Balance rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Disponível</span>
            <span className={`text-sm font-semibold ${colorClass}`}>
              {symbol} {fmt(wallet.balanceAvailable)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Pendente</span>
            <span className="text-sm font-medium text-zinc-300">
              {symbol} {fmt(wallet.balancePending)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">A receber</span>
            <span className="text-sm font-medium text-zinc-300">
              {symbol} {fmt(wallet.balanceIncoming)}
            </span>
          </div>
          {wallet.balanceBlocked > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Bloqueado</span>
              <span className="text-sm font-medium text-red-400/70">
                {symbol} {fmt(wallet.balanceBlocked)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              Utilização
            </span>
            <span className="text-[10px] text-zinc-500">{availablePct.toFixed(0)}% disponível</span>
          </div>
          <Progress value={availablePct} className="h-1.5 bg-zinc-800" />
        </div>

        {/* Sparkline */}
        <MiniSparkline values={sparkData} color={sparkColor} />
      </CardContent>
    </Card>
  );
}

// --- Transaction Row ---
function TransactionRow({ tx }: { tx: (typeof mockTransactions)[number] }) {
  const incoming = isIncoming(tx);
  const symbol = currencySymbols[tx.currency];
  const typeColor = incoming ? 'text-emerald-400' : 'text-red-400';
  const amountColor = incoming ? 'text-emerald-400' : 'text-red-400';
  const prefix = incoming ? '+' : '-';

  const typeBg = incoming
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : tx.type === TransactionType.SWAP
      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      {/* Icon */}
      <div
        className={`flex items-center justify-center rounded-lg p-2 shrink-0 ${
          incoming ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`}
      >
        {incoming ? (
          <ArrowDownLeft className="size-4 text-emerald-400" />
        ) : (
          <ArrowUpRight className="size-4 text-red-400" />
        )}
      </div>

      {/* Type + Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 border ${typeBg}`}
          >
            {transactionTypeLabels[tx.type]}
          </Badge>
        </div>
        <p className="text-sm text-zinc-300 truncate mt-0.5">
          {tx.description || '—'}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">
          {symbol} {tx.currency}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {prefix} {symbol} {fmt(tx.amount)}
        </p>
        {tx.feeApplied > 0 && (
          <p className="text-[10px] text-zinc-500">Taxa: {symbol} {fmt(tx.feeApplied)}</p>
        )}
      </div>

      {/* Status + Date */}
      <div className="text-right shrink-0 hidden md:block">
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 h-4 border ${transactionStatusColors[tx.status]}`}
        >
          {tx.status === TransactionStatus.COMPLETED
            ? 'Concluído'
            : tx.status === TransactionStatus.PENDING
              ? 'Pendente'
              : tx.status === TransactionStatus.INCOMING
                ? 'A receber'
                : tx.status === TransactionStatus.FAILED
                  ? 'Falhou'
                  : tx.status === TransactionStatus.BLOCKED
                    ? 'Bloqueado'
                    : tx.status}
        </Badge>
        <p className="text-[10px] text-zinc-500 mt-1">{formatDate(tx.createdAt)}</p>
      </div>
    </div>
  );
}

// --- Main Dashboard Page ---
export default function DashboardPage() {
  const { setPage } = useNavStore();
  const { getUserRole } = useAuthStore();
  const role = getUserRole();

  // --- Computed Stats ---
  const totalBalance = mockWallets.reduce(
    (sum, w) => sum + w.balanceAvailable,
    0
  );
  const totalPending = mockWallets.reduce(
    (sum, w) => sum + w.balancePending,
    0
  );
  const totalIncoming = mockWallets.reduce(
    (sum, w) => sum + w.balanceIncoming,
    0
  );

  // Transactions this month
  const now = new Date();
  const thisMonthTxs = mockTransactions.filter((tx) => {
    const txDate = new Date(tx.createdAt);
    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    );
  });

  const recentTxs = [...mockTransactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Quick actions visibility: only for customer/merchant/super_merchant
  const showQuickActions = ['customer', 'merchant', 'super_merchant'].includes(
    role
  );

  return (
    <div className="space-y-6">
      {/* ========== 1. Summary Stats Row ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Saldo Total"
          value={`€ ${fmt(totalBalance)}`}
          trend="+12.5%"
          trendUp={true}
          gradientFrom="from-emerald-600/40"
          gradientTo="to-teal-600/20"
        />
        <StatCard
          icon={Clock}
          label="Valor Pendente"
          value={`€ ${fmt(totalPending)}`}
          trend="-3.2%"
          trendUp={false}
          gradientFrom="from-amber-600/40"
          gradientTo="to-orange-600/20"
        />
        <StatCard
          icon={ArrowDownLeft}
          label="A Receber"
          value={`€ ${fmt(totalIncoming)}`}
          trend="+8.1%"
          trendUp={true}
          gradientFrom="from-teal-600/40"
          gradientTo="to-cyan-600/20"
        />
        <StatCard
          icon={AlertCircle}
          label="Transações Este Mês"
          value={thisMonthTxs.length.toString()}
          trend="+24%"
          trendUp={true}
          gradientFrom="from-violet-600/40"
          gradientTo="to-purple-600/20"
        />
      </div>

      {/* ========== 2. Wallet Overview ========== */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Carteiras
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200 h-7 px-2"
              onClick={() => setPage('wallets')}
            >
              Ver Todas
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========== 3. Recent Transactions ========== */}
      <Card className="bg-zinc-900/50 border-zinc-800 py-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Transações Recentes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200 h-7 px-2"
              onClick={() => setPage('transactions')}
            >
              Ver Todas
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentTxs.length > 0 ? (
              recentTxs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <AlertCircle className="size-8 mb-2 opacity-40" />
                <p className="text-sm">Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========== 4. Quick Actions ========== */}
      {showQuickActions && (
        <Card className="bg-zinc-900/50 border-zinc-800 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => setPage('deposits')}
                className="h-12 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 font-medium text-sm gap-2"
                variant="outline"
              >
                <ArrowDownLeft className="size-4" />
                Depositar
              </Button>
              <Button
                onClick={() => setPage('swaps')}
                className="h-12 bg-teal-600/20 border border-teal-500/30 text-teal-400 hover:bg-teal-600/30 hover:text-teal-300 font-medium text-sm gap-2"
                variant="outline"
              >
                <ArrowLeftRight className="size-4" />
                Swap
              </Button>
              <Button
                onClick={() => setPage('withdrawals')}
                className="h-12 bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 hover:text-amber-300 font-medium text-sm gap-2"
                variant="outline"
              >
                <ArrowUpRight className="size-4" />
                Levantar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
