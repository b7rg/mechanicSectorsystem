import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export async function sendNotification(
  uid: string,
  title: string,
  message: string
) {
  await addDoc(collection(db, "notifications"), {
    uid,
    title,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}