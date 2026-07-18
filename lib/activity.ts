import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function addActivity(
  action: string,
  employee?: string
) {
  const user = auth.currentUser;

  if (!user) return;

  let name = user.email;
  let role = "غير محدد";

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();

      name = data.name || user.email;
      role = data.role || "غير محدد";
    }
  } catch (error) {
    console.error(error);
  }

  await addDoc(collection(db, "activity"), {
    action,
    employee: employee ?? null,
    uid: user.uid,
    email: user.email,
    name,
    role,
    createdAt: serverTimestamp(),
  });
}