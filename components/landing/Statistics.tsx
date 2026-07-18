"use client";

import {
  Activity,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

import SectionTitle from "../shared/SectionTitle";
import Card from "../ui/Card";

const stats = [
  {
    title: "عدد القيادات",
    value: "9",
    description:
      "القيادات المشرفة على إدارة وتنظيم القطاع.",
    icon: ShieldCheck,
  },
  {
    title: "الدورات الأسبوعية",
    value: "6",
    description:
      "دورات تطويرية وتأهيلية تقام بشكل أسبوعي.",
    icon: GraduationCap,
  },
  {
    title: "جاهزية القطاع",
    value: "100%",
    description:
      "استعداد القطاع لتنفيذ المهام وتغطية الميدان.",
    icon: Activity,
  },
];

export default function Statistics() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/5 blur-[120px]" />

      <div className="relative">
        <SectionTitle
          title="إحصائيات القطاع"
          subtitle="Statistics"
        />

        <div className="mx-auto grid w-[92%] max-w-6xl gap-6 md:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
              >
                <Card className="group relative h-full overflow-hidden p-7">
                  <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-yellow-500/5 blur-3xl transition group-hover:bg-yellow-500/10" />

                  <div className="relative flex items-start justify-between gap-5">
                    <div>
                      <p className="text-sm font-bold text-zinc-500">
                        {item.title}
                      </p>

                      <h3 className="mt-4 text-4xl font-black text-yellow-400">
                        {item.value}
                      </h3>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 transition group-hover:bg-yellow-500 group-hover:text-black">
                      <Icon size={25} />
                    </div>
                  </div>

                  <p className="relative mt-6 text-sm leading-7 text-zinc-500">
                    {item.description}
                  </p>

                  <div className="relative mt-6 h-px w-full bg-gradient-to-l from-transparent via-yellow-500/20 to-transparent" />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}