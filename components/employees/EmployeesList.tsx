"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EmployeeCard from "./EmployeeCard";

export default function EmployeesList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("الكل");
  const [sort, setSort] = useState("level");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmployees(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const sortedEmployees = employees
    .filter((employee) => {
      const text = search.toLowerCase();

      const matchesSearch =
        employee.name?.toLowerCase().includes(text) ||
        employee.discordId?.toLowerCase().includes(text) ||
        employee.rank?.toLowerCase().includes(text) ||
        String(employee.level).includes(text);

      const matchesFilter =
        filter === "الكل" ||
        String(employee.level) === filter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name, "ar");

        case "rank":
          return a.rank.localeCompare(b.rank, "ar");

        case "reports":
          const reportsA =
            (a.reports?.fieldGuide ?? 0) +
            (a.reports?.fieldSupervisor ?? 0) +
            (a.reports?.generalSupervisor ?? 0) +
            (a.reports?.recruitment ?? 0);

          const reportsB =
            (b.reports?.fieldGuide ?? 0) +
            (b.reports?.fieldSupervisor ?? 0) +
            (b.reports?.generalSupervisor ?? 0) +
            (b.reports?.recruitment ?? 0);

          return reportsB - reportsA;

        case "warnings":
          return (b.warnings ?? 0) - (a.warnings ?? 0);

        default:
          if (a.level === "قيادة") return -1;
          if (b.level === "قيادة") return 1;

          return Number(b.level) - Number(a.level);
      }
    });

  const totalEmployees = employees.length;

  const leaders = employees.filter(
    (e) => String(e.level) === "قيادة"
  ).length;

  const warnings = employees.filter(
    (e) => (e.warnings ?? 0) > 0
  ).length;

  const readyPromotion = employees.filter(
    (e) =>
      (e.courses?.length ?? 0) >= 8 &&
      (e.warnings ?? 0) === 0
  ).length;

  return (
    <>
      <input
        type="text"
        placeholder="ابحث بالاسم أو Discord ID أو رتبة G أو المستوى..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none"
      />

      <div className="mb-6">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#141414] px-5 py-3 text-white"
        >
          <option value="level">ترتيب حسب المستوى</option>
          <option value="name">ترتيب حسب الاسم</option>
          <option value="rank">ترتيب حسب الرتبة</option>
          <option value="reports">الأكثر تقارير</option>
          <option value="warnings">الأكثر إنذارات</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          "الكل",
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
        ].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl px-5 py-2 font-bold transition ${
              filter === item
                ? "bg-yellow-500 text-black"
                : "border border-white/10 bg-[#141414] text-white hover:border-yellow-500"
            }`}
          >
            {item === "الكل"
              ? "📋 الكل"
              : item === "قيادة"
              ? "👑 القيادات"
              : `⭐ مستوى ${item}`}
          </button>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-sm text-zinc-400">إجمالي الموظفين</p>
          <h2 className="mt-2 text-3xl font-black text-yellow-400">
            {totalEmployees}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-sm text-zinc-400">القيادات</p>
          <h2 className="mt-2 text-3xl font-black text-yellow-400">
            {leaders}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-sm text-zinc-400">جاهزون للترقية</p>
          <h2 className="mt-2 text-3xl font-black text-green-400">
            {readyPromotion}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="text-sm text-zinc-400">عليهم إنذارات</p>
          <h2 className="mt-2 text-3xl font-black text-red-400">
            {warnings}
          </h2>
        </div>
      </div>

      {sortedEmployees.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-700 p-10 text-center text-zinc-400">
          لا يوجد نتائج.
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedEmployees.map((employee: any) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
            />
          ))}
        </div>
      )}
    </>
  );
}