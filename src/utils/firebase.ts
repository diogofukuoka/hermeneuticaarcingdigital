import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const DEFAULT_AUTH_DOMAIN = firebaseConfig.authDomain;
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const OAUTH_CLIENT_ID = firebaseConfig.oAuthClientId;

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Ensure local persistence is configured
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Could not set auth persistence:", err);
});

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function isAuthDomainReachable(domain = DEFAULT_AUTH_DOMAIN): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch(`https://${domain}/__/auth/handler`, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

export async function isLocalAuthProxyAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return false;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`/__/auth/handler`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const text = await res.text();
    return text.includes("fireauth.oauthhelper");
  } catch {
    return false;
  }
}

export type LoginMode = "auto" | "popup" | "redirect" | "proxy";

export class AuthDiagnosticError extends Error {
  code: string;
  proxyAvailable: boolean;

  constructor(code: string, message: string, proxyAvailable = false) {
    super(message);
    this.code = code;
    this.proxyAvailable = proxyAvailable;
  }
}

export const checkRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error: any) {
    console.error("Redirect login check failed:", error);
    throw error;
  }
};

export const loginWithGoogle = async (mode: LoginMode = "auto") => {
  const authInternal = auth as any;

  try {
    if (mode === "proxy") {
      authInternal.config.authDomain = window.location.host;
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (popupErr: any) {
        if (popupErr?.code === "auth/popup-blocked") {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupErr;
      }
      return;
    }

    if (mode === "redirect") {
      authInternal.config.authDomain = DEFAULT_AUTH_DOMAIN;
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    if (mode === "auto") {
      const reachable = await isAuthDomainReachable(DEFAULT_AUTH_DOMAIN);
      if (!reachable) {
        const proxyAvailable = await isLocalAuthProxyAvailable();
        throw new AuthDiagnosticError(
          "auth/domain-blocked",
          `Não foi possível conectar ao domínio de autenticação (${DEFAULT_AUTH_DOMAIN}).`,
          proxyAvailable
        );
      }
    }

    authInternal.config.authDomain = DEFAULT_AUTH_DOMAIN;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (popupErr: any) {
      if (popupErr?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw popupErr;
    }
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error;
  } finally {
    if (mode !== "proxy" && authInternal?.config) {
      authInternal.config.authDomain = DEFAULT_AUTH_DOMAIN;
    }
  }
};

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function exportSessionKey(): string {
  const user = auth.currentUser;
  if (!user || !user.refreshToken) {
    throw new Error("Você precisa estar logado neste dispositivo para gerar a chave de acesso.");
  }
  const payload = JSON.stringify({
    r: user.refreshToken,
    p: firebaseConfig.projectId,
  });
  return `ARCING_KEY_${toBase64Url(payload)}`;
}

export function exportSessionLink(): string {
  const key = exportSessionKey();
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}#session=${encodeURIComponent(key)}`;
}

function extractRefreshTokenFromInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error("Cole a chave ou o link de sessão gerado no seu celular/tablet.");
  }

  let candidate = trimmed;

  // Handle full URL containing #session=... or ?session=...
  if (candidate.includes("session=")) {
    try {
      const hashPart = candidate.split("#")[1] || "";
      const hashParams = new URLSearchParams(hashPart);
      const fromHash = hashParams.get("session");
      if (fromHash) {
        candidate = decodeURIComponent(fromHash);
      } else {
        const qPart = candidate.split("?")[1]?.split("#")[0] || "";
        const qParams = new URLSearchParams(qPart);
        const fromQuery = qParams.get("session");
        if (fromQuery) candidate = decodeURIComponent(fromQuery);
      }
    } catch {
      // Fallback below
    }
  }

  if (candidate.startsWith("ARCING_KEY_")) {
    const encoded = candidate.slice("ARCING_KEY_".length).trim();
    const decoded = fromBase64Url(encoded);
    const parsed = JSON.parse(decoded);
    if (parsed.p && parsed.p !== firebaseConfig.projectId) {
      throw new Error("Esta chave pertence a outro projeto Firebase.");
    }
    if (!parsed.r || typeof parsed.r !== "string") {
      throw new Error("Chave de sessão inválida ou incompleta.");
    }
    return parsed.r;
  }

  // Also accept raw JSON or raw refresh token
  if (candidate.startsWith("{")) {
    const parsed = JSON.parse(candidate);
    const token = parsed.r || parsed.refreshToken || parsed?.stsTokenManager?.refreshToken;
    if (token) return token;
  }

  if (candidate.length > 40 && !candidate.includes(" ")) {
    return candidate;
  }

  throw new Error("Formato de chave inválido. Copie novamente a Chave de Sessão ou o Link Direto.");
}

