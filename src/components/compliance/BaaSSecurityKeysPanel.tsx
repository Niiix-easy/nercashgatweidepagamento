import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Key, ShieldCheck, Lock, RotateCw, Copy, Check, Eye, EyeOff, AlertTriangle, FileText, Server } from 'lucide-react';

interface BaaSKeyItem {
  id: string;
  name: string;
  provider: string;
  maskedKey: string;
  fullKey: string;
  hmacSecret: string;
  createdAt: string;
  lastRotated: string;
  status: 'active' | 'rotated' | 'revoked';
}

export const BaaSSecurityKeysPanel: React.FC = () => {
  const { addToast } = usePayment();
  const [keys, setKeys] = useState<BaaSKeyItem[]>([
    {
      id: 'key_baas_01',
      name: 'Asaas Production BaaS Key',
      provider: 'Asaas SPI v3',
      maskedKey: 'nercash_prod_live_••••••••98124',
      fullKey: 'nercash_prod_live_998124a8f9b2c3d4e5f6',
      hmacSecret: 'sec_hmac_asaas_8819284192048129',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString(),
      lastRotated: new Date(Date.now() - 1000 * 3600 * 24 * 7).toISOString(),
      status: 'active'
    },
    {
      id: 'key_baas_02',
      name: 'Iugu Banking Vault Key',
      provider: 'Iugu Banking Core',
      maskedKey: 'iugu_live_token_••••••••49182',
      fullKey: 'iugu_live_token_49182b7e6d5c4b3a2f1e0',
      hmacSecret: 'sec_hmac_iugu_7718294019283746',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 60).toISOString(),
      lastRotated: new Date(Date.now() - 1000 * 3600 * 24 * 15).toISOString(),
      status: 'active'
    },
    {
      id: 'key_baas_03',
      name: 'Juno SPI Integration Secret',
      provider: 'Juno Billing Engine',
      maskedKey: 'juno_spi_sec_••••••••55102',
      fullKey: 'juno_spi_sec_55102f1e2d3c4b5a6f7e8',
      hmacSecret: 'sec_hmac_juno_3391820491823746',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 90).toISOString(),
      lastRotated: new Date(Date.now() - 1000 * 3600 * 24 * 45).toISOString(),
      status: 'active'
    }
  ]);

  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<string | null>(null);

  const handleToggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Copiado', 'Chave ou segredo HMAC copiado com segurança para a área de transferência.', 'success');
  };

  const handleRotateSecret = (id: string) => {
    setIsRotating(id);
    setTimeout(() => {
      setIsRotating(null);
      setKeys(prev => prev.map(k => {
        if (k.id === id) {
          const newRand = Math.random().toString(36).substring(2, 10);
          return {
            ...k,
            hmacSecret: `sec_hmac_rotated_${newRand}`,
            lastRotated: new Date().toISOString()
          };
        }
        return k;
      }));
      addToast('Rotação de Segredo HMAC', 'O segredo HMAC e chaves de integração BaaS foram rotacionados com sucesso.', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gerenciamento de Chaves de Segurança & Segredos HMAC (BaaS)</h3>
              <p className="text-xs text-slate-500">Rotação programada de tokens de API e segredos HMAC-SHA256 para conformidade PCI-DSS 4.0</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addToast('Nova Chave BaaS', 'Utilize o painel de provisionamento para gerar novas credenciais por tenant.', 'info')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Key className="h-4 w-4" />
            <span>Gerar Nova Credencial BaaS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {keys.map((item) => {
            const isRevealed = revealedIds[item.id];
            const isThisRotating = isRotating === item.id;

            return (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/50 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">
                      <Server className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {item.provider}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">Última rotação: {new Date(item.lastRotated).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRotateSecret(item.id)}
                      disabled={isThisRotating}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${isThisRotating ? 'animate-spin' : ''}`} />
                      <span>{isThisRotating ? 'Rotacionando...' : 'Rotacionar Segredo HMAC'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  {/* API Key Box */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chave de API (Bearer Token)</span>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 font-mono text-xs">
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        {isRevealed ? item.fullKey : item.maskedKey}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleReveal(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                          title={isRevealed ? 'Ocultar Chave' : 'Revelar Chave'}
                        >
                          {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.fullKey, item.id + '_key')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-all"
                          title="Copiar Chave"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* HMAC Secret Box */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Segredo HMAC-SHA256 (Webhook & Assinatura)</span>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 font-mono text-xs">
                      <span className="text-violet-600 dark:text-violet-400 truncate">
                        {isRevealed ? item.hmacSecret : 'sec_hmac_••••••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.hmacSecret, item.id + '_secret')}
                          className="p-1 rounded text-slate-400 hover:text-violet-600 transition-all"
                          title="Copiar Segredo HMAC"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
