'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'ak_001',
    name: 'Produção — API Principal',
    key: 'atlas_sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    createdAt: '2024-06-15T10:00:00Z',
    lastUsed: '2025-01-10T15:30:00Z',
  },
  {
    id: 'ak_002',
    name: 'Teste — Sandbox',
    key: 'atlas_sk_test_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
    createdAt: '2024-09-01T08:00:00Z',
    lastUsed: '2025-01-09T12:00:00Z',
  },
  {
    id: 'ak_003',
    name: 'Webhook — Notificações',
    key: 'atlas_sk_live_w4r3t2y1u6i5o4p3a2s1d2f3g4h5j6k7',
    createdAt: '2024-11-20T14:00:00Z',
    lastUsed: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return key.slice(0, 12) + '••••••••••••••••••••';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newKey: ApiKey = {
        id: `ak_${Date.now().toString(36)}`,
        name: newKeyName || 'Nova Chave',
        key: `atlas_sk_live_${Math.random().toString(36).slice(2, 34)}`,
        createdAt: new Date().toISOString(),
        lastUsed: null,
      };
      setKeys([newKey, ...keys]);
      setSubmitting(false);
      setCreateDialogOpen(false);
      setNewKeyName('');
    }, 1200);
  };

  const handleCopyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Info Banner ── */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-zinc-200">Segurança das Chaves API</p>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            As suas chaves API permitem acesso programático à sua conta. Nunca partilhe as suas chaves secretas.
            Rotacione periodicamente as chaves por segurança.
          </p>
        </div>
      </div>

      {/* ── API Keys Table ── */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-400" />
                Chaves API
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1">
                Gerencie as chaves de acesso à API da sua conta.
              </CardDescription>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/20 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              Gerar Nova Chave
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs font-medium">Nome</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Chave</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Criado em</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Último Uso</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((apiKey) => {
                  const isRevealed = revealedIds.has(apiKey.id);
                  return (
                    <TableRow key={apiKey.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                            <Key className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <span className="text-sm text-zinc-200 font-medium">{apiKey.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className={cn(
                            'text-xs font-mono rounded px-2 py-1 bg-zinc-800/50 max-w-[240px] truncate',
                            isRevealed ? 'text-emerald-300' : 'text-zinc-400',
                          )}>
                            {isRevealed ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 shrink-0"
                            onClick={() => handleToggleReveal(apiKey.id)}
                            aria-label={isRevealed ? 'Ocultar chave' : 'Mostrar chave'}
                          >
                            {isRevealed ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                        {formatDate(apiKey.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {apiKey.lastUsed ? (
                          <span className="text-zinc-300">{formatDate(apiKey.lastUsed)}</span>
                        ) : (
                          <span className="text-zinc-600 italic">Nunca utilizada</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                            aria-label="Copiar chave"
                          >
                            {copiedId === apiKey.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeleteConfirmId(apiKey.id)}
                            aria-label="Eliminar chave"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Create Key Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              Gerar Nova Chave API
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Crie uma nova chave de acesso para integrar com a API Atlas Core.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Guarde a chave num local seguro após a criação. Não será possível ver a chave completa novamente após fechar esta janela.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name" className="text-zinc-300">Nome da Chave</Label>
                <Input
                  id="key-name"
                  placeholder="Ex: Produção — Checkout"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !newKeyName.trim()}
                className="w-full mt-2 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-900/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A gerar chave...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Gerar Nova Chave
                  </>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Eliminar Chave API
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Esta ação não pode ser revertida. Todas as integrações que utilizam esta chave deixarão de funcionar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold"
              onClick={() => deleteConfirmId && handleDeleteKey(deleteConfirmId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
