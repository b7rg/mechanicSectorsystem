"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LevelsStats() {
  const [levels, setLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const data: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const employee: any = doc.data();

          const level = String(employee.level ?? "غير محدد");

          data[level] = (data[level] || 0) + 1;
        });

        setLevels(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const order = [
    "قيادة",
    "10",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
    "1",
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141414] p-8">
      <h2 className="mb-6 text-3xl font-black text-yellow-400">
        الموظفون حسب المستوى
      </h2>

      <div className="space-y-4">
        {order.map((level) => (
          <div
            key={level}
            className="flex items-center justify-between rounded-2xl bg-[#1b1b1b] p-4"
          >
            <span className="font-bold text-white">
              {level === "قيادة"
                ? "👑 قيادة"
                : `⭐ مستوى ${level}`}
            </span>

            <span className="text-2xl font-black text-yellow-400">
              {levels[level] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}