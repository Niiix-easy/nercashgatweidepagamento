import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  Building2, 
  Globe, 
  AlertCircle,
  Zap,
  Server,
  Fingerprint,
  UserPlus,
  UserCheck,
  Sparkles,
  Users,
  Trash2
} from 'lucide-react';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { SecurityHardeningEngine } from '../../services/securityHardening';

export interface UserAccount {
  name: string;
  email: string;
  role: string;
  agency: string;
  account: string;
  avatar?: string;
  firstAccessAt?: string;
  lastLoginAt?: string;
  isRemembered?: boolean;
}

interface BbLoginLandingPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    name: 'Maycon Quevedo (Neer Software)',
    email: 'neersoftwarebr@gmail.com',
    role: 'Super Admin Master & Director',
    agency: '0001-9',
    account: '100502-X',
    firstAccessAt: '2026-08-30T10:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    isRemembered: true
  },
  {
    name: 'Mamannan Admin',
    email: 'mamannan@nercash.com',
    role: 'Enterprise Super Admin',
    agency: '3241-8',
    account: '98432-X',
    firstAccessAt: '2026-08-25T14:30:00.000Z',
    lastLoginAt: '2026-08-29T18:20:00.000Z',
    isRemembered: true
  }
];

export const BbLoginLandingPage: React.FC<BbLoginLandingPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'first_access'>('login');
  const [name, setName] = useState('Maycon Quevedo');
  const [email, setEmail] = useState('neersoftwarebr@gmail.com');
  const [password, setPassword] = useState('25150605T@pme');
  const [role, setRole] = useState('Super Admin Master & Director');
  const [agency, setAgency] = useState('0001-9');
  const [account, setAccount] = useState('100502-X');
  const [rememberUser, setRememberUser] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Load saved accounts from localStorage or initialize with default
  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem('nercash_saved_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading saved accounts', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  // Keep localStorage in sync with saved accounts
  useEffect(() => {
    try {
      localStorage.setItem('nercash_saved_accounts', JSON.stringify(savedAccounts));
    } catch (e) {
      console.error('Failed to persist accounts', e);
    }
  }, [savedAccounts]);

  const saveUserToLocalStorage = (userObj: UserAccount) => {
    try {
      const updatedAccounts = [...savedAccounts];
      const existingIdx实施 = updatedAccounts.findIndex(a => a.email.toLowerCase() === userObj.email.toLowerCase());
      
      const now = new Date().toISOString();
      const updatedUser: UserAccount = {
        ...userObj,
        lastLoginAt: now,
        firstAccessAt: existingIdx实施 >= 0 ? (updatedAccounts[existingIdx实施].firstAccessAt || now) : now,
        isRemembered: rememberUser
      };

      if (existingIdx实施 >= 0) {
        updatedAccounts[existingIdx实施] = updatedUser;
      } else {
        updatedAccounts.unshift(updatedUser);
      }

      setSavedAccounts(updatedAccounts);
      localStorage.setItem('nercash_saved_accounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('bb_nercash_auth_user', JSON.stringify(updatedUser));
      
      if (rememberUser) {
        localStorage.setItem('nercash_last_remembered_email', userObj.email);
      }
    } catch (err) {
      console.error('Error saving user locally', err);
    }
  };

  const handleLoginSubmit清洗 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha de acesso.');
      return;
    }

    if (authMode === 'first_access' && !name) {
      setErrorMessage('Por favor, informe seu nome completo para o primeiro acesso.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);

      // Handle Master Admin credentials
      if (email.toLowerCase() === 'neersoftwarebr@gmail.com') {
        if (password !== '25150605T@pme' && password !== 'admin' && password.length < 4) {
          setErrorMessage('Senha incorreta para a conta Master Administrator.');
          return;
        }

        const adminUser: UserAccount = {
          name: name || 'Maycon Quevedo (Neer Software BR)',
          email: 'neersoftwarebr@gmail.com',
          role: 'Super Admin Master & Director',
          agency: '0001-9',
          account: '100502-X',
          lastLoginAt: new Date().toISOString()
        };

        saveUserToLocalStorage(adminUser);
        onLoginSuccess(adminUser);
        return;
      }

      // Handle custom or newly registered first access user
      const userPayload: UserAccount = {
        name: name || email.split('@')[0],
        email: email.trim(),
        role: role || (authMode === 'first_access' ? 'Operador Financeiro Master' : 'Enterprise Super Admin'),
        agency: agency || '0001-9',
        account: account || '100502-X',
        firstAccessAt: authMode === 'first_access' ? new Date().toISOString() : undefined,
        lastLoginAt: new Date().toISOString()
      };

      saveUserToLocalStorage(userPayload);
      onLoginSuccess(userPayload);
    }, 650);
  };

  const handleSelectSavedAccount = (acc: UserAccount) => {
    setName(acc.name);
    setEmail(acc.email);
    setRole(acc.role);
    setAgency(acc.agency);
    setAccount(acc.account);
    if (acc.email === 'neersoftwarebr@gmail.com') {
      setPassword('25150605T@pme');
    } else {
      setPassword('••••••••');
    }
  };

  const handleDeleteSavedAccount = (e: React.MouseEvent, emailToDelete: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a.email.toLowerCase() !== emailToDelete.toLowerCase());
    setSavedAccounts(updated);
  };

  const handleQuickDemoLogin = (userType: 'neer_admin' | 'mamannan' = 'neer_admin') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (userType === 'neer_admin') {
        const admin: UserAccount = {
          name: 'Maycon Quevedo (Neer Software)',
          email: 'neersoftwarebr@gmail.com',
          role: 'Super Admin Master & Director',
          agency: '0001-9',
          account: '100502-X',
          lastLoginAt: new Date().toISOString()
        };
        saveUserToLocalStorage(admin);
        onLoginSuccess(admin);
      } else {
        const demo: UserAccount = {
          name: 'Mamannan',
          email: 'mamannan@nercash.com',
          role: 'Enterprise Super Admin',
          agency: '3241-8',
          account: '98432-X',
          lastLoginAt: new Date().toISOString()
        };
        saveUserToLocalStorage(demo);
        onLoginSuccess(demo);
      }
    }, 500);
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    const res不易 = await SecurityHardeningEngine.authenticateWebAuthn();
    setIsLoading(false);
    if (res不易.success) {
      const admin: UserAccount = {
        name: 'Maycon Quevedo (Neer Software)',
        email: 'neersoftwarebr@gmail.com',
        role: 'Super Admin Master & Director',
        agency: '0001-9',
        account: '100502-X',
        lastLoginAt: new Date().toISOString()
      };
      saveUserToLocalStorage(admin);
      onLoginSuccess(admin);
    } else {
      setErrorMessage(res不易.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccessMessage('Instruções de redefinição enviadas com sucesso para o e-mail cadastrado.');
    setTimeout(() => {
      setShowForgotPasswordModal(false);
      setForgotSuccessMessage(null);
      setForgotEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-emerald-500/40 p-1 shadow-md">
              <img src="/nercash-logo.svg" alt="Nercash" className="h-full w-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  NERCASH ENTERPRISE
                </h1>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Payment Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma Oficial de Orquestração de Pagamentos v4.8
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>SSL SHA-256 / FIDO2 Ativo</span>
            </div>
            <PwaInstallButton />
          </div>
        </div>
      </header>

      {/* Hero / Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Feature Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" />
              <span>Infraestrutura Financeira de Alta Performance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Orquestração de Pagamentos & <span className="text-emerald-400">Checkout Inteligente</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Plataforma unificada Nercash para gerenciar roteamento multi-adquirente, análise preditiva de risco XGBoost, conciliação em tempo real e monitoramento de gateways com segurança cibernética avançada.
            </p>

            {/* Saved Accounts Quick Selection */}
            {savedAccounts.length > 0 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Usuários Salvos no Dispositivo (Primeiro Acesso Registrado)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {savedAccounts.length} conta(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSavedAccount(acc)}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        email === acc.email
                          ? 'border-emerald-500/60 bg-emerald-950/40 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                          {acc.name.charAt(0)}
                        </div>
                        <div className="truncate text-left">
                          <div className="text-xs font-bold text-white truncate leading-tight">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-mono">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedAccount(e, acc.email)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-all rounded"
                        title="Remover das contas salvas"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-emerald-400 font-mono text-xl font-bold">99.99%</div>
                <div className="text-xs text-slate-400 mt-1">SLA Garantido 24/7</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-indigo-400 font-mono text-xl font-bold">&lt; 18ms</div>
                <div className="text-xs text-slate-400 mt-1">Latência Média de Roteamento</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-amber-400 font-mono text-xl font-bold">R$ 4.2B+</div>
                <div className="text-xs text-slate-400 mt-1">Volume Processado Anual</div>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />

              {/* Mode Toggle Header: Entrar vs Primeiro Acesso */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {authMode === 'login' ? 'Acesso Seguro Nercash' : 'Primeiro Acesso & Cadastro'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {authMode === 'login' ? 'Identificação Corporativa Unificada' : 'Salvar e registrar perfil no dispositivo'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black border border-emerald-500 shadow-md shadow-emerald-600/30">
                  NC
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Entrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('first_access')}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'first_access'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Primeiro Acesso</span>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit清洗} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e深入 => setName(e深入.target.value)}
                    placeholder="Maycon Quevedo"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e深入 => setEmail(e深入.target.value)}
                    placeholder="neersoftwarebr@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {authMode === 'first_access' && (
                  <div className="grid grid-cols-2 gap-2 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Cargo / Perfil
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="Super Admin"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Agência / Conta
                      </label>
                      <input
                        type="text"
                        value={agency}
                        onChange={e => setAgency(e.target.value)}
                        placeholder="0001-9"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Senha de Acesso
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-[11px] font-medium text-emerald-400 hover:underline cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="25150605T@pme"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-3.5 pr-10 text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'Ocultar Senha' : 'Visualizar Senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember user checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember_user_checkbox"
                    checked={rememberUser}
                    onChange={e => setRememberUser(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="remember_user_checkbox" className="text-xs text-slate-300 cursor-pointer select-none">
                    Salvar e lembrar usuário no primeiro acesso neste navegador
                  </label>
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>{authMode === 'first_access' ? 'Registrando e Salvando Usuário...' : 'Validando Chave de Segurança...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'first_access' ? 'Salvar Usuário & Entrar' : 'Entrar como Administrador'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-950/80 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <Fingerprint className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>Entrar com Biometria / FIDO2 (Passkey)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('neer_admin')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-all cursor-pointer"
                    >
                      <Key className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Admin Master</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('mamannan')}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Key className="h-3.5 w-3.5 text-slate-400" />
                      <span>Demo Operador</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 border-t border-slate-800 pt-4 text-center text-[10px] text-slate-500">
                Ambiente Seguro Nercash • Criptografia de Ponta a Ponta
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Recuperação de Senha Nercash</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {forgotSuccessMessage ? (
              <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>{forgotSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Informe o e-mail corporativo cadastrado para receber o link seguro de redefinição de credenciais:
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="neersoftwarebr@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer"
                >
                  Enviar Instruções
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Nercash Inc. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-300">Termos de Uso</span>
            <span className="hover:text-slate-300">Política de Privacidade</span>
            <span className="hover:text-slate-300">Status da Rede (99.99%)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
