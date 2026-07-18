"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  AlertOctagon,
  Banknote,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import PermissionGuard from "@/components/auth/PermissionGuard";

type ViolationLevel = "بسيطة" | "متوسطة" | "مشددة";

type SectorViolation = {
  id: string;
  title: string;
  description: string;
  penalty: string;
  amount: string;
  category: string;
  level: ViolationLevel;
  active?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type ViolationForm = {
  title: string;
  description: string;
  penalty: string;
  amount: string;
  category: string;
  level: ViolationLevel;
  active: boolean;
};

const categories = [
  "السلوك الوظيفي",
  "التهرب الوظيفي",
  "الحضور والتفاعل",
  "مخالفات الراديو",
  "مخالفات المركبات",
  "مخالفات الميدان",
  "الدورات والترقيات",
  "مخالفات إدارية",
  "أخرى",
];

const emptyForm: ViolationForm = {
  title: "",
  description: "",
  penalty: "",
  amount: "",
  category: "السلوك الوظيفي",
  level: "بسيطة",
  active: true,
};

function getLevelClasses(level: ViolationLevel) {
  switch (level) {
    case "مشددة":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "متوسطة":
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";

    default:
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
  }
}

export default function DashboardViolationsPage() {
  const [violations, setViolations] = useState<SectorViolation[]>([]);
  const [form, setForm] = useState<ViolationForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [levelFilter, setLevelFilter] = useState("الكل");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const violationsQuery = query(
      collection(db, "sectorViolations"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      violationsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((violationDoc) => ({
          id: violationDoc.id,
          ...(violationDoc.data() as Omit<SectorViolation, "id">),
        }));

        setViolations(data);
        setLoading(false);
      },
      (error) => {
        console.error("تعذر تحميل المخالفات:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredViolations = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return violations.filter((violation) => {
      const matchesSearch =
        !cleanSearch ||
        violation.title?.toLowerCase().includes(cleanSearch) ||
        violation.description?.toLowerCase().includes(cleanSearch) ||
        violation.penalty?.toLowerCase().includes(cleanSearch) ||
        violation.amount?.toLowerCase().includes(cleanSearch) ||
        violation.category?.toLowerCase().includes(cleanSearch);

      const matchesCategory =
        categoryFilter === "الكل" ||
        violation.category === categoryFilter;

      const matchesLevel =
        levelFilter === "الكل" ||
        violation.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [violations, search, categoryFilter, levelFilter]);

  const visibleCount = violations.filter(
    (violation) => violation.active !== false
  ).length;

  const hiddenCount = violations.filter(
    (violation) => violation.active === false
  ).length;

  const severeCount = violations.filter(
    (violation) => violation.level === "مشددة"
  ).length;

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(violation: SectorViolation) {
    setEditingId(violation.id);

    setForm({
      title: violation.title ?? "",
      description: violation.description ?? "",
      penalty: violation.penalty ?? "",
      amount: violation.amount ?? "",
      category: violation.category ?? "السلوك الوظيفي",
      level: violation.level ?? "بسيطة",
      active: violation.active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveViolation() {
    const title = form.title.trim();
    const description = form.description.trim();
    const penalty = form.penalty.trim();
    const amount = form.amount.trim();
    const category = form.category.trim();

    if (!title) {
      alert("اكتبي اسم المخالفة.");
      return;
    }

    if (!description) {
      alert("اكتبي شرح المخالفة.");
      return;
    }

    if (!penalty) {
      alert("اكتبي العقوبة أو الإجراء.");
      return;
    }

    try {
      setSaving(true);

      const violationData = {
        title,
        description,
        penalty,
        amount,
        category,
        level: form.level,
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "sectorViolations", editingId),
          violationData
        );

        await addActivity(`تعديل مخالفة: ${title}`);
      } else {
        await addDoc(collection(db, "sectorViolations"), {
          ...violationData,
          createdAt: serverTimestamp(),
        });

        await addActivity(`إضافة مخالفة جديدة: ${title}`);
      }

      resetForm();
    } catch (error) {
      console.error("تعذر حفظ المخالفة:", error);
      alert("حدث خطأ أثناء حفظ المخالفة.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleViolation(violation: SectorViolation) {
    const nextStatus = !(violation.active ?? true);

    try {
      await updateDoc(
        doc(db, "sectorViolations", violation.id),
        {
          active: nextStatus,
          updatedAt: serverTimestamp(),
        }
      );

      await addActivity(
        `${nextStatus ? "إظهار" : "إخفاء"} مخالفة: ${
          violation.title
        }`
      );
    } catch (error) {
      console.error("تعذر تغيير حالة المخالفة:", error);
      alert("حدث خطأ أثناء تغيير حالة المخالفة.");
    }
  }

  async function removeViolation(violation: SectorViolation) {
    const confirmed = window.confirm(
      `هل أنت متأكدة من حذف مخالفة "${violation.title}"؟`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "sectorViolations", violation.id)
      );

      await addActivity(`حذف مخالفة: ${violation.title}`);

      if (editingId === violation.id) {
        resetForm();
      }
    } catch (error) {
      console.error("تعذر حذف المخالفة:", error);
      alert("حدث خطأ أثناء حذف المخالفة.");
    }
  }

  return (
    <PermissionGuard permission="violations">
      <main className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <AlertOctagon
                size={30}
                className="text-red-400"
              />
            </div>

            <div>
              <h1 className="text-4xl font-black text-yellow-400">
                إدارة المخالفات والغرامات
              </h1>

              <p className="mt-2 text-zinc-400">
                إضافة وتعديل المخالفات والإجراءات المعتمدة داخل القطاع.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#141414] px-5 py-3">
              <p className="text-xs text-zinc-500">
                جميع المخالفات
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {violations.length}
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3">
              <p className="text-xs text-green-300">
                ظاهرة
              </p>

              <p className="mt-1 text-xl font-black text-green-400">
                {visibleCount}
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3">
              <p className="text-xs text-red-300">
                مشددة
              </p>

              <p className="mt-1 text-xl font-black text-red-400">
                {severeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-500/20 bg-zinc-500/10 px-5 py-3">
              <p className="text-xs text-zinc-400">
                مخفية
              </p>

              <p className="mt-1 text-xl font-black text-zinc-300">
                {hiddenCount}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-7 backdrop-blur-xl md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {editingId
                  ? "تعديل المخالفة"
                  : "إضافة مخالفة جديدة"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                اكتب تفاصيل المخالفة والعقوبة والغرامة المرتبطة بها.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-zinc-300 transition hover:bg-white/10"
              >
                <X size={18} />
                إلغاء التعديل
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                اسم المخالفة
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="مثال: التهرب الوظيفي"
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                القسم
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                مستوى المخالفة
              </label>

              <select
                value={form.level}
                onChange={(event) =>
                  setForm({
                    ...form,
                    level: event.target.value as ViolationLevel,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              >
                <option value="بسيطة">بسيطة</option>
                <option value="متوسطة">متوسطة</option>
                <option value="مشددة">مشددة</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-zinc-300">
                قيمة الغرامة
              </label>

              <div className="relative">
                <Banknote
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400"
                />

                <input
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                  placeholder="مثال: 500 ألف"
                  className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-bold text-zinc-300">
                شرح المخالفة
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={4}
                placeholder="اكتب متى تعتبر الحالة مخالفة..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 leading-8 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-bold text-zinc-300">
                العقوبة أو الإجراء
              </label>

              <textarea
                value={form.penalty}
                onChange={(event) =>
                  setForm({
                    ...form,
                    penalty: event.target.value,
                  })
                }
                rows={3}
                placeholder="مثال: غرامة، كسر رتبة، فصل أو منع من التقديم..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 leading-8 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>
          </div>

          <label className="mt-6 flex w-fit cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm({
                  ...form,
                  active: event.target.checked,
                })
              }
              className="h-5 w-5 accent-yellow-500"
            />

            <span className="font-bold text-white">
              إظهار المخالفة في الصفحة العامة
            </span>
          </label>

          <button
            type="button"
            onClick={saveViolation}
            disabled={saving}
            className="mt-7 flex items-center gap-2 rounded-2xl bg-yellow-500 px-7 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingId ? (
              <Save size={20} />
            ) : (
              <Plus size={20} />
            )}

            {saving
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "إضافة المخالفة"}
          </button>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_250px_220px]">
            <div className="relative">
              <Search
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ابحث في المخالفات أو العقوبات..."
                className="w-full rounded-2xl border border-white/10 bg-[#141414] py-4 pl-4 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع الأقسام
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#141414] p-4 text-white outline-none transition focus:border-yellow-500"
            >
              <option value="الكل">
                جميع المستويات
              </option>
              <option value="بسيطة">بسيطة</option>
              <option value="متوسطة">متوسطة</option>
              <option value="مشددة">مشددة</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white">
              المخالفات المسجلة
            </h2>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
              {filteredViolations.length} نتيجة
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-zinc-400">
              جارٍ تحميل المخالفات...
            </div>
          ) : filteredViolations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <AlertOctagon
                size={45}
                className="mx-auto text-zinc-600"
              />

              <h3 className="mt-5 text-xl font-black text-zinc-300">
                لا توجد مخالفات مطابقة
              </h3>

              <p className="mt-2 text-zinc-500">
                غير البحث أو أضف مخالفة جديدة.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredViolations.map((violation, index) => {
                const active = violation.active ?? true;

                return (
                  <article
                    key={violation.id}
                    className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition ${
                      active
                        ? "border-white/10 bg-[#141414]/90"
                        : "border-zinc-500/20 bg-zinc-500/5 opacity-65"
                    }`}
                  >
                    <div
                      className={`absolute right-0 top-0 h-full w-1 ${
                        violation.level === "مشددة"
                          ? "bg-red-500"
                          : violation.level === "متوسطة"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                      }`}
                    />

                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 font-black text-black">
                            {index + 1}
                          </span>

                          <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                            {violation.category}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${getLevelClasses(
                              violation.level
                            )}`}
                          >
                            {violation.level}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              active
                                ? "bg-green-500/10 text-green-400"
                                : "bg-zinc-500/10 text-zinc-400"
                            }`}
                          >
                            {active ? "ظاهرة" : "مخفية"}
                          </span>
                        </div>

                        <h3 className="mt-5 text-2xl font-black text-white">
                          {violation.title}
                        </h3>

                        <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
                          {violation.description}
                        </p>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          {violation.amount && (
                            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4">
                              <p className="text-sm font-black text-yellow-400">
                                قيمة الغرامة
                              </p>

                              <p className="mt-2 text-lg font-black text-white">
                                {violation.amount}
                              </p>
                            </div>
                          )}

                          <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
                            <p className="text-sm font-black text-red-400">
                              العقوبة أو الإجراء
                            </p>

                            <p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-300">
                              {violation.penalty}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditing(violation)}
                          className="flex items-center gap-2 rounded-xl bg-blue-600/15 px-4 py-2 font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                        >
                          <Pencil size={17} />
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleViolation(violation)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition ${
                            active
                              ? "bg-orange-500/15 text-orange-400 hover:bg-orange-500 hover:text-black"
                              : "bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-black"
                          }`}
                        >
                          {active ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}

                          {active ? "إخفاء" : "إظهار"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeViolation(violation)}
                          className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 size={17} />
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PermissionGuard>
  );
}