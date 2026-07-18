"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  level: string;
  count: number;
  order: number;
};

type EmployeeData = {
  level?: string | number;
  rank?: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: ChartItem;
  }>;
};

function isLeadership(employee: EmployeeData) {
  const level = String(employee.level ?? "").trim();
  const rank = String(employee.rank ?? "")
    .trim()
    .toUpperCase();

  return (
    level === "قيادة" ||
    /^G-?(10|[1-9])$/.test(rank)
  );
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  const count = Number(payload[0]?.value ?? 0);

  return (
    <div className="min-w-[150px] rounded-2xl border border-yellow-500/20 bg-[#101010]/95 p-4 shadow-2xl backdrop-blur-xl">
      <p className="font-black text-yellow-400">
        {item?.level ?? "المستوى"}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        عدد الموظفين
      </p>

      <p className="mt-1 text-2xl font-black text-white">
        {count.toLocaleString("ar-SA")}
      </p>
    </div>
  );
}

export default function LevelChart() {
  const [data, setData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const levels: Record<string, ChartItem> = {};

        snapshot.forEach((employeeDocument) => {
          const employee =
            employeeDocument.data() as EmployeeData;

          const leadership = isLeadership(employee);

          const numericLevel = Number(employee.level);

          const levelName = leadership
            ? "القيادة"
            : Number.isFinite(numericLevel)
              ? `مستوى ${numericLevel}`
              : "غير محدد";

          const order = leadership
            ? 11
            : Number.isFinite(numericLevel)
              ? numericLevel
              : 0;

          if (!levels[levelName]) {
            levels[levelName] = {
              level: levelName,
              count: 0,
              order,
            };
          }

          levels[levelName].count += 1;
        });

        const chartData = Object.values(levels).sort(
          (firstItem, secondItem) =>
            secondItem.order - firstItem.order
        );

        setData(chartData);
        setLoading(false);
      },
      (error) => {
        console.error(
          "تعذر تحميل توزيع الموظفين:",
          error
        );

        setData([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const maximumCount = useMemo(() => {
    return Math.max(
      1,
      ...data.map((item) => item.count)
    );
  }, [data]);

  const yAxisMaximum = Math.max(
    2,
    maximumCount + 1
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#141414] p-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-zinc-500">
            إحصائيات الموظفين
          </p>

          <h2 className="mt-1 text-2xl font-black text-yellow-400">
            توزيع الموظفين حسب المستوى
          </h2>
        </div>

        <span className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 font-black text-yellow-400">
          {data
            .reduce(
              (total, item) => total + item.count,
              0
            )
            .toLocaleString("ar-SA")}{" "}
          موظف
        </span>
      </div>

      {loading ? (
        <div className="flex h-[350px] items-center justify-center rounded-2xl border border-white/5 bg-black/20 text-zinc-500">
          جارٍ تحميل الرسم البياني...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-center">
          <p className="text-lg font-black text-zinc-300">
            لا توجد بيانات موظفين
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            سيظهر الرسم بعد إضافة الموظفين.
          </p>
        </div>
      ) : (
        <div className="h-[380px] w-full rounded-2xl border border-white/5 bg-black/20 p-4">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: 5,
                bottom: 15,
              }}
            >
              <CartesianGrid
                stroke="#27272a"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="level"
                axisLine={{
                  stroke: "#3f3f46",
                }}
                tickLine={false}
                tick={{
                  fill: "#a1a1aa",
                  fontSize: 13,
                  fontWeight: 700,
                }}
                interval={0}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, yAxisMaximum]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#71717a",
                  fontSize: 13,
                }}
                width={35}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(234, 179, 8, 0.05)",
                  radius: 12,
                }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="count"
                name="عدد الموظفين"
                maxBarSize={85}
                radius={[12, 12, 4, 4]}
                animationDuration={900}
              >
                {data.map((item) => (
                  <Cell
                    key={item.level}
                    fill={
                      item.level === "القيادة"
                        ? "#a855f7"
                        : "#eab308"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}