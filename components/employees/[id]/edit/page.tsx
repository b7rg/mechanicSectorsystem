"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { getLevel } from "@/lib/getLevel";

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [rank, setRank] = useState("");

  useEffect(() => {
    async function loadEmployee() {
      const snapshot = await getDoc(doc(db, "employees", id as string));

      if (!snapshot.exists()) return;

      const employee = snapshot.data();

      setName(employee.name);
      setDiscordId(employee.discordId);
      setRank(employee.rank);

      setLoading(false);
    }

    loadEmployee();
  }, [id]);

  async function save() {
    await updateDoc(doc(db, "employees", id as string), {
      name,
      discordId,
      rank,
      level: getLevel(rank),
    });

    router.push(`/employees/${id}`);
  }

  if (loading)
    return (
      <div className="p-10 text-center">
        جارٍ التحميل...
      </div>
    );

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">

      <h1 className="text-4xl font-bold text-yellow-400">
        تعديل الموظف
      </h1>

      <div className="space-y-5 rounded-3xl border border-white/10 bg-[#141414] p-8">

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 text-white"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 text-white"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
        />

        <button
          onClick={save}
          className="w-full rounded-xl bg-yellow-500 p-4 font-bold text-black hover:bg-yellow-400"
        >
          حفظ التعديلات
        </button>

      </div>
    </main>
  );
}