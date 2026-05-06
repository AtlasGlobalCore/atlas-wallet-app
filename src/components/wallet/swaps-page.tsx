'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  mockWallets,
  mockFeeSchedules,
  currencySymbols,
  currencyColors,
} from '@/lib/mock-data';
import { Currency, TierLevel, TransactionType } from '@/types/atlas';
import {
  ArrowRightLeft,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Percent,
  Info,
  ArrowRight,
  Wallet,
  ChevronDown,
} from 'lucide-react';

const APPROX_RATES: Record<string, number> = {
  'EUR-BRL': 5.35,
  'BRL-EUR': 0.187,
  'EUR-USD': 1.08,
  'USD-EUR': 0.926,
  'EUR-USDT': 1.08,
  'USDT-EUR': 0.926,
  'BRL-USD': 0.202,
  'USD-BRL': 4.95,
  'BRL-USDT': 0.202,
  'USDT-BRL': 4.95,
  'USD-USDT': 1.0,
  'USDT-USD': 1.0,
};

interface SwapQuote {
  rate: number;
  feePercentage: number;
  feeFixed: number;
  feeApplied: number;
  fromAmount: number;
  toAmount: number;
  estimatedTime: string;
}

const TIER_LABELS: Record<string, string> = {
  [TierLevel.TIER_1_BASIC]: 'KYC-1 Básico',
  [TierLevel.TIER_2_VERIFIED]: 'KYC-2 Verificado',
  [TierLevel.TIER_3_CORPORATE]: 'KYC-3 Corporativo',
};

