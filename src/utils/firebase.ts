import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0930791125",
  appId: "1:433344089026:web:2ce9aafa91ada815ae245b",
  apiKey: "AIzaSyDDU_kGqwVOnHBYbSteH2NjCYs-69fYaz8",
  authDomain: "gen-lang-client-0930791125.firebaseapp.com",
  storageBucket: "gen-lang-client-0930791125.firebasestorage.app",
  messagingSenderId: "433344089026",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-arcingstudio-1b4468e6-520e-4ba3-ae4f-6d92fdbb6ec1");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Login failed", error);
    if (error?.code === 'auth/unauthorized-domain') {
      alert("🔒 Domínio Não Autorizado\n\nO Firebase bloqueou o login porque este domínio (ex: Vercel) não está na lista de domínios seguros.\n\nComo o Firebase atual é gerenciado pelo AI Studio, ele só aceita logins através do link oficial do AI Studio.\n\nPara usar na Vercel, crie um projeto gratuito no Firebase Console, adicione seu domínio da Vercel e substitua as chaves no arquivo firebase.ts.");
    } else {
      alert("Erro ao fazer login com o Google: " + (error?.message || "Erro desconhecido"));
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
};
