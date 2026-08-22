import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  try {
    const querySnapshot = await getDocs(collection(db, "analyses"));
    const docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({ id: doc.id, data: Object.keys(doc.data()) });
    });
    console.log(JSON.stringify(docs, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
main();
