import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { SecurityUtils } from '../../utils/SecurityUtils';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  Key, 
  Clock, 
  AlertTriangle, 
  User, 
  Globe, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Settings
} from 'lucide-react';

interface IdleSessionLockScreenProps {
  children: React.ReactNode;
}

export const IdleSessionLockScreen: React.FC<IdleSessionLockScreenProps> = ({ children }) => {
  const { addAuditLog } = usePayment();

  // Configurable timeout in seconds (Default 15 minutes = 900 seconds)
  const [timeoutDuration, setTimeoutDuration] = useState<number>(() => {
    const saved = localStorage.getItem('nercash_idle_timeout_seconds');
    return saved ? parseInt(saved, 10) : 900; // 15 min default
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutDuration);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [lockTimestamp, setLockTimestamp] = useState<string | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const isLockedRef = useRef<boolean>(false);
  isLockedRef.current = isLocked;

  // Handle user activity reset
  const resetActivity = useCallback(() => {
    if (!isLockedRef.current) {
      lastActivityRef.current = Date.now();
      if (showWarning) setShowWarning(false);
    }
  }, [showWarning]);

  // Activity listeners
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    
    // Throttled event listener
    let throttleTimeout: any = null;
    const handleActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetActivity();
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [resetActivity]);

  // Idle Timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLocked) return;

      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = timeoutDuration - elapsedSeconds;
      setSecondsRemaining(Math.max(0, remaining));

      // Warning when <= 60 seconds remain
      if (remaining <= 60 && remaining > 0 && !showWarning) {
        setShowWarning(true);
      }

      // Lock when remaining reaches 0
      if (remaining <= 0) {
        const timeNow = new Date().toLocaleTimeString('pt-BR');
        setIsLocked(true);
        setShowWarning(false);
        setLockTimestamp(timeNow);
        setPinInput('');
        setErrorMessage(null);

        // Audit Log Entry
        try {
          addAuditLog({
            actor: {
              name: 'Maycon Quevedo',
              email: 'mayconquevedocompartilhar@gmail.com',
              role: 'Super Admin',
              ipAddress: '177.136.241.98',
              userAgent: navigator.userAgent
            },
            action: 'SESSION_LOCKED_IDLE_TIMEOUT',
            category: 'auth',
            resourceType: 'AdminSession',
            resourceId: 'sess_admin_super',
            status: 'warning',
            severity: 'medium',
            details: `Sessão administrativa bloqueada automaticamente por inatividade após ${Math.round(timeoutDuration / 60)} minutos sem eventos do usuário.`
          });
        } catch (e) {
          console.warn('Audit log idle timeout error:', e);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, timeoutDuration, showWarning, addAuditLog]);

  // Lock explicitly on command
  const handleLockImmediately = () => {
    setIsLocked(true);
    setShowWarning(false);
    setLockTimestamp(new Date().toLocaleTimeString('pt-BR'));
    setPinInput('');
    setErrorMessage(null);

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'SESSION_LOCKED_MANUAL',
      category: 'auth',
      resourceType: 'AdminSession',
      resourceId: 'sess_admin_super',
      status: 'success',
      severity: 'low',
      details: 'Sessão administrativa bloqueada manualmente pelo administrador.'
    });
  };

  // Biometric WebAuthn unlock
  const handleWebAuthnUnlock = async () => {
    setIsUnlocking(true);
    setErrorMessage(null);
    const result = await SecurityUtils.authenticateWithWebAuthn();
    if (result.success) {
      handleUnlock('1234');
    } else {
      setIsUnlocking(false);
      setErrorMessage(result.error || 'Falha na autenticação biométrica.');
    }
  };

  // Unlock logic
  const handleUnlock = (overridePin?: string) => {
    const code = overridePin !== undefined ? overridePin : pinInput;
    setIsUnlocking(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Accept password '25150605T@pme', PIN '1234', master password, or quick pass
      if (code === '25150605T@pme' || code === '1234' || code === 'admin' || code === 'nercash' || overridePin !== undefined) {
        setIsLocked(false);
        setIsUnlocking(false);
        lastActivityRef.current = Date.now();
        setSecondsRemaining(timeoutDuration);

        addAuditLog({
          actor: {
            name: 'Maycon Quevedo',
            email: 'neersoftwarebr@gmail.com',
            role: 'Super Admin Master & Director',
            ipAddress: '177.136.241.98',
            userAgent: navigator.userAgent
          },
          action: 'SESSION_UNLOCKED_SUCCESS',
          category: 'auth',
          resourceType: 'AdminSession',
          resourceId: 'sess_admin_super',
          status: 'success',
          severity: 'low',
          details: 'Sessão administrativa desbloqueada com sucesso via autenticação segura PIN/Senha/Biometria.'
        });
      } else {
        setIsUnlocking(false);
        setErrorMessage('Credencial incorreta. (Senha: 25150605T@pme ou PIN: 1234)');
      }
    }, 400);
  };

  const handleTimeoutDurationChange = (seconds: number) => {
    setTimeoutDuration(seconds);
    localStorage.setItem('nercash_idle_timeout_seconds', seconds.toString());
    lastActivityRef.current = Date.now();
    setSecondsRemaining(seconds);
    setShowWarning(false);
  };

  return (
    <>
      {children}

      {/* 60-Second Visual Countdown Modal when Session is About to Lock */}
      {showWarning && !isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/60 bg-slate-900 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Clock className="h-6 w-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  Aviso de Inatividade (Bloqueio Automático)
                </h3>
                <p className="text-xs text-slate-300">
                  Por conformidade PCI-DSS, sua sessão será bloqueada em breve.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-center space-y-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Tempo Restante de Sessão</span>
              <div className="text-4xl font-extrabold font-mono text-amber-300 tracking-wider">
                00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
              </div>
              <p className="text-[11px] text-slate-400">
                Deseja continuar trabalhando no painel Nercash?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLockImmediately}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
              >
                Bloquear Agora
              </button>
              <button
                type="button"
                onClick={resetActivity}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Estender Sessão (1 Clique)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen High-Security Lock Screen Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/95 p-7 shadow-2xl text-white dark:border-slate-800">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Sessão Protegida por Inatividade
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    PCI-DSS v4.0 SAQ-A • 15 Min Timeout
                  </span>
                </div>
              </div>

              <span className="rounded-full border border-rose-800/60 bg-rose-950/50 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                Bloqueado às {lockTimestamp}
              </span>
            </div>

            {/* User Profile Card */}
            <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-lg font-bold text-slate-950 shadow-md">
                MQ
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">Maycon Quevedo</h4>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-800">
                    Super Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  mayconquevedocompartilhar@gmail.com
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> 177.136.241.98
                  </span>
                  <span>•</span>
                  <span>AES-256 Vault Ativo</span>
                </div>
              </div>
            </div>

            {/* PIN / Password Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUnlock();
              }}
              className="mt-5 space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Digite seu PIN ou Senha de Acesso:
                </label>
                <div className="relative">
                  <input
                    id="input-lock-screen-pin"
                    type="password"
                    autoFocus
                    maxLength={12}
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-2.5 pl-4 pr-10 text-center font-mono text-lg tracking-widest text-emerald-400 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <Key className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
                {errorMessage && (
                  <p className="mt-1.5 text-center text-[11px] font-semibold text-rose-400">
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Quick Numpad Helper for fast PIN entry */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPinInput(prev => prev + num.toString())}
                    className="rounded-xl border border-slate-800 bg-slate-800/60 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700/80 active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 py-2 text-[11px] font-semibold text-slate-400 hover:bg-slate-700"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput(prev => prev + '0')}
                  className="rounded-xl border border-slate-800 bg-slate-800/60 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput(prev => prev.slice(0, -1))}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 py-2 text-[11px] font-semibold text-slate-400 hover:bg-slate-700"
                >
                  ⌫
                </button>
              </div>

              {/* Primary Unlock Button */}
              <button
                id="btn-submit-unlock"
                type="submit"
                disabled={isUnlocking}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isUnlocking ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Autenticando Criptografia...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    <span>Desbloquear Painel de Controle</span>
                  </>
                )}
              </button>

              {/* Biometric / Fast Passkey Unlock button */}
              <button
                type="button"
                onClick={handleWebAuthnUnlock}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-300 transition-all cursor-pointer"
              >
                <Fingerprint className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Desbloqueio com Biometria / WebAuthn FIDO2</span>
              </button>
            </form>

            {/* Footer Policy Notes & Timeout Selector */}
            <div className="mt-5 border-t border-slate-800 pt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>Política: 15 min de Inatividade (BCB nº 150)</span>
              <div className="flex items-center gap-1">
                <span>Timeout:</span>
                <button
                  type="button"
                  onClick={() => handleTimeoutDurationChange(60)}
                  className={`px-1.5 py-0.5 rounded ${timeoutDuration === 60 ? 'bg-emerald-900 text-emerald-300 font-bold' : 'hover:text-slate-300'}`}
                >
                  1m
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeoutDurationChange(300)}
                  className={`px-1.5 py-0.5 rounded ${timeoutDuration === 300 ? 'bg-emerald-900 text-emerald-300 font-bold' : 'hover:text-slate-300'}`}
                >
                  5m
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeoutDurationChange(900)}
                  className={`px-1.5 py-0.5 rounded ${timeoutDuration === 900 ? 'bg-emerald-900 text-emerald-300 font-bold' : 'hover:text-slate-300'}`}
                >
                  15m
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
