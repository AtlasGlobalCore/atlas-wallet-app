'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Link as LinkIcon,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  DollarSign,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'active' | 'expired' | 'paid';
  url: string;
  createdAt: string;
}

const INITIAL_LINKS: PaymentLink[] = [
  {
    id: 'pl_001',
    amount: 150.00,
    currency: 'EUR',
    description: 'Plano Premium Mensal',
    status: 'active',
    url: 'https://pay.atlascore.io/pl/abc123',
    createdAt: '2025-01-08T10:00:00Z',
  },
  {
    id: 'pl_002',
    amount: 2500.00,
    currency: 'USDT',
    description: 'Consultoria Web3 - Setup',
    status: 'paid',
    url: 'https://pay.atlascore.io/pl/def456',
    createdAt: '2025-01-06T14:30:00Z',
  },
  {
    id: 'pl_003',
    amount: 89.90,
    currency: 'BRL',
    description: 'Assinatura Trimestral',
    status: 'expired',
    url: 'https://pay.atlascore.io/pl/ghi789',
    createdAt: '2024-12-15T09:00:00Z',
  },
];

const LINK_STATUS_CONFIG: Record<PaymentLink['status'], { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  paid: { label: 'Pago', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  expired: { label: 'Expirado', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>(INITIAL_LINKS);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('EUR');
  const [formDescription, setFormDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newLink: PaymentLink = {
        id: `pl_${Date.now().toString(36)}`,
        amount: parseFloat(formAmount) || 0,
        currency: formCurrency,
        description: formDescription || 'Sem descrição',
        status: 'active',
        url: `https://pay.atlascore.io/pl/${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };
      setLinks([newLink, ...links]);
      setSubmitting(false);
      setCreateDialogOpen(false);
      setFormAmount('');
      setFormDescription('');
      setFormCurrency('EUR');
    }, 1200);
  };

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const currencySymbols: Record<string, string> = { EUR: '€', BRL: 'R$', USDT: '₮', USD: '$' };

  const stats = {
    active: links.filter((l) => l.status === 'active').length,
    paid: links.filter((l) => l.status === 'paid').length,
    total: links.length,
  };

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <LinkIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stats.active}</p>
              <p className="text-xs text-zinc-500">Links Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20">
              <DollarSign className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stats.paid}</p>
              <p className="text-xs text-zinc-500">Pagos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <FileText className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total de Links</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Links Table ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-emerald-400" />
              Links de Pagamento
            </CardTitle>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/20 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              Criar Novo Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {links.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50 border border-zinc-700 mb-4">
                <LinkIcon className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-base font-semibold text-zinc-300 mb-1">Sem links de pagamento</h3>
              <p className="text-sm text-zinc-500 mb-4 text-center max-w-sm">
                Crie o seu primeiro link de pagamento para começar a receber.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/20"
              >
                <Plus className="h-4 w-4" />
                Criar Primeiro Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs font-medium">Link</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Montante</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Moeda</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Estado</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => {
                    const statusCfg = LINK_STATUS_CONFIG[link.status];
                    return (
                      <TableRow key={link.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <code className="text-xs text-zinc-300 font-mono truncate max-w-[200px]">
                              {link.url}
                            </code>
                          </div>
                          {link.description && (
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{link.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono text-zinc-200 whitespace-nowrap">
                          {currencySymbols[link.currency] ?? ''}{link.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300 border-zinc-700 px-2 py-0 h-5">
                            {link.currency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] px-2 py-0 h-5', statusCfg.color)}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                          {formatDate(link.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => handleCopyLink(link.id, link.url)}
                              aria-label="Copiar link"
                            >
                              {copiedId === link.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-teal-400 hover:bg-teal-500/10"
                              aria-label="Abrir link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create Link Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Criar Link de Pagamento
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Gere um link de pagamento que pode partilhar com os seus clientes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="link-amount" className="text-zinc-300">Montante</Label>
              <Input
                id="link-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-currency" className="text-zinc-300">Moeda</Label>
              <Select value={formCurrency} onValueChange={setFormCurrency}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-emerald-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="EUR" className="text-zinc-200 focus:bg-zinc-800">EUR — Euro</SelectItem>
                  <SelectItem value="BRL" className="text-zinc-200 focus:bg-zinc-800">BRL — Real Brasileiro</SelectItem>
                  <SelectItem value="USDT" className="text-zinc-200 focus:bg-zinc-800">USDT — Tether</SelectItem>
                  <SelectItem value="USD" className="text-zinc-200 focus:bg-zinc-800">USD — Dólar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-desc" className="text-zinc-300">Descrição</Label>
              <Input
                id="link-desc"
                placeholder="Ex: Plano Premium Mensal"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !formAmount || parseFloat(formAmount) <= 0}
              className="w-full mt-2 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-900/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A gerar link...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Gerar Link de Pagamento
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
