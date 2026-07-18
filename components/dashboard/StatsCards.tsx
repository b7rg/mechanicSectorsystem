"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import {
  Users,
  Crown,
  FileText,
  TriangleAlert,
  Plane,
} from "lucide-react";

import { db } from "@/lib/firebase";
import Card from "@/components/ui/Card";

type Stats = {
  employees: number;
  leaders: number;
  warnings: number;
  reports: number;
  vacations: number;
};

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
  employees: 100,
  leaders: 50,
  warnings: 20,
  reports: 300,
  vacations: 5,
});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        let employees = 0;
        let leaders = 0;
        let warnings = 0;
        let reports = 0;
        let vacations = 0;

        snapshot.forEach((doc) => {
          const e: any = doc.data();

          employees++;

          if (e.level === "قيادة") leaders++;

          warnings += e.warnings ?? 0;

          reports +=
            (e.reports?.fieldGuide ?? 0) +
            (e.reports?.fieldSupervisor ?? 0) +
            (e.reports?.generalSupervisor ?? 0) +
            (e.reports?.recruitment ?? 0);

          if (e.leave?.active) vacations++;
        });

        setStats({
          employees,
          leaders,
          warnings,
          reports,
          vacations,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const cards = [
    {
      title: "الموظفون",
      value: stats.employees,
      icon: Users,
    },
    {
      title: "القيادات",
      value: stats.leaders,
      icon: Crown,
    },
    {
      title: "التقارير",
      value: stats.reports,
      icon: FileText,
    },
    {
      title: "الإنذارات",
      value: stats.warnings,
      icon: TriangleAlert,
    },
    {
      title: "الإجازات",
      value: stats.vacations,
      icon: Plane,
    },
  ];
    return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="group relative overflow-hidden p-6"
          >
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-yellow-500/10 blur-3xl transition-all duration-500 group-hover:bg-yellow-500/20" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  {card.title}
                </p>

                <h2 className="mt-3 text-4xl font-black text-white">
                  <AnimatedNumber value={card.value} />
                </h2>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                <Icon
                  size={28}
                  className="text-yellow-400"
                />
              </div>
            </div>

            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}