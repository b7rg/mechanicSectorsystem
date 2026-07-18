"use client";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function BackupPage() {

  async function backup() {

    const snap = await getDocs(
      collection(db, "employees")
    );

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
      "employees-backup.json";

    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-8">

      <h1 className="text-4xl font-black text-yellow-400">
        النسخ الاحتياطي
      </h1>

      <button
        onClick={backup}
        className="rounded-2xl bg-yellow-500 px-8 py-4 font-bold text-black"
      >
        تحميل نسخة احتياطية
      </button>

    </main>
  );
}