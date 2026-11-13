import React, { useState, useMemo } from "react";
import { X, KeyRound, Copy, Check, Link2, ShieldAlert, Smartphone } from "lucide-react";
import { exportSessionKey, exportSessionLink } from "../utils/firebase";
import { User } from "firebase/auth";

interface SessionTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const SessionTransferModal: React.FC<SessionTransferModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [copiedType, setCopiedType] = useState<"key" | "link" | null>(null);

  const { sessionKey, sessionLink, error } = useMemo(() => {
    if (!isOpen || !user) {
      return { sessionKey: "", sessionLink: "", error: "" };
    }
    try {
      return {
        sessionKey: exportSessionKey(),
        sessionLink: exportSessionLink(),
        error: "",
      };
    } catch (err: any) {
      return {
        sessionKey: "",
        sessionLink: "",
        error: err?.message || "Erro ao gerar chave.",
      };
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleCopy = (type: "key" | "link") => {
    const val = type === "key" ? sessionKey : sessionLink;
    if (!val) return;
    navigator.clipboard?.writeText(val);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Conectar Navegador do Trabalho
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                Conta: {user.email}
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
          <p className="text-xs text-slate-600 leading-relaxed">
            Use esta opção para entrar na sua conta mesmo em computadores ou navegadores gerenciados pela empresa que bloqueiam popups do Google ou <code className="bg-slate-100 px-1 rounded">firebaseapp.com</code>.
          </p>

          {error ? (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Option 1: Copy Direct Link */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-indigo-950 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                    Link Direto (abre já conectado)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Envie para você mesmo (WhatsApp Web, E-mail ou Keep) e abra no navegador do trabalho:
                </p>
                <button
                  onClick={() => handleCopy("link")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {copiedType === "link" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Link Direto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link Direto de Login</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Copy Key */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                  Ou copie apenas a Chave de Sessão
                </span>
                <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] text-slate-500 truncate select-all">
                  {sessionKey}
                </div>
                <button
                  onClick={() => handleCopy("key")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  {copiedType === "key" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chave Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Chave de Sessão</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Segurança:</strong> Esta chave dá acesso à sua conta neste aplicativo. Não compartilhe com terceiros. Ao abrir o Link Direto, ele limpa o endereço da barra automaticamente após conectar.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
