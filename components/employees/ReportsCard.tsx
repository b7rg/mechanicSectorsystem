"use client";

import { useState } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
type Reports = {
  fieldGuide?: number;
  fieldSupervisor?: number;
  generalSupervisor?: number;
  recruitment?: number;
};

type Props = {
  id: string;
  reports?: Reports;
};

export default function ReportsCard({ id, reports }: Props) {
  const [data, setData] = useState({
    fieldGuide: reports?.fieldGuide ?? 0,
    fieldSupervisor: reports?.fieldSupervisor ?? 0,
    generalSupervisor: reports?.generalSupervisor ?? 0,
    recruitment: reports?.recruitment ?? 0,
  });

  async function changeReport(
    field: keyof typeof data,
    amount: number
  ) {
    if (amount === -1 && data[field] <= 0) return;

    setData((prev) => ({
      ...prev,
      [field]: prev[field] + amount,
    }));

    await updateDoc(doc(db, "employees", id), {
  [`reports.${field}`]: increment(amount),
});

const names = {
  fieldGuide: "التوجيه الميداني",
  fieldSupervisor: "الإشراف الميداني",
  generalSupervisor: "الإشراف العام",
  recruitment: "التوظيف",
};

await addActivity(
  `${amount > 0 ? "إضافة" : "إنقاص"} تقرير ${names[field]}`
);
  }

  const items = [
    {
      key: "fieldGuide" as const,
      title: "📍 توجيه ميداني",
    },
    {
      key: "fieldSupervisor" as const,
      title: "🛠️ إشراف ميداني",
    },
    {
      key: "generalSupervisor" as const,
      title: "👑 إشراف عام",
    },
    {
      key: "recruitment" as const,
      title: "👥 توظيف",
    },
  ];

  return (
    <div className="rounded-2xl bg-zinc-900 p-5">
      <p className="mb-5 text-xl font-bold text-yellow-400">
        📄 التقارير
      </p>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between"
          >
            <span>{item.title}</span>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  changeReport(item.key, -1)
                }
                className="h-8 w-8 rounded-lg bg-red-600 text-white hover:bg-red-500"
              >
                −
              </button>

              <span className="w-8 text-center font-bold">
                {data[item.key]}
              </span>

              <button
                onClick={() =>
                  changeReport(item.key, 1)
                }
                className="h-8 w-8 rounded-lg bg-green-600 text-white hover:bg-green-500"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}