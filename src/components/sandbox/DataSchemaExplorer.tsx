import React, { useState } from 'react';
import { Database, GitCommit, Layers, RefreshCcw, Server, ArrowRight } from 'lucide-react';

export const DataSchemaExplorer: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('PaymentIntents');

  const entities = [
    {
      name: 'PaymentIntents',
      description: 'Armazena intenções de pagamento e transações em tempo real',
      fields: ['id (PK)', 'amount', 'currency', 'status', 'acquirer_id', 'customer_id', 'created_at'],
      relations: ['Acquirers (N:1)', 'Customers (N:1)', 'AuditLogs (1:N)']
    },
    {
      name: 'Acquirers',
      description: 'Configurações de adquirentes de pagamento (Cielo, Stone, Adyen, Stripe)',
      fields: ['id (PK)', 'name', 'endpoint', 'priority', 'status', 'latency_ms'],
      relations: ['PaymentIntents (1:N)', 'RoutingRules (1:N)']
    },
    {
      name: 'RoutingRules',
      description: 'Regras de roteamento dinâmico baseadas em BIN, bandeira e valor',
      fields: ['id (PK)', 'rule_name', 'condition_expression', 'target_acquirer', 'is_active'],
      relations: ['Acquirers (N:1)']
    },
    {
      name: 'AuditLogs',
      description: 'Trilha de auditoria LGPD e alterações de low-code com hash imutável',
      fields: ['id (PK)', 'action_type', 'actor', 'payload_snapshot', 'timestamp', 'ip_address'],
      relations: ['PaymentIntents (N:1)']
    }
  ];

  const current = entities.find(e => e.name === selectedEntity) || entities[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Data Schema Explorer & ER-Diagram</h3>
              <p className="text-xs text-slate-500">Visualização interativa da estrutura de entidades e relacionamentos do banco de dados da plataforma</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Entidades do Core Database</h4>
            <div className="space-y-2">
              {entities.map(ent => (
                <button
                  key={ent.name}
                  type="button"
                  onClick={() => setSelectedEntity(ent.name)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-xs font-bold transition-all cursor-pointer ${
                    selectedEntity === ent.name
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-indigo-500" />
                    <span>{ent.name}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/50 space-y-6">
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Entidade Selecionada</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{current.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{current.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campos / Atributos (Schema)</span>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-1.5">
                  {current.fields.map((f, idx) => (
                    <div key={idx} className="font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Relacionamentos (ER)</span>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-1.5">
                  {current.relations.map((rel, idx) => (
                    <div key={idx} className="font-mono text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{rel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
