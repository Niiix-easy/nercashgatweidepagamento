import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Laptop, 
  Smartphone, 
  Server, 
  Globe, 
  MapPin, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RotateCw,
  Fingerprint,
  UserCheck,
  Zap,
  Info,
  Shield,
  Layers
} from 'lucide-react';

export interface UserSessionRecord {
  id: string;
  userName: string;
  userEmail: string;
  role: 'Super Admin' | 'Security Officer' | 'DevOps Lead' | 'Tenant Admin';
  status: 'active_current' | 'active_remote' | 'expired' | 'revoked' | 'blocked_suspicious';
  ipAddress: string;
  location: string;
  countryCode: string;
  isp: string;
  deviceType: 'desktop' | 'mobile' | 'server';
  deviceFingerprint: string;
  browser: string;
  os: string;
  authMethod: 'Passkey FIDO2 (Biometria)' | 'MFA TOTP 6-Dígitos' | 'Google OAuth 2.0' | 'Hardware YubiKey 5C';
  trustScore: number; // 0 - 100
  lastActive: string;
  loginTime: string;
}

export const SecurityActivityTab: React.FC = () => {
  const { addAuditLog } = usePayment();

  const [sessions, setSessions] = useState<UserSessionRecord[]>([
    {
      id: 'sess_live_current',
      userName: 'Maycon Quevedo',
      userEmail: 'mayconquevedocompartilhar@gmail.com',
      role: 'Super Admin',
      status: 'active_current',
      ipAddress: '177.136.241.98',
      location: 'São Paulo, SP - Brasil',
      countryCode: 'BR',
      isp: 'AS27699 TELEFÔNICA BRASIL S.A (Vivo Fibra)',
      deviceType: 'desktop',
      deviceFingerprint: 'fp_mac_seq_m3_a9284f10',
      browser: 'Google Chrome 128.0.6613.120',
      os: 'macOS Sequoia 15.1 (Apple Silicon M3 Max)',
      authMethod: 'Passkey FIDO2 (Biometria)',
      trustScore: 99,
      lastActive: 'Agora (Sessão Atual)',
      loginTime: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      id: 'sess_remote_mobile',
      userName: 'Maycon Quevedo',
      userEmail: 'mayconquevedocompartilhar@gmail.com',
      role: 'Super Admin',
      status: 'active_remote',
      ipAddress: '187.19.22.45',
      location: 'Rio de Janeiro, RJ - Brasil',
      countryCode: 'BR',
      isp: 'AS28573 CLARO S.A (5G Standalone)',
      deviceType: 'mobile',
      deviceFingerprint: 'fp_ios18_ip16pro_88f9a21b',
      browser: 'Safari Mobile 18.0',
      os: 'iOS 18.0.1 (iPhone 16 Pro Max)',
      authMethod: 'Hardware YubiKey 5C',
      trustScore: 96,
      lastActive: 'Há 12 minutos',
      loginTime: new Date(Date.now() - 1000 * 60 * 95).toISOString()
    },
    {
      id: 'sess_remote_devops',
      userName: 'Carlos Silva (DevOps)',
      userEmail: 'carlos.silva@nercash.com',
      role: 'DevOps Lead',
      status: 'active_remote',
      ipAddress: '200.189.12.4',
      location: 'Curitiba, PR - Brasil',
      countryCode: 'BR',
      isp: 'AS18881 COPEL TELECOMUNICACOES S.A',
      deviceType: 'desktop',
      deviceFingerprint: 'fp_lin_ub24_x86_c04918e7',
      browser: 'Firefox Developer Edition 130.0',
      os: 'Ubuntu Linux 24.04 LTS (x86_64)',
      authMethod: 'MFA TOTP 6-Dígitos',
      trustScore: 94,
      lastActive: 'Há 4 minutos',
      loginTime: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    },
    {
      id: 'sess_suspicious_block',
      userName: 'Conta Administrativa',
      userEmail: 'admin@nercash.com',
      role: 'Tenant Admin',
      status: 'blocked_suspicious',
      ipAddress: '194.26.29.112',
      location: 'Frankfurt, Hessen - Alemanha',
      countryCode: 'DE',
      isp: 'AS9009 M247 Europe (Datacenter Proxy)',
      deviceType: 'desktop',
      deviceFingerprint: 'fp_spoofed_win10_bot_00192',
      browser: 'Headless Chrome / Puppeteer 119.0',
      os: 'Windows Server 2022 (Virtual Machine)',
      authMethod: 'Google OAuth 2.0',
      trustScore: 12,
      lastActive: 'Bloqueado por Geo-fencing Zero-Trust',
      loginTime: new Date(Date.now() - 1000 * 60 * 320).toISOString()
    },
    {
      id: 'sess_expired_prev',
      userName: 'Maycon Quevedo',
      userEmail: 'mayconquevedocompartilhar@gmail.com',
      role: 'Super Admin',
      status: 'expired',
      ipAddress: '177.136.241.98',
      location: 'São Paulo, SP - Brasil',
      countryCode: 'BR',
      isp: 'AS27699 TELEFÔNICA BRASIL S.A (Vivo Fibra)',
      deviceType: 'desktop',
      deviceFingerprint: 'fp_mac_seq_m3_a9284f10',
      browser: 'Google Chrome 127.0',
      os: 'macOS Sequoia 15.0',
      authMethod: 'Passkey FIDO2 (Biometria)',
      trustScore: 99,
      lastActive: 'Expirado por timeout de 15 min de ociosidade',
      loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);
  const [selectedSessionToRevoke, setSelectedSessionToRevoke] = useState<UserSessionRecord | null>(null);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchSearch = 
        s.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ipAddress.includes(searchTerm) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.deviceFingerprint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.browser.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (deviceFilter !== 'all' && s.deviceType !== deviceFilter) return false;

      return true;
    });
  }, [sessions, searchTerm, statusFilter, deviceFilter]);

  // Revoke a single remote session
  const handleRevokeSingle = (session: UserSessionRecord) => {
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'revoked' as const } : s));
    
    addAuditLog({
      actor: 'Maycon Quevedo (Super Admin)',
      actorEmail: 'mayconquevedocompartilhar@gmail.com',
      action: `Revogou remotamente a sessão ${session.id} (IP: ${session.ipAddress}, Dispositivo: ${session.deviceFingerprint})`,
      category: 'security',
      resource: 'SecurityActivity / Session Manager',
      status: 'warning',
      ipAddress: '177.136.241.98',
      location: 'São Paulo, SP'
    });

    setActionFeedback(`Sessão ${session.id} do dispositivo ${session.browser} revogada imediatamente.`);
    setTimeout(() => setActionFeedback(null), 4000);
    setShowRevokeModal(false);
    setSelectedSessionToRevoke(null);
  };

  // Revoke all remote sessions except current
  const handleRevokeAllOtherSessions = () => {
    setSessions(prev => prev.map(s => s.status === 'active_remote' ? { ...s, status: 'revoked' as const } : s));

    addAuditLog({
      actor: 'Maycon Quevedo (Super Admin)',
      actorEmail: 'mayconquevedocompartilhar@gmail.com',
      action: 'Revogou em massa todas as outras sessões ativas remotas da plataforma',
      category: 'security',
      resource: 'SecurityActivity / Zero-Trust Session Reset',
      status: 'warning',
      ipAddress: '177.136.241.98',
      location: 'São Paulo, SP'
    });

    setActionFeedback('Todas as outras sessões remotas foram invalidadas com sucesso!');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID_Sessao', 'Usuario', 'Email', 'Cargo', 'Status', 'IP', 'Localizacao', 'ISP', 'Dispositivo', 'Browser_OS', 'Metodo_Auth', 'Trust_Score', 'Data_Login'];
    const rows = filteredSessions.map(s => [
      `"${s.id}"`,
      `"${s.userName}"`,
      `"${s.userEmail}"`,
      `"${s.role}"`,
      `"${s.status}"`,
      `"${s.ipAddress}"`,
      `"${s.location}"`,
      `"${s.isp.replace(/"/g, '""')}"`,
      `"${s.deviceFingerprint}"`,
      `"${s.browser} (${s.os})"`,
      `"${s.authMethod}"`,
      `"${s.trustScore}%"`,
      `"${s.loginTime}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_security_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    setActionFeedback('Trilha de atividades de segurança exportada em CSV.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const activeCount = sessions.filter(s => s.status === 'active_current' || s.status === 'active_remote').length;
  const blockedCount = sessions.filter(s => s.status === 'blocked_suspicious').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Notification Banner */}
      {actionFeedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 animate-fade-in shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Security Posture Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Sessions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sessões Ativas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeCount}</span>
            <span className="text-xs text-emerald-600 font-semibold dark:text-emerald-400">Dispositivos Autorizados</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Vinculados com biometria FIDO2</p>
        </div>

        {/* Card 2: 2FA & MFA Enforcement */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Proteção 2FA / MFA</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</span>
            <span className="text-xs text-slate-500">Obrigatório em Todas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Políticas Zero-Trust ativas</p>
        </div>

        {/* Card 3: Idle Session Timeout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Timeout por Ociosidade</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">15 min</span>
            <span className="text-xs text-amber-600 font-semibold dark:text-amber-400">Bloqueio Automático</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Proteção de tela PCI-DSS</p>
        </div>

        {/* Card 4: Suspicious Blocked */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tentativas Bloqueadas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{blockedCount}</span>
            <span className="text-xs text-slate-500">Bloqueios por Geo-IP</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Proxy Datacenter / TOR barrados</p>
        </div>
      </div>

      {/* Action Bar with Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sessões Recentes, Localização e Fingerprints de Dispositivos</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparência completa sobre endereços IP, geolocalização e métodos de autenticação de cada acesso administrativo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Revoke All Remote Button */}
            <button
              type="button"
              onClick={handleRevokeAllOtherSessions}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Revogar Todas as Outras Sessões</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar Trilha (CSV)</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por IP, Cidade, Fingerprint ou E-mail..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
            >
              <option value="all">Todos os Status de Sessão</option>
              <option value="active_current">Sessão Atual Ativa</option>
              <option value="active_remote">Sessões Remotas Ativas</option>
              <option value="blocked_suspicious">Bloqueios Suspeitos / Zero-Trust</option>
              <option value="expired">Expiradas por Ociosidade</option>
              <option value="revoked">Revogadas pelo Admin</option>
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <select
              value={deviceFilter}
              onChange={e => setDeviceFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
            >
              <option value="all">Todos os Tipos de Dispositivo</option>
              <option value="desktop">Computadores (Desktop / Laptop)</option>
              <option value="mobile">Smartphones (iOS / Android)</option>
              <option value="server">Servidores &amp; CLI</option>
            </select>
          </div>
        </div>

        {/* Sessions List Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhuma sessão encontrada para os filtros selecionados.
              </div>
            ) : (
              filteredSessions.map(session => {
                const isCurrent = session.status === 'active_current';
                const isBlocked = session.status === 'blocked_suspicious';
                const isRevoked = session.status === 'revoked';
                const isExpired = session.status === 'expired';

                return (
                  <div
                    key={session.id}
                    className={`p-4 transition-colors ${
                      isCurrent 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                        : isBlocked
                        ? 'bg-rose-50/30 dark:bg-rose-950/20'
                        : 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left: Device & Location info */}
                      <div className="flex items-start gap-3.5">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          isCurrent
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : isBlocked
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {session.deviceType === 'mobile' ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Laptop className="h-5 w-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {session.browser}
                            </h4>
                            
                            {/* Status Badge */}
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Sessão Atual
                              </span>
                            )}
                            {session.status === 'active_remote' && (
                              <span className="rounded-full bg-indigo-100 px-2 py-0.2 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                Ativa Remota
                              </span>
                            )}
                            {isBlocked && (
                              <span className="rounded-full bg-rose-100 px-2 py-0.2 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Bloqueio Zero-Trust
                              </span>
                            )}
                            {isExpired && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Expirada
                              </span>
                            )}
                            {isRevoked && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Revogada
                              </span>
                            )}

                            <span className="text-[11px] text-slate-400">• {session.os}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            {/* Location */}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              <strong className="font-semibold text-slate-700 dark:text-slate-300">{session.location}</strong>
                            </span>

                            {/* IP */}
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Globe className="h-3.5 w-3.5 text-slate-400" />
                              <span>{session.ipAddress}</span>
                            </span>

                            {/* ASN / ISP */}
                            <span className="text-[10px] text-slate-400 truncate max-w-xs">
                              {session.isp}
                            </span>
                          </div>

                          {/* Fingerprint & Auth */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[11px]">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Fingerprint className="h-3 w-3 text-indigo-500" />
                              <code className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {session.deviceFingerprint}
                              </code>
                            </span>

                            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <Lock className="h-3 w-3" />
                              <span>{session.authMethod}</span>
                            </span>

                            <span className="text-slate-400">
                              Última atividade: <strong className="text-slate-600 dark:text-slate-300">{session.lastActive}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Trust Score & Action Button */}
                      <div className="flex items-center gap-4 pt-2 lg:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Score Confiança</span>
                          <span className={`font-mono text-xs font-bold ${
                            session.trustScore >= 90 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : session.trustScore >= 70 
                              ? 'text-amber-500' 
                              : 'text-rose-600'
                          }`}>
                            {session.trustScore}/100
                          </span>
                        </div>

                        {session.status === 'active_remote' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSessionToRevoke(session);
                              setShowRevokeModal(true);
                            }}
                            className="flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/50 transition-colors shadow-2xs"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Revogar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Revoking a Single Session */}
      {showRevokeModal && selectedSessionToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revogar Sessão Remota
                </h3>
                <p className="text-xs text-slate-500">
                  Desconectar imediatamente este dispositivo
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1 dark:bg-slate-800/60">
              <p><strong>Dispositivo:</strong> {selectedSessionToRevoke.browser} ({selectedSessionToRevoke.os})</p>
              <p><strong>Localização:</strong> {selectedSessionToRevoke.location}</p>
              <p><strong>IP:</strong> {selectedSessionToRevoke.ipAddress}</p>
              <p><strong>Fingerprint:</strong> {selectedSessionToRevoke.deviceFingerprint}</p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedSessionToRevoke(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleRevokeSingle(selectedSessionToRevoke)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-500"
              >
                Confirmar Revogação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
