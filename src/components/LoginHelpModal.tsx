import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  KeyRound,
  Smartphone,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  DEFAULT_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  LoginMode,
  restoreSessionFromKey,
} from "../utils/firebase";

interface LoginHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorCode: string;
  errorMessage?: string;
  proxyAvailable: boolean;
  isLoggingIn: boolean;
  onRetry: (mode: LoginMode) => void;
  onSessionRestored?: (info: { email: string; displayName: string }) => void;
}

export const LoginHelpModal: React.FC<LoginHelpModalProps> = ({
  isOpen,
  onClose,
  errorCode,
  errorMessage,
  proxyAvailable,
  isLoggingIn,
  onRetry,
  onSessionRestored,
}) => {
  const [copiedUri, setCopiedUri] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [sessionInput, setSessionInput] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.host : "";
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const proxyRedirectUri = `${currentOrigin}/__/auth/handler`;

  const copyText = (value: string, which: "uri" | "domain") => {
    navigator.clipboard?.writeText(value);
    if (which === "uri") {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    } else {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleRestoreKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreError(null);
    setRestoring(true);
    try {
      const info = await restoreSessionFromKey(sessionInput);
      setSessionInput("");
      onSessionRestored?.(info);
      onClose();
    } catch (err: any) {
      setRestoreError(err?.message || "Não foi possível validar a chave.");
    } finally {
      setRestoring(false);
    }
  };

  const isUnauthorizedDomain = errorCode === "auth/unauthorized-domain";
  const isManualKeyMode = errorCode === "manual-key";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isManualKeyMode ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
              {isManualKeyMode ? <KeyRound className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {isUnauthorizedDomain
                  ? "Domínio não autorizado no Firebase"
                  : isManualKeyMode
                  ? "Entrar em Navegador Gerenciado (Trabalho)"
                  : "Bloqueio no Navegador do Trabalho / Rede"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Acesso seguro sem perder seus dados salvos na nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700">
          {/* Cloud Data Reassurance */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-semibold block text-emerald-950">
                Seus dados na nuvem estão 100% intactos
              </strong>
              Todas as suas análises seguem salvas no projeto{" "}
              <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">
                {FIREBASE_PROJECT_ID}
              </code>
              . Assim que conectar sua conta, todas aparecem automaticamente.
            </div>
          </div>

          {!isManualKeyMode && !isUnauthorizedDomain && (
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs leading-relaxed text-amber-950">
              <strong>Motivo detectado:</strong> O navegador gerenciado ou firewall corporativo bloqueou o endereço de popup{" "}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">
                {DEFAULT_AUTH_DOMAIN}
              </code>{" "}
              (<em>&ldquo;A conexão foi redefinida&rdquo;</em>).
              {errorMessage && (
                <span className="block mt-1 text-[11px] text-amber-800/90 font-mono break-all">
                  {errorMessage}
                </span>
              )}
            </div>
          )}

          {/* BEST SOLUTION FOR MANAGED WORK BROWSER: Session Key from Phone/Tablet */}
          <form
            onSubmit={handleRestoreKey}
            className="space-y-3 border-2 border-indigo-200 bg-indigo-50/40 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Entrar via Celular / Tablet (100% compatível com navegador gerenciado)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Não usa popup nem acessa <code className="bg-white px-1 rounded border border-indigo-100">firebaseapp.com</code>. Funciona mesmo quando a empresa bloqueia login Google ou DNS:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-700 leading-relaxed">
              <li>
                Abra este link no seu <strong>celular ou tablet</strong> (no 4G/Wi-Fi pessoal) e clique em <strong>Entrar com Google</strong>.
              </li>
              <li>
                No topo da tela, toque no botão <strong>Conectar Trabalho</strong> e copie a <strong>Chave de Sessão</strong> (ou o <strong>Link Direto</strong>).
              </li>
              <li>
                Cole a chave ou o link aqui abaixo e clique em <strong>Conectar Agora</strong>:
              </li>
            </ol>

            <div className="space-y-2 pt-1">
              <textarea
                value={sessionInput}
                onChange={(e) => {
                  setSessionInput(e.target.value);
                  if (restoreError) setRestoreError(null);
                }}
                placeholder="Cole aqui a Chave de Sessão (ARCING_KEY_...) ou o Link Direto..."
                rows={2}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
              />
              {restoreError && (
                <p className="text-xs text-red-600 font-medium">{restoreError}</p>
              )}
              <button
                type="submit"
                disabled={restoring || !sessionInput.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{restoring ? "Validando e conectando..." : "Conectar Agora com Chave"}</span>
              </button>
            </div>
          </form>

          {isUnauthorizedDomain && (
            <div className="space-y-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs leading-relaxed">
                O domínio <strong className="text-slate-900">{currentHost}</strong> ainda não está nos domínios autorizados do Firebase:
              </p>
              <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <code className="text-[11px] font-mono text-indigo-800 truncate">{currentHost}</code>
                <button
                  type="button"
                  onClick={() => copyText(currentHost, "domain")}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors shrink-0"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedDomain ? "Copiado" : "Copiar"}
                </button>
              </div>
              <a
                href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Abrir Domínios Autorizados no Firebase Console
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Alternative: Vercel Proxy */}
          {proxyAvailable && (
            <div className="space-y-2 border border-slate-200 bg-slate-50/70 rounded-xl p-3.5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Alternativa: Login Direto via Proxy da Vercel</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Se o navegador corporativo permitir conta Google pessoal, mas bloquear apenas <code className="bg-white px-1 rounded">firebaseapp.com</code>, adicione esta URI no OAuth Client do Google Cloud:
              </p>
              <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                <code className="text-[11px] font-mono text-indigo-900 truncate">{proxyRedirectUri}</code>
                <button
                  type="button"
                  onClick={() => copyText(proxyRedirectUri, "uri")}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors shrink-0"
                >
                  {copiedUri ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedUri ? "Copiado" : "Copiar URI"}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href={`https://console.cloud.google.com/apis/credentials?project=${FIREBASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Google Cloud Console
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => onRetry("proxy")}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>Entrar via Proxy Vercel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Standard Retry Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onRetry("redirect")}
              disabled={isLoggingIn}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Tentar Redirecionamento
            </button>
            <button
              type="button"
              onClick={() => onRetry("popup")}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoggingIn ? "animate-spin" : ""}`} />
              <span>{isLoggingIn ? "Conectando..." : "Tentar Popup Google"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