export default function SwapsPage() {
  const [fromCurrency, setFromCurrency] = useState<Currency>(Currency.EUR);
  const [toCurrency, setToCurrency] = useState<Currency>(Currency.BRL);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeeTable, setShowFeeTable] = useState(true);

  const numericAmount = parseFloat(amount) || 0;
  const fromWallet = mockWallets.find((w) => w.currency === fromCurrency);
  const toWallet = mockWallets.find((w) => w.currency === toCurrency);

  const swapFeeSchedules = useMemo(
    () => mockFeeSchedules.filter((f) => f.transactionType === TransactionType.SWAP),
    []
  );

  const handleSwapDirection = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setQuote(null);
    setAmount('');
  };

  const handleGetQuote = () => {
    if (numericAmount <= 0 || fromCurrency === toCurrency) return;

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const rateKey = `${fromCurrency}-${toCurrency}`;
      const rate = APPROX_RATES[rateKey] || 1;

      // Use TIER_3_CORPORATE fees for this user
      const fee = swapFeeSchedules.find(
        (f) => f.tier === TierLevel.TIER_3_CORPORATE
      ) || swapFeeSchedules[0];

      const feeApplied = numericAmount * fee.percentageFee + fee.fixedFee;
      const toAmount = (numericAmount - feeApplied) * rate;

      setQuote({
        rate,
        feePercentage: fee.percentageFee,
        feeFixed: fee.fixedFee,
        feeApplied,
        fromAmount: numericAmount,
        toAmount,
        estimatedTime: '< 5 segundos',
      });
      setIsLoading(false);
    }, 1200);
  };

  const handleExecuteSwap = () => {
    // Mock execution
    setQuote(null);
    setAmount('');
  };

  const isSameCurrency = fromCurrency === toCurrency;
  const canQuote = numericAmount > 0 && !isSameCurrency && fromWallet && numericAmount <= fromWallet.balanceAvailable;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Swap Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-emerald-400" />
            Converter Moeda
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Troca instantânea entre as suas carteiras
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* From Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-500 uppercase tracking-wider">De</Label>
              {fromWallet && (
                <span className="text-[10px] text-zinc-500">
                  Disponível:{' '}
                  <span className={`font-medium ${currencyColors[fromCurrency]}`}>
                    {currencySymbols[fromCurrency]} {fromWallet.balanceAvailable.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                  {currencySymbols[fromCurrency]}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setQuote(null);
                  }}
                  className="h-12 pl-9 pr-4 text-lg font-bold border-zinc-700 bg-zinc-800/50 text-zinc-100 text-right focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50"
                  min="0"
                  step="0.01"
                />
              </div>
              <select
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value as Currency);
                  setQuote(null);
                }}
                className="h-12 px-3 rounded-md border border-zinc-700 bg-zinc-800/50 text-zinc-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/50 cursor-pointer appearance-none"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {fromWallet && numericAmount > fromWallet.balanceAvailable && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="size-3" />
                Saldo insuficiente
              </p>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-1">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 transition-colors"
              onClick={handleSwapDirection}
            >
              <ArrowRight className="size-4 rotate-90" />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-500 uppercase tracking-wider">Para</Label>
              {toWallet && (
                <span className="text-[10px] text-zinc-500">
                  Saldo atual:{' '}
                  <span className={`font-medium ${currencyColors[toCurrency]}`}>
                    {currencySymbols[toCurrency]} {toWallet.balanceAvailable.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                  {currencySymbols[toCurrency]}
                </span>
                <Input
                  type="text"
                  readOnly
                  placeholder={quote ? quote.toAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  value={quote ? quote.toAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                  className="h-12 pl-9 pr-4 text-lg font-bold border-zinc-700 bg-zinc-800/50 text-emerald-400 text-right"
                />
              </div>
              <select
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value as Currency);
                  setQuote(null);
                }}
                className="h-12 px-3 rounded-md border border-zinc-700 bg-zinc-800/50 text-zinc-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/50 cursor-pointer appearance-none"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Get Quote Button */}
          {!quote && (
            <Button
              className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/25 font-medium"
              disabled={!canQuote || isLoading}
              onClick={handleGetQuote}
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  A obter cotação...
                </>
              ) : (
                <>
                  <TrendingUp className="size-4 mr-1.5" />
                  Obter Cotação
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quote Result */}
      {quote && (
        <Card className="bg-zinc-900/50 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              Cotação Obtida
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Taxa de câmbio</span>
                <span className="text-sm font-semibold text-zinc-100">
                  1 {fromCurrency} = {quote.rate.toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Taxa aplicada</span>
                <span className="text-sm font-medium text-amber-400">
                  {quote.feePercentage > 0 ? `${(quote.feePercentage * 100).toFixed(2)}%` : '0%'}
                  {quote.feeFixed > 0 ? ` + ${currencySymbols[fromCurrency]}${quote.feeFixed.toFixed(2)}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Taxa total</span>
                <span className="text-sm font-medium text-amber-400">
                  {currencySymbols[fromCurrency]} {quote.feeApplied.toFixed(2)}
                </span>
              </div>
              <Separator className="bg-emerald-500/10" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Envia</span>
                <span className={`text-sm font-bold ${currencyColors[fromCurrency]}`}>
                  {currencySymbols[fromCurrency]} {quote.fromAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Recebe</span>
                <span className={`text-lg font-bold ${currencyColors[toCurrency]}`}>
                  {currencySymbols[toCurrency]} {quote.toAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Tempo estimado</span>
                <div className="flex items-center gap-1">
                  <Clock className="size-3 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">{quote.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => setQuote(null)}
              >
                Nova Cotação
              </Button>
              <Button
                className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/25 font-medium"
                onClick={handleExecuteSwap}
              >
                <Sparkles className="size-4 mr-1.5" />
                Executar Swap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Schedule Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="cursor-pointer" onClick={() => setShowFeeTable(!showFeeTable)}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Percent className="size-4 text-teal-400" />
                Tabela de Taxas de Swap
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-1">
                Taxas por nível de conta (KYC)
              </CardDescription>
            </div>
            <ChevronDown className={`size-4 text-zinc-500 transition-transform ${showFeeTable ? 'rotate-180' : ''}`} />
          </div>
        </CardHeader>
        {showFeeTable && (
          <CardContent className="pt-0">
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80">Nível</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right">Taxa (%)</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right">Taxa Fixa</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium bg-zinc-900/80 text-right hidden sm:table-cell">Exemplo (€1,000)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {swapFeeSchedules
                    .sort((a, b) => {
                      const order = {
                        [TierLevel.TIER_1_BASIC]: 1,
                        [TierLevel.TIER_2_VERIFIED]: 2,
                        [TierLevel.TIER_3_CORPORATE]: 3,
                      };
                      return (order[a.tier] || 99) - (order[b.tier] || 99);
                    })
                    .map((fee) => {
                      const exampleFee = 1000 * fee.percentageFee + fee.fixedFee;
                      const isCurrentTier = fee.tier === TierLevel.TIER_3_CORPORATE;

                      return (
                        <TableRow
                          key={fee.id}
                          className={`border-zinc-800 ${isCurrentTier ? 'bg-emerald-500/5' : 'hover:bg-zinc-800/30'}`}
                        >
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-300 font-medium">
                                {TIER_LABELS[fee.tier] || fee.tier}
                              </span>
                              {isCurrentTier && (
                                <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">
                                  Atual
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <span className="text-xs text-zinc-300 font-mono">
                              {(fee.percentageFee * 100).toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <span className="text-xs text-zinc-300 font-mono">
                              {fee.fixedFee > 0 ? `€ ${fee.fixedFee.toFixed(2)}` : 'Gratuita'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-2.5 hidden sm:table-cell">
                            <span className={`text-xs font-mono ${isCurrentTier ? 'text-emerald-400' : 'text-zinc-400'}`}>
                              € {exampleFee.toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
              <Info className="size-3.5 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                As taxas são calculadas automaticamente com base no seu nível KYC. Contas corporativas (KYC-3) beneficiam das taxas mais baixas.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
