"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  id: string;
  leave?: {
    active?: boolean;
    from?: string;
    to?: string;
    reason?: string;
  };
};

export default function LeaveCard({ id, leave }: Props) {
  const [active, setActive] = useState(leave?.active ?? false);
  const [from, setFrom] = useState(leave?.from ?? "");
  const [to, setTo] = useState(leave?.to ?? "");
  const [reason, setReason] = useState(leave?.reason ?? "");

  async function saveLeave() {
    await updateDoc(doc(db, "employees", id), {
      leave: {
        active,
        from,
        to,
        reason,
      },
    });

    alert("تم حفظ بيانات الإجازة.");
  }

  async function finishLeave() {
    setActive(false);
    setFrom("");
    setTo("");
    setReason("");

    await updateDoc(doc(db, "employees", id), {
      leave: {
        active: false,
        from: "",
        to: "",
        reason: "",
      },
    });
  }

  return (
    <div className="rounded-2xl bg-zinc-900 p-5">
      <h2 className="mb-4 text-xl font-bold text-yellow-400">
        🏖️ الإجازة
      </h2>

      <div className="space-y-3">

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          الموظف في إجازة
        </label>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full rounded-lg bg-[#141414] p-3"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full rounded-lg bg-[#141414] p-3"
        />

        <textarea
          placeholder="سبب الإجازة"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg bg-[#141414] p-3"
        />

        <div className="flex gap-3">

          <button
            onClick={saveLeave}
            className="rounded-lg bg-green-600 px-4 py-2 font-bold"
          >
            💾 حفظ
          </button>

          <button
            onClick={finishLeave}
            className="rounded-lg bg-red-600 px-4 py-2 font-bold"
          >
            إنهاء الإجازة
          </button>

        </div>

      </div>
    </div>
  );
}