import React, { useState } from 'react';
import { Calendar, Clock, Mail, FileText, CheckCircle2, Send, Plus, Trash2, Settings, Shield } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const ReportSchedulerTab: React.FC = () => {
  const { addAuditLog } = usePayment();
  const [schedules, setSchedules] = useState<Array<{ id: string; name: string; frequency: string; recipients: string; format: string; lastSent: string; active: boolean }>>([
    { id: 'sch_1', name: 'Relatório Semanal de Risco & Chargeback', frequency: 'Toda Segunda-feira às 08:00', recipients: 'risco@bancodobrasil.com.br, compliance@nercash.com', format: 'PDF', lastSent: 'Há 3 dias', active: true },
    { id: 'sch_2', name: 'Sumário Diário de Gateways & SLA', frequency: 'Diariamente às 23:59', recipients: 'diretoria@bancodobrasil.com.br', format: 'PDF + CSV', lastSent: 'Ontem', active: true },
    { id: 'sch_3', name: 'Auditoria Mensal de Transações Pix', frequency: 'Todo dia 01 do mês', recipients: 'auditoria.interna@bb.com.br', format: 'PDF', lastSent: '1 Ago 2026', active: false }
  ]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFrequency, setNewFrequency] = useState('Diariamente');
  const [newRecipients, setNewRecipients] = useState('gestor@bancodobrasil.com.br');
  const [newFormat, setNewFormat] = useState('PDF');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRecipients) return;

    const newSch = {
      id: 'sch_' + Date.now(),
      name: newName,
      frequency: newFrequency,
      recipients: newRecipients,
      format: newFormat,
      lastSent: 'Nunca (Agendado)',
      active: true
    };

    setSchedules(prev => [newSch, ...prev]);
    setShowNewModal(false);
    setNewName('');
    setSuccessMsg('Agendamento de relatório criado e integrado ao serviço SMTP com sucesso.');

    addAuditLog({
      action: 'REPORT_SCHEDULE_CREATED',
      category: 'compliance',
      resourceType: 'ReportSchedule',
      resourceId: newSch.id,
      status: 'success',
      details: `Novo relatório agendado criado: ${newName} (${newFrequency}) para [${newRecipients}].`
    });

    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const toggleActive = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Agendamento Automático de Relatórios (PDF / Email)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure relatórios recorrentes despachados automaticamente para equipes de compliance e adquirentes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-3.5">
        {schedules.map(sch => (
          <div 
            key={sch.id}
            className={`rounded-3xl border p-5 transition-all ${
              sch.active 
                ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900' 
                : 'border-slate-200/60 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{sch.name}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {sch.format}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-500" /> {sch.frequency}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <Mail className="h-3 w-3 text-slate-400" /> {sch.recipients}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  Último envio: {sch.lastSent}
                </span>

                <button
                  type="button"
                  onClick={() => toggleActive(sch.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    sch.active 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {sch.active ? 'Ativo' : 'Pausado'}
                </button>

                <button
                  type="button"
                  onClick={() => deleteSchedule(sch.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                  title="Excluir Agendamento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Criar Novo Agendamento de Relatório
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Relatório
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Relatório Executivo de Fraudes"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frequência
                  </label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Diariamente às 23:59">Diariamente</option>
                    <option value="Toda Segunda-feira às 08:00">Semanal (Segunda)</option>
                    <option value="Todo dia 01 do mês">Mensal (Dia 01)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Formato
                  </label>
                  <select
                    value={newFormat}
                    onChange={e => setNewFormat(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="PDF">PDF Executivo</option>
                    <option value="CSV">Planilha CSV</option>
                    <option value="PDF + CSV">PDF + CSV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mails Destinatários (separados por vírgula)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: compliance@bancodobrasil.com.br, risk@nercash.com"
                  value={newRecipients}
                  onChange={e => setNewRecipients(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
                >
                  Salvar e Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