export async function restoreSessionFromKey(rawInput: string): Promise<{ email: string; displayName: string }> {
  const refreshToken = extractRefreshTokenFromInput(rawInput);

  // 1. Exchange refresh token for fresh ID token via securetoken.googleapis.com
  const tokenRes = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData?.id_token) {
    throw new Error(
      tokenData?.error?.message || "Chave expirada ou revogada. Gere uma nova chave no outro dispositivo."
    );
  }

  // 2. Lookup verified account details via identitytoolkit.googleapis.com
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: tokenData.id_token }),
    }
  );

  const lookupData = await lookupRes.json();
  const account = lookupData?.users?.[0];
  if (!lookupRes.ok || !account?.localId) {
    throw new Error("Não foi possível validar os dados da conta Google.");
  }

  // 3. Construct standard Firebase Auth user record for browserLocalPersistence
  const expirationTime = Date.now() + Number(tokenData.expires_in || 3600) * 1000;
  const authUserJson: Record<string, any> = {
    uid: String(account.localId),
    email: account.email ? String(account.email) : undefined,
    emailVerified: Boolean(account.emailVerified),
    displayName: account.displayName ? String(account.displayName) : undefined,
    isAnonymous: false,
    photoURL: account.photoUrl ? String(account.photoUrl) : undefined,
    providerData: Array.isArray(account.providerUserInfo)
      ? account.providerUserInfo.map((p: any) => ({
          providerId: p.providerId || "google.com",
          uid: p.rawId || account.localId,
          displayName: p.displayName || account.displayName || null,
          email: p.email || account.email || null,
          phoneNumber: p.phoneNumber || null,
          photoURL: p.photoUrl || account.photoUrl || null,
        }))
      : [],
    stsTokenManager: {
      refreshToken: String(tokenData.refresh_token || refreshToken),
      accessToken: String(tokenData.id_token),
      expirationTime,
    },
    createdAt: account.createdAt ? String(account.createdAt) : undefined,
    lastLoginAt: account.lastLoginAt ? String(account.lastLoginAt) : undefined,
    apiKey: firebaseConfig.apiKey,
    appName: auth.name,
  };

  // Remove undefined keys for clean JSON
  Object.keys(authUserJson).forEach((k) => {
    if (authUserJson[k] === undefined) delete authUserJson[k];
  });

  await setPersistence(auth, browserLocalPersistence);
  const userStorageKey = `firebase:authUser:${firebaseConfig.apiKey}:${auth.name}`;
  const persistenceKey = `firebase:persistence:${firebaseConfig.apiKey}:${auth.name}`;
  localStorage.setItem(persistenceKey, "LOCAL");
  localStorage.setItem(userStorageKey, JSON.stringify(authUserJson));

  // Trigger Firebase Auth's built-in storage synchronization immediately
  const authInternal = auth as any;
  if (typeof authInternal._onStorageEvent === "function") {
    await authInternal._onStorageEvent();
  }

  if (!auth.currentUser) {
    // Fallback if SDK persistence hasn't picked it up in-memory yet
    window.location.reload();
  }

  return {
    email: account.email || "",
    displayName: account.displayName || account.email || "Usuário",
  };
}

export const logout = async () => {
  try {
    await signOut(auth);
    try {
      const userStorageKey = `firebase:authUser:${firebaseConfig.apiKey}:${auth.name}`;
      localStorage.removeItem(userStorageKey);
    } catch {
      // Ignore storage cleanup errors
    }
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
};

export const generateAnalysisId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "ana_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 10);
};
