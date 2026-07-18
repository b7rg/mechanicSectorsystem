"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ExportEmployeesButton() {
  async function exportData() {
    const snapshot = await getDocs(collection(db, "employees"));

    const data = snapshot.docs.map((doc) => ({
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
    a.download = "employees-backup.json";

    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportData}
      className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500"
    >
      📥 تصدير الموظفين
    </button>
  );
}