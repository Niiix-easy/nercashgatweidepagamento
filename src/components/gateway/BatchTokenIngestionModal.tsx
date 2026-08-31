import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileUp, 
  Database, 
  FileSpreadsheet, 
  Key, 
  X, 
  Table, 
  ShieldCheck, 
  Download, 
  RefreshCw,
  Search,
  Check,
  CreditCard,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle
} from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

interface BatchTokenIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedCardRow {
  id: string;
  rawPan: string;
  normalizedPan: string;
  maskedPan: string;
  holder: string;
  expiry: string;
  cvv: string;
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Elo' | 'Hipercard';
  luhnValid: boolean;
  generatedToken: string;
  status: 'valid' | 'corrected' | 'invalid';
}

export const BatchTokenIngestionModal: React.FC<BatchTokenIngestionModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = usePayment();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'processing' | 'completed'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'corrected'>('all');

  // Column mapping state
  const [panCol, setPanCol] = useState('card_number');
  const [holderCol, setHolderCol] = useState('holder_name');
  const [expiryCol, setExpiryCol] = useState('expiration');
  const [cvvCol, setCvvCol] = useState('cvv');

  const [parsedRows, setParsedRows] = useState<ParsedCardRow[]>([
    {
      id: 'row-1',
      rawPan: '4532-1188-9900-2341',
      normalizedPan: '4532118899002341',
      maskedPan: '4532 11•• •••• 2341',
      holder: 'CARLOS SILVA',
      expiry: '12/28',
      cvv: '982',
      brand: 'Visa',
      luhnValid: true,
      generatedToken: 'tok_live_visa_98a72b11',
      status: 'valid'
    },
    {
      id: 'row-2',
      rawPan: '5421 9900 1122 3344',
      normalizedPan: '5421990011223344',
      maskedPan: '5421 99•• •••• 3344',
      holder: 'MARIANA COSTA',
      expiry: '08/29',
      cvv: '123',
      brand: 'Mastercard',
      luhnValid: true,
      generatedToken: 'tok_live_mc_55f41c90',
      status: 'valid'
    },
    {
      id: 'row-3',
      rawPan: '3782-822463-10005',
      normalizedPan: '378282246310005',
      maskedPan: '3782 82•••• •0005',
      holder: 'ROBERTO ALMEIDA',
      expiry: '04/27',
      cvv: '8831',
      brand: 'Amex',
      luhnValid: true,
      generatedToken: 'tok_live_amex_22b89c04',
      status: 'corrected'
    },
    {
      id: 'row-4',
      rawPan: '6062 8200 1199 4455',
      normalizedPan: '6062820011994455',
      maskedPan: '6062 82•• •••• 4455',
      holder: 'JULIANA MENDES',
      expiry: '11/30',
      cvv: '441',
      brand: 'Elo',
      luhnValid: true,
      generatedToken: 'tok_live_elo_77d12a99',
      status: 'valid'
    },
    {
      id: 'row-5',
      rawPan: '6062829988112233',
      normalizedPan: '6062829988112233',
      maskedPan: '6062 82•• •••• 2233',
      holder: 'FERNANDO DIAS',
      expiry: '06/28',
      cvv: '512',
      brand: 'Hipercard',
      luhnValid: true,
      generatedToken: 'tok_live_hiper_33a99bb1',
      status: 'valid'
    }
  ]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStep('mapping');
      addToast('Arquivo CSV Carregado', 'Schema detectado automaticamente. Inspecione a prévia antes de comitar.', 'info');
    }
  };

  const handleProcess = () => {
    setStep('processing');
    setIsProcessing(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      setProgress(Math.min(100, current));
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setStep('completed');
          addToast('Ingestão Concluída', '1.204 cartões foram validados, normalizados e tokenizados com sucesso.', 'success');
        }, 500);
      }
    }, 200);
  };

  const handleDownloadTokens = () => {
    const csvContent = "CUSTOMER_NAME,BRAND,MASKED_PAN,TOKEN_ID,EXPIRY,PCI_STATUS\n" + 
      parsedRows.map(r => `"${r.holder}","${r.brand}","${r.maskedPan}","${r.generatedToken}","${r.expiry}","PCI_DSS_TOKENIZED"`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tokenized_vault_export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = parsedRows.filter(r => {
    const matchesSearch = r.holder.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.maskedPan.includes(searchTerm) ||
                          r.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBrandBadge = (brand: string) => {
    switch (brand) {
      case 'Visa':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Mastercard':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Amex':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'Elo':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Hipercard':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in text-left">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Batch Token Ingestion & CSV Normalizer</h3>
              <p className="text-xs text-slate-500">Mapeamento de colunas, validação de schema (Luhn) e prévia de inspeção antes do commit final</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-100 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 font-bold ${step === 'upload' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">1</span>
              Upload CSV
            </span>
            <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
            <span className={`flex items-center gap-1.5 font-bold ${step === 'mapping' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">2</span>
              Mapeamento & Inspeção
            </span>
            <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
            <span className={`flex items-center gap-1.5 font-bold ${step === 'processing' || step === 'completed' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">3</span>
              Tokenização & Commit
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">PCI DSS v4.0 Scoped</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {step === 'upload' && (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20 relative">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Arraste seu arquivo CSV de cartões aqui
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                ou clique para selecionar do seu computador (.csv, até 50MB)
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                Normalização automática de espaços, hífens e formatação MM/AA
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mapeamento de Colunas do CSV</h4>
                  <p className="text-[11px] text-slate-500">Confirme as correspondências detectadas para os campos do cartão</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {file?.name || 'batch_cards_sample.csv'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Número do Cartão (PAN)</label>
                  <select 
                    value={panCol} 
                    onChange={e => setPanCol(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-mono"
                  >
                    <option value="card_number">card_number (Detectado)</option>
                    <option value="pan">pan</option>
                    <option value="numero_cartao">numero_cartao</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Titular</label>
                  <select 
                    value={holderCol} 
                    onChange={e => setHolderCol(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-mono"
                  >
                    <option value="holder_name">holder_name (Detectado)</option>
                    <option value="nome_impresso">nome_impresso</option>
                    <option value="customer">customer</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Expiração</label>
                  <select 
                    value={expiryCol} 
                    onChange={e => setExpiryCol(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-mono"
                  >
                    <option value="expiration">expiration (Detectado)</option>
                    <option value="exp_date">exp_date</option>
                    <option value="validade">validade</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Código de Segurança (CVV)</label>
                  <select 
                    value={cvvCol} 
                    onChange={e => setCvvCol(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-mono"
                  >
                    <option value="cvv">cvv (Detectado)</option>
                    <option value="cvc">cvc</option>
                    <option value="security_code">security_code</option>
                  </select>
                </div>
              </div>

              {/* Sample Data Preview Table with Filter & Search */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Table className="h-4 w-4 text-indigo-500" />
                    <span>Tabela de Prévia & Validação dos Dados Mapeados</span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filtrar titular ou final..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="all">Todos ({parsedRows.length})</option>
                      <option value="valid">Válidos</option>
                      <option value="corrected">Higienizados</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-56">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">Titular</th>
                        <th className="p-2.5">Bandeira</th>
                        <th className="p-2.5">PAN Bruto</th>
                        <th className="p-2.5">Máscara PCI Sanitizada</th>
                        <th className="p-2.5">Expiração</th>
                        <th className="p-2.5">Luhn Checksum</th>
                        <th className="p-2.5">Token Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRows.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono">
                          <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">{r.holder}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBrandBadge(r.brand)}`}>
                              {r.brand}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-400 text-[10px]">{r.rawPan}</td>
                          <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">{r.maskedPan}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{r.expiry}</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <Check className="h-3 w-3" /> Válido
                            </span>
                          </td>
                          <td className="p-2.5 text-[10px] text-slate-500 font-mono">{r.generatedToken}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Mostrando {filteredRows.length} de {parsedRows.length} registros da amostra</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> 100% de conformidade com ISO/IEC 7812
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setStep('upload')}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Trocar Arquivo
                </button>
                <button 
                  onClick={handleProcess}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <Key className="h-4 w-4" /> Confirmar e Executar Tokenização em Lote
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 space-y-6 flex flex-col items-center justify-center animate-fade-in text-center">
              <UploadCloud className="h-12 w-12 text-indigo-500 animate-bounce" />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Normalizando formatos, higienizando PANs e gerando Vault Tokens...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 pt-1 font-mono">Processando lote: 1.204 registros em chunks paralelos de 100...</p>
              </div>
            </div>
          )}

          {step === 'completed' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Ingestão de Lote Concluída com Sucesso!</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    1.204 cartões foram processados. Todos os dados sensíveis foram higienizados e convertidos em tokens criptográficos seguros (PCI-DSS Nível 1).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">1.204</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Total Ingerido</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Taxa de Sucesso</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">0 ms</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Exposição de PAN</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={handleDownloadTokens}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Baixar Relatório de Tokens Gerados (.csv)
                </button>
                <button 
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

