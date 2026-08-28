import React, { useState } from 'react';
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
  Fingerprint
} from 'lucide-react';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { SecurityHardeningEngine } from '../../services/securityHardening';

interface BbLoginLandingPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: string; agency: string; account: string }) => void;
}

export const BbLoginLandingPage: React.FC<BbLoginLandingPageProps> = ({ onLoginSuccess }) => {
  const [name, setName] = useState('Mamannan');
  const [email, setEmail] = useState('mamannan@nercash.com');
  const [password, setPassword] = useState('kkjkjj');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name,
        email,
        role: 'Enterprise Super Admin',
        agency: '3241-8',
        account: '98432-X'
      });
    }, 900);
  };

  const handleQuickDemoLogin = () => {
    setName('Mamannan');
    setEmail('mamannan@nercash.com');
    setPassword('kkjkjj');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Mamannan',
        email: 'mamannan@nercash.com',
        role: 'Enterprise Super Admin',
        agency: '3241-8',
        account: '98432-X'
      });
    }, 600);
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    const res = await SecurityHardeningEngine.authenticateWebAuthn();
    setIsLoading(false);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message);
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

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Acesso Seguro Nercash</h3>
                  <p className="text-xs text-slate-400">Identificação Corporativa Unificada</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black border border-emerald-500">
                  NC
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Mamannan"
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
                    onChange={e => setEmail(e.target.value)}
                    placeholder="mamannan@nercash.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Senha de Acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-medium text-emerald-400 hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
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
                      <span>Validando Chave de Segurança...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
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
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Key className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Acesso Rápido (Demo Nercash)</span>
                  </button>
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
              <div className="rounded-2xl bg-emerald-950/50 border border-emerald-800 p-4 text-center text-xs text-emerald-300">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                {forgotSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Informe o seu e-mail corporativo cadastrado para receber o token de redefinição de senha via FIDO2 / Token SMS.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="seu.email@nercash.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    Enviar Instruções
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        <p>© 2026 Nercash Payment Intelligence & Orchestration. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
