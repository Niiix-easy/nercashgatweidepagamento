import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { AlertTriangle, BookOpen, Search, ShieldAlert, CheckCircle2, Terminal, Server, ExternalLink } from 'lucide-react';

interface BaasErrorItem {
  code: string;
  provider: 'Asaas' | 'Iugu' | 'Juno' | 'General';
  route: string;
  httpStatus: number;
  description: string;
  troubleshooting: string;
  severity: 'Low' | 'Medium' | 'High';
}

export const BaaSErrorCatalog: React.FC = () => {
  const { addToast } = usePayment();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  const errors: BaasErrorItem[] = [
    {
      code: 'ERR_ASAAS_INVALID_SIGNATURE',
      provider: 'Asaas',
      route: '/api/v1/baas/*',
      httpStatus: 401,
      description: 'Assinatura HMAC-SHA256 (x-nercash-signature) inválida ou ausente no cabeçalho.',
      troubleshooting: 'Verifique se o segredo HMAC configurado no cliente corresponde exatamente ao segredo do tenant no cofre Nercash.',
      severity: 'High'
    },
    {
      code: 'ERR_IUGU_CARD_DECLINED',
      provider: 'Iugu',
      route: '/api/v1/baas/credit-card',
      httpStatus: 422,
      description: 'Transação rejeitada pelo adquirente ou emissor do cartão por saldo insuficiente ou suspeita de fraude.',
      troubleshooting: 'Oriente o cliente a utilizar outro cartão ou verificar o limite disponível com o banco emissor.',
      severity: 'Medium'
    },
    {
      code: 'ERR_JUNO_BOLETO_DUPLICATE',
      provider: 'Juno',
      route: '/api/v1/baas/boleto',
      httpStatus: 400,
      description: 'Tentativa de registro de boleto com o mesmo nosso-número ou valor e CPF já existentes na mesma competência.',
      troubleshooting: 'Garanta a idempotência da requisição enviando um ID de transação único por tentativa.',
      severity: 'Low'
    },
    {
      code: 'ERR_SPI_PIX_TIMEOUT',
      provider: 'Asaas',
      route: '/api/v1/baas/pix-parcelado',
      httpStatus: 504,
      description: 'Timeout na comunicação com o SPI (Sistema de Pagamentos Instantâneos) do Banco Central do Brasil.',
      troubleshooting: 'Ative a política de retry automático com backoff exponencial no OrchestrationHub para reenvio seguro.',
      severity: 'High'
    },
    {
      code: 'ERR_INVALID_INSTALLMENTS',
      provider: 'General',
      route: '/api/v1/baas/credit-card',
      httpStatus: 400,
      description: 'Número de parcelas excede o limite permitido (máximo 24x) ou valor mínimo por parcela não atingido.',
      troubleshooting: 'Valide o payload de entrada no front-end antes de submeter a requisição ao gateway.',
      severity: 'Low'
    }
  ];

  const filteredErrors = errors.filter(err => {
    const matchesSearch = err.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          err.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          err.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = providerFilter === 'all' || err.provider.toLowerCase() === providerFilter.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catálogo de Erros BaaS & Guia de Resolução (Error Catalog)</h3>
              <p className="text-xs text-slate-500">Códigos de erro padronizados para Asaas, Iugu e Juno mapeados às rotas de integração Nercash</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Provedor:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">Todos os Provedores</option>
              <option value="asaas">Asaas</option>
              <option value="iugu">Iugu</option>
              <option value="juno">Juno</option>
              <option value="general">Geral</option>
            </select>
          </div>
        </div>

        {/* Error Cards Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Código & Provedor</th>
                <th className="p-3">Rota Afetada</th>
                <th className="p-3">HTTP Status</th>
                <th className="p-3">Descrição do Erro</th>
                <th className="p-3">Ação Recomendada (Troubleshooting)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredErrors.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3 space-y-1">
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 block">{item.code}</span>
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {item.provider}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300 text-[11px]">{item.route}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.httpStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px] max-w-xs">{item.description}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 text-[11px] font-medium max-w-sm">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item.troubleshooting}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
