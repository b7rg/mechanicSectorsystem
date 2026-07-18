"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import { nextRank } from "@/lib/ranks";

type Props = {
  id: string;
  currentLevel: number;
  currentRank: string;
  employeeName: string;
};

export default function PromoteButton({
  id,
  currentLevel,
  currentRank,
  employeeName,
}: Props) {
  async function promote() {
    const nextLevel = currentLevel + 1;

    await updateDoc(doc(db, "employees", id), {
      level: nextLevel,
      rank: nextRank[currentRank] ?? currentRank,
      lastPromotion: new Date(),
    });

    await addActivity(`ترقية إلى المستوى ${nextLevel}`);

    alert("تمت الترقية بنجاح");
  }

  return (
    <button
      onClick={promote}
      className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-500"
    >
      ⬆ ترقية
    </button>
  );
}