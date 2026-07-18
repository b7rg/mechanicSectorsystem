import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getSettings() {
  const snap = await getDoc(doc(db, "settings", "general"));

  if (!snap.exists()) return null;

  return snap.data();
}

export async function saveSettings(data: any) {
  await updateDoc(doc(db, "settings", "general"), data);
}