"use client";

import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  id: string;
  field:
    | "fieldGuide"
    | "fieldSupervisor"
    | "generalSupervisor"
    | "recruitment";
};

export default function AddReportButton({
  id,
  field,
}: Props) {
  async function addReport() {
    await updateDoc(doc(db, "employees", id), {
      [`reports.${field}`]: increment(1),
    });
  }

  return (
    <button
      onClick={addReport}
      className="rounded-lg bg-green-600 px-3 py-1 font-bold text-white transition hover:bg-green-500"
    >
      ➕
    </button>
  );
}