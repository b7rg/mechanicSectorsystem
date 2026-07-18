"use client";

import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

type Props = {
  id: string;
  warnings: number;
};

export default function WarningsCard({
  id,
  warnings,
}: Props) {
  const [count, setCount] = useState(warnings ?? 0);

  async function addWarning() {
    setCount((c) => c + 1);

    await updateDoc(doc(db, "employees", id), {
      warnings: increment(1),
    });
  }

  async function removeWarning() {
    if (count <= 0) return;

    setCount((c) => c - 1);

    await updateDoc(doc(db, "employees", id), {
      warnings: increment(-1),
    });
  }

  return (
    <div className="rounded-2xl bg-zinc-900 p-5">
      <p className="mb-4 text-xl font-bold text-yellow-400">
        ⚠️ الإنذارات
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={removeWarning}
          className="rounded-lg bg-red-600 px-4 py-2 font-bold hover:bg-red-500"
        >
          ➖
        </button>

        <span className="text-3xl font-bold text-orange-400">
          {count}
        </span>

        <button
          onClick={addWarning}
          className="rounded-lg bg-green-600 px-4 py-2 font-bold hover:bg-green-500"
        >
          ➕
        </button>
      </div>
    </div>
  );
}