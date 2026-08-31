import React, { useState } from 'react';
import { Search, BookOpen, AlertTriangle } from 'lucide-react';

const errorMappingJson = [
  {
    "provider": "Iugu",
    "status": 400,
    "code": "validation_error",
    "explanation": "Dados enviados são inválidos ou incompletos.",
    "fix": "Revise os campos obrigatórios (nome, CPF, valor) antes de submeter."
  },
  {
    "provider": "Iugu",
    "status": 422,
    "code": "card_declined",
    "explanation": "Cartão rejeitado pelo banco emissor (saldo insuficiente ou bloqueio preventivo).",
    "fix": "Oriente o cliente a usar outro cartão ou ligar para o banco."
  },
  {
    "provider": "Juno",
    "status": 401,
    "code": "unauthorized",
    "explanation": "Credenciais de acesso (Token) inválidas ou expiradas.",
    "fix": "Gere um novo Private Token no painel da Juno e atualize no cofre Nercash."
  },
  {
    "provider": "Asaas",
    "status": 400,
    "code": "invalid_customer",
    "explanation": "CPF ou CNPJ do cliente é inválido na base da Receita Federal.",
    "fix": "Implemente uma validação de máscara e dígito verificador no front-end."
  }
];

export const ProviderErrorTranslator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredMapping = errorMappingJson.filter(err => 
    err.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    err.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    err.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Provider Error Translator</h3>
            <p className="text-xs text-slate-500">Tradução de códigos de erro de Iugu, Juno e Asaas para explicações amigáveis.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por provedor, erro ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMapping.map((err, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{err.provider}</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold dark:bg-rose-950 dark:text-rose-400">
                  {err.status} - {err.code}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{err.explanation}</p>
              <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg dark:bg-orange-950/30">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-orange-800 dark:text-orange-400 block mb-1">Sugestão de Correção:</span>
                  <span className="text-xs text-orange-700 dark:text-orange-300">{err.fix}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
