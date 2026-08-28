import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { ApiKey } from '../../types/payment';
import { 
  Key, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Copy, 
  Check, 
  X, 
  Trash2, 
  RotateCcw, 
  Clock, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,
  Building,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export const ApiKeySecurityModule: React.FC = () => {
  const { apiKeys, tenants, currentTenant, createTenantApiKey, revokeApiKey, updateApiKeyPolicy } = usePayment();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('all');
  const [selectedEnvFilter, setSelectedEnvFilter] = useState<'all' | 'production' | 'sandbox'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'revoked' | 'expired'>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState<boolean>(false);
  const [revealedKey, setRevealedKey] = useState<ApiKey | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState<boolean>(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [isEditPolicyModalOpen, setIsEditPolicyModalOpen] = useState<boolean>(false);
  const [keyToEditPolicy, setKeyToEditPolicy] = useState<ApiKey | null>(null);
  const [newPolicy, setNewPolicy] = useState<ApiKey['expirationPolicy']>('90_days');

  // New Key Form State
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyTenantId, setNewKeyTenantId] = useState<string>(currentTenant.id);
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'sandbox'>('production');
  const [newKeyType, setNewKeyType] = useState<'secret' | 'publishable'>('secret');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([
    'charges:write',
    'charges:read',
    'webhooks:manage',
    'tokens:create'
  ]);
  const [newKeyExpirationPolicy, setNewKeyExpirationPolicy] = useState<'30_days' | '90_days' | '180_days' | '365_days' | 'never'>('90_days');
  const [newKeyIpWhitelist, setNewKeyIpWhitelist] = useState<string>('177.136.241.0/24');

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const availableScopes = [
    { id: 'charges:write', label: 'charges:write', desc: 'Criar e autorizar transações' },
    { id: 'charges:read', label: 'charges:read', desc: 'Consultar status e dados de cobrança' },
    { id: 'refunds:write', label: 'refunds:write', desc: 'Executar estornos totais ou parciais' },
    { id: 'tokens:create', label: 'tokens:create', desc: 'Tokenização de cartões PCI-DSS' },
    { id: 'webhooks:manage', label: 'webhooks:manage', desc: 'Configurar endpoints e subscrições' },
    { id: 'routes:admin', label: 'routes:admin', desc: 'Gerenciar regras do motor de orquestração' }
  ];

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Toggle Scope Checkbox
  const handleToggleScope = (scopeId: string) => {
    setNewKeyScopes(prev => 
      prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
    );
  };

  // Submit Create New Key
  const handleCreateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const targetTenant = tenants.find(t => t.id === newKeyTenantId) || currentTenant;
    const ips = newKeyIpWhitelist.split(',').map(ip => ip.trim()).filter(Boolean);

    const generated = createTenantApiKey({
      name: newKeyName.trim(),
      tenantId: targetTenant.id,
      tenantName: targetTenant.name,
      environment: newKeyEnv,
      type: newKeyType,
      scopes: newKeyScopes,
      expirationPolicy: newKeyExpirationPolicy,
      ipWhitelist: ips
    });

    setIsCreateModalOpen(false);
    setRevealedKey(generated);
    setIsRevealModalOpen(true);

    // Reset Form
    setNewKeyName('');
    setNewKeyScopes(['charges:write', 'charges:read', 'webhooks:manage', 'tokens:create']);
    setNewKeyExpirationPolicy('90_days');

    setNotification(`Chave ${generated.name} gerada com sucesso!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Confirm Revoke
  const handleConfirmRevoke = () => {
    if (!keyToRevoke) return;
    revokeApiKey(keyToRevoke.id, revokeReason.trim() || 'Revogação manual de segurança solicitada pelo administrador');
    setIsRevokeModalOpen(false);
    setKeyToRevoke(null);
    setRevokeReason('');
    setNotification('Chave de API revogada permanentemente.');
    setTimeout(() => setNotification(null), 3500);
  };

  // Confirm Edit Expiration Policy
  const handleConfirmEditPolicy = () => {
    if (!keyToEditPolicy || !newPolicy) return;
    updateApiKeyPolicy(keyToEditPolicy.id, newPolicy);
    setIsEditPolicyModalOpen(false);
    setKeyToEditPolicy(null);
    setNotification('Política de expiração atualizada com sucesso.');
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to compute expiration status
  const getKeyStatus = (key: ApiKey): { label: string; color: string; badgeClass: string } => {
    if (key.status === 'revoked') {
      return {
        label: 'Revogada',
        color: 'rose',
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
      };
    }

    if (!key.expiresAt || key.expirationPolicy === 'never') {
      return {
        label: 'Ativa (Sem Expiração)',
        color: 'emerald',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
      };
    }

    const expTime = new Date(key.expiresAt).getTime();
    const now = Date.now();
    const daysLeft = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return {
        label: 'Expirada',
        color: 'rose',
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
      };
    }

    if (daysLeft <= 15) {
      return {
        label: `Expira em ${daysLeft} dias`,
        color: 'amber',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
      };
    }

    return {
      label: `Ativa (${daysLeft}d restantes)`,
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    };
  };

  // Filtered keys
  const filteredKeys = useMemo(() => {
    return apiKeys.filter(k => {
      const matchesSearch = 
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (k.tenantName && k.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTenant = selectedTenantFilter === 'all' || k.tenantId === selectedTenantFilter;
      const matchesEnv = selectedEnvFilter === 'all' || k.environment === selectedEnvFilter;

      let matchesStatus = true;
      const statusObj = getKeyStatus(k);
      if (selectedStatusFilter === 'active') {
        matchesStatus = k.status !== 'revoked' && !statusObj.label.includes('Expirada');
      } else if (selectedStatusFilter === 'expiring_soon') {
        matchesStatus = statusObj.color === 'amber';
      } else if (selectedStatusFilter === 'revoked') {
        matchesStatus = k.status === 'revoked';
      } else if (selectedStatusFilter === 'expired') {
        matchesStatus = statusObj.label.includes('Expirada');
      }

      return matchesSearch && matchesTenant && matchesEnv && matchesStatus;
    });
  }, [apiKeys, searchTerm, selectedTenantFilter, selectedEnvFilter, selectedStatusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = apiKeys.length;
    const active = apiKeys.filter(k => k.status !== 'revoked').length;
    const revoked = apiKeys.filter(k => k.status === 'revoked').length;
    const expiringSoon = apiKeys.filter(k => getKeyStatus(k).color === 'amber').length;

    return { total, active, revoked, expiringSoon };
  }, [apiKeys]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total de Chaves</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Key className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {metrics.total}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Credenciais cadastradas</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chaves Ativas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.active}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Com permissão operacional</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expira em Breve</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {metrics.expiringSoon}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">&lt; 15 dias para rotação</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chaves Revogadas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {metrics.revoked}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Invalidadas permanentemente</span>
        </div>
      </div>

      {/* Action Banner Feedback */}
      {notification && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header & Create Button */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gerenciador de Credenciais de API & Políticas de Expiração
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Controle granular de chaves de API por tenant, escopos mínimos (RBAC), restrição de IP e ciclo de vida de expiração
            </p>
          </div>

          <button
            id="btn-open-create-api-key"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Gerar Nova Chave de API</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-search-api-keys"
              type="text"
              placeholder="Buscar por nome da chave, prefixo, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tenant Filter */}
            <select
              value={selectedTenantFilter}
              onChange={(e) => setSelectedTenantFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Tenants</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Environment Filter */}
            <select
              value={selectedEnvFilter}
              onChange={(e) => setSelectedEnvFilter(e.target.value as any)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Ambientes</option>
              <option value="production">Produção (Live)</option>
              <option value="sandbox">Sandbox (Test)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Apenas Ativas</option>
              <option value="expiring_soon">Expira em Breve (&lt;15d)</option>
              <option value="revoked">Revogadas</option>
              <option value="expired">Expiradas</option>
            </select>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Identificação / Tenant</th>
                <th className="px-4 py-3">Prefixo da Chave</th>
                <th className="px-4 py-3">Ambiente & Tipo</th>
                <th className="px-4 py-3">Escopos (RBAC)</th>
                <th className="px-4 py-3">Política & Expiração</th>
                <th className="px-4 py-3">IP Whitelist</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma chave de API encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => {
                  const statusInfo = getKeyStatus(key);
                  const isRevoked = key.status === 'revoked';
                  const maskedKey = `${key.key.substring(0, 10)}••••••••${key.key.substring(key.key.length - 4)}`;

                  return (
                    <tr 
                      key={key.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isRevoked ? 'opacity-60 bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Name & Tenant */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{key.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Building className="h-3 w-3" />
                          <span>{key.tenantName || 'Tenant Principal'}</span>
                        </div>
                      </td>

                      {/* Key Prefix & Mask */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-950 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                            {maskedKey}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(key.key, key.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                            title="Copiar Chave Completa"
                          >
                            {copiedKeyId === key.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Criada em: {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>

                      {/* Env & Type */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block w-max rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            key.environment === 'production'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          }`}>
                            {key.environment === 'production' ? 'Live' : 'Sandbox'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {key.type === 'secret' ? 'Secret Key (Server)' : 'Publishable (Client)'}
                          </span>
                        </div>
                      </td>

                      {/* Scopes */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(key.scopes || ['charges:write', 'tokens:create']).map((sc, i) => (
                            <span
                              key={i}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {sc.replace(':write', '+').replace(':read', '')}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Expiration Policy & Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 w-max rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusInfo.badgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              statusInfo.color === 'emerald' ? 'bg-emerald-500' :
                              statusInfo.color === 'amber' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                            }`} />
                            <span>{statusInfo.label}</span>
                          </span>

                          <span className="text-[10px] text-slate-400">
                            Política: {
                              key.expirationPolicy === '30_days' ? '30 Dias' :
                              key.expirationPolicy === '90_days' ? '90 Dias' :
                              key.expirationPolicy === '180_days' ? '180 Dias' :
                              key.expirationPolicy === '365_days' ? '1 Ano' : 'Sem Expiração'
                            }
                          </span>
                        </div>
                      </td>

                      {/* IP Whitelist */}
                      <td className="px-4 py-3.5">
                        {key.ipWhitelist && key.ipWhitelist.length > 0 ? (
                          <div className="space-y-0.5">
                            {key.ipWhitelist.map((ip, idx) => (
                              <span key={idx} className="block font-mono text-[10px] text-slate-600 dark:text-slate-400">
                                {ip}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Global (0.0.0.0/0)</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Policy */}
                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={() => {
                                setKeyToEditPolicy(key);
                                setNewPolicy(key.expirationPolicy || '90_days');
                                setIsEditPolicyModalOpen(true);
                              }}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
                              title="Alterar Política de Expiração"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Revoke Button */}
                          {!isRevoked ? (
                            <button
                              type="button"
                              onClick={() => {
                                setKeyToRevoke(key);
                                setIsRevokeModalOpen(true);
                              }}
                              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 transition-all"
                              title="Revogar Chave Permanentemente"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Revogar</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-500 italic">
                              Revogada
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW TENANT API KEY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Gerar Nova Credencial de API
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Isolamento por Tenant e Política de Segurança PCI-DSS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKeySubmit} className="mt-4 space-y-4">
              {/* Key Name / Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Identificador do Serviço:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Microsserviço de Cobrança Recorrente - AWS Lambda"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Tenant Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tenant Responsável:
                  </label>
                  <select
                    value={newKeyTenantId}
                    onChange={(e) => setNewKeyTenantId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ambiente:
                  </label>
                  <select
                    value={newKeyEnv}
                    onChange={(e) => setNewKeyEnv(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="production">Produção (Live - sk_live_...)</option>
                    <option value="sandbox">Sandbox (Test - sk_test_...)</option>
                  </select>
                </div>
              </div>

              {/* Key Type & Expiration Policy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Chave:
                  </label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="secret">Secret Key (Apenas Backend)</option>
                    <option value="publishable">Publishable Key (Front-end)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Política de Expiração:
                  </label>
                  <select
                    value={newKeyExpirationPolicy}
                    onChange={(e) => setNewKeyExpirationPolicy(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="30_days">30 Dias (Alta Segurança)</option>
                    <option value="90_days">90 Dias (Recomendado PCI)</option>
                    <option value="180_days">180 Dias (Semestral)</option>
                    <option value="365_days">365 Dias (1 Ano)</option>
                    <option value="never">Nunca Expira (Não Recomendado)</option>
                  </select>
                </div>
              </div>

              {/* Scopes Selection Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Escopos de Permissão (Mínimo Privilégio):
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                  {availableScopes.map((sc) => {
                    const isChecked = newKeyScopes.includes(sc.id);
                    return (
                      <label 
                        key={sc.id}
                        className="flex items-start gap-2 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleScope(sc.id)}
                          className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                        />
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{sc.label}</span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400">{sc.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* IP Whitelist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IP Whitelist (CIDRs permitidos separados por vírgula):
                </label>
                <input
                  type="text"
                  placeholder="ex: 177.136.241.98/32, 10.0.0.0/16 (ou deixe vazio para global)"
                  value={newKeyIpWhitelist}
                  onChange={(e) => setNewKeyIpWhitelist(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  Criar e Revelar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ONE-TIME SECRET KEY REVEAL */}
      {isRevealModalOpen && revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/50 bg-slate-900 p-6 shadow-2xl text-white dark:border-emerald-600/40">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-950">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Chave de API Criada com Sucesso!
                </h3>
                <span className="text-[11px] text-emerald-400">
                  {revealedKey.name} • {revealedKey.tenantName}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <p>
                <strong>Atenção de Segurança:</strong> Copie esta chave secreta agora. Por conformidade PCI-DSS e proteção contra vazamento, ela <strong>não será exibida novamente</strong>.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Chave Secreta Completa:
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-3">
                <code className="flex-1 font-mono text-xs font-bold text-emerald-400 break-all select-all">
                  {revealedKey.key}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(revealedKey.key, 'revealed_secret')}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shrink-0"
                >
                  {copiedKeyId === 'revealed_secret' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">Expiração:</span> {
                  revealedKey.expirationPolicy === '30_days' ? '30 Dias' :
                  revealedKey.expirationPolicy === '90_days' ? '90 Dias' :
                  revealedKey.expirationPolicy === '180_days' ? '180 Dias' :
                  revealedKey.expirationPolicy === '365_days' ? '1 Ano' : 'Sem Expiração'
                }
              </div>
              <div>
                <span className="text-slate-500">Ambiente:</span> {revealedKey.environment.toUpperCase()}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsRevealModalOpen(false);
                  setRevealedKey(null);
                }}
                className="w-full rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
              >
                Concluir & Guardei Minha Chave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REVOCATION CONFIRMATION */}
      {isRevokeModalOpen && keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revogar Chave de API
                </h3>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                  {keyToRevoke.name} ({keyToRevoke.key.substring(0, 12)}...)
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              Esta ação é <strong>imediata e irreversível</strong>. Quaisquer aplicações integradas utilizando esta credencial receberão erro HTTP 401 Unauthorized imediatamente.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motivo da Revogação (Obrigatório para Auditoria):
              </label>
              <textarea
                rows={2}
                required
                placeholder="ex: Chave vazada em repositório / Substituição por rotação periódica..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRevokeModalOpen(false);
                  setKeyToRevoke(null);
                }}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition-all"
              >
                Confirmar Revogação Imediata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT EXPIRATION POLICY */}
      {isEditPolicyModalOpen && keyToEditPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Alterar Política de Expiração
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {keyToEditPolicy.name}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selecione o Novo Ciclo de Expiração:
              </label>
              <select
                value={newPolicy}
                onChange={(e) => setNewPolicy(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="30_days">30 Dias (Alta Segurança)</option>
                <option value="90_days">90 Dias (Padrão Recomendado PCI)</option>
                <option value="180_days">180 Dias (Semestral)</option>
                <option value="365_days">365 Dias (1 Ano)</option>
                <option value="never">Nunca Expira</option>
              </select>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditPolicyModalOpen(false);
                  setKeyToEditPolicy(null);
                }}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmEditPolicy}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
              >
                Salvar Política
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
