"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  id: string;
  value: string | number;
};

export default function LevelSelector({
  id,
  value,
}: Props) {
  async function changeLevel(
    level: string
  ) {
    await updateDoc(
      doc(db, "employees", id),
      {
        level,
      }
    );
  }

  return (
    <select
      value={String(value)}
      onChange={(e) =>
        changeLevel(e.target.value)
      }
      className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2 text-white outline-none"
    >
      <option value="قيادة">
        قيادة
      </option>

      <option value="10">10</option>
      <option value="9">9</option>
      <option value="8">8</option>
      <option value="7">7</option>
      <option value="6">6</option>
      <option value="5">5</option>
      <option value="4">4</option>
      <option value="3">3</option>
      <option value="2">2</option>
      <option value="1">1</option>
    </select>
  );
}