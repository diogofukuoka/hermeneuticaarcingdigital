import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
