"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Crown,
  Edit3,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import RoleGuard from "@/components/auth/RoleGuard";
import LevelCapacityStats from "@/components/employees/LevelCapacityStats";
import {
  EMPLOYEE_TYPE_LABELS,
  LEADER_LEVEL_NUMBERS,
  LEVEL_NUMBERS,
  MAIN_LEVEL_NUMBERS,
  STATUS_LABELS,
  formatEmployeeCode,
  getCodesForLevel,
  getLevelCapacity,
  getPrefixForEmployeeType,
  normalizeEmployeeDocument,
  parseEmployeeCode,
  type EmployeeRecord,
  type EmployeeStatus,
  type EmployeeType,
  type LevelNumber,
} from "@/lib/employeeCodes";

type EmployeeCategory = EmployeeType;

type EmployeeForm = {
  name: string;
  discordId: string;
  employeeType: EmployeeCategory;
  level: LevelNumber;
  fullCode: string;
  mainSector: string;
  status: EmployeeStatus;
};

const emptyForm: EmployeeForm = {
  name: "",
  discordId: "",
  employeeType: "main",
  level: 1,
  fullCode: "",
  mainSector: "",
  status: "active",
};

const employeeemployeeTypeIcons = {
  main: Users,
  leader: Crown,
  certified: BadgeCheck,
  certified_leader: Crown,
  administration: Users,
} satisfies Record<EmployeeCategory, typeof Users>;

function getStoredEmployeeType(
  employeeType: EmployeeCategory
): EmployeeType {
  return employeeType;
}

function getEmployeeCategory(
  employee: EmployeeRecord
): EmployeeCategory {
  return employee.employeeType;
}

function getAllowedLevels(
  employeeType: EmployeeCategory
): LevelNumber[] {
  if (employeeType === "main") {
    return MAIN_LEVEL_NUMBERS;
  }

  if (employeeType === "leader") {
    return LEADER_LEVEL_NUMBERS;
  }

  return LEVEL_NUMBERS;
}

function getEmployeeCategoryLabel(
  employeeType: EmployeeCategory
) {
  return employeeType === "leader"
    ? "قيادة"
    : EMPLOYEE_TYPE_LABELS[employeeType];
}

function getEmployeeTypeBadge(
  employeeType: EmployeeCategory
) {
  if (employeeType === "leader") {
    return "border-yellow-500/30 bg-yellow-500/15 text-yellow-300";
  }

  if (employeeType === "certified_leader") {
    return "border-purple-500/20 bg-purple-500/10 text-purple-400";
  }

  if (employeeType === "certified") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}

function getStatusBadge(status: EmployeeStatus) {
  if (status === "leave") {
    return "bg-orange-500/10 text-orange-400";
  }

  if (status === "suspended") {
    return "bg-red-500/10 text-red-400";
  }

  return "bg-green-500/10 text-green-400";
}
const employeeTypeIcons = {
  main: Users,
  leader: Crown,
  certified: BadgeCheck,
  certified_leader: Crown,
  administration: Users,
} satisfies Record<EmployeeCategory, typeof Users>;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | EmployeeCategory
  >("all");
  const [levelFilter, setLevelFilter] = useState<"all" | LevelNumber>(
    "all"
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        const nextEmployees = snapshot.docs
          .map((employeeDocument) =>
            normalizeEmployeeDocument(
              employeeDocument.id,
              employeeDocument.data()
            )
          )
          .sort((first, second) => {
            if (first.level !== second.level) {
              return first.level - second.level;
            }

            return second.codeNumber - first.codeNumber;
          });

        setEmployees(nextEmployees);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error("تعذر تحميل الموظفين:", error);
        setErrorMessage("تعذر تحميل بيانات الموظفين.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const usedCodes = useMemo(() => {
    return new Set(
      employees
        .filter((employee) => employee.id !== editingId)
        .map((employee) => employee.fullCode.toUpperCase())
    );
  }, [employees, editingId]);

  const storedEmployeeType = getStoredEmployeeType(
    form.employeeType
  );

  const allowedLevels = getAllowedLevels(
    form.employeeType
  );

  const allCodesForSelectedLevel = useMemo(
    () =>
      getCodesForLevel(
        storedEmployeeType,
        form.level
      ),
    [storedEmployeeType, form.level]
  );

  const availableCodes = useMemo(
    () =>
      allCodesForSelectedLevel.filter(
        (code) => !usedCodes.has(code.toUpperCase())
      ),
    [allCodesForSelectedLevel, usedCodes]
  );

  useEffect(() => {
    setForm((current) => {
      if (availableCodes.includes(current.fullCode)) {
        return current;
      }

      return {
        ...current,
        fullCode: availableCodes[0] ?? "",
      };
    });
  }, [availableCodes]);

  const selectedCapacity = getLevelCapacity(
    storedEmployeeType,
    form.level
  );

  const selectedUsed = employees.filter(
    (employee) =>
      employee.id !== editingId &&
      getEmployeeCategory(employee) ===
        form.employeeType &&
      employee.level === form.level
  ).length;

  const filteredEmployees = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !cleanSearch ||
        employee.name.toLowerCase().includes(cleanSearch) ||
        employee.discordId.toLowerCase().includes(cleanSearch) ||
        employee.fullCode.toLowerCase().includes(cleanSearch) ||
        employee.mainSector.toLowerCase().includes(cleanSearch);

      const matchesType =
        typeFilter === "all" ||
        getEmployeeCategory(employee) ===
          typeFilter;

      const matchesLevel =
        levelFilter === "all" || employee.level === levelFilter;

      return matchesSearch && matchesType && matchesLevel;
    });
  }, [employees, levelFilter, search, typeFilter]);

  function updateForm<Key extends keyof EmployeeForm>(
    key: Key,
    value: EmployeeForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  function updateEmployeeType(
    employeeType: EmployeeCategory
  ) {
    const nextLevels =
      getAllowedLevels(employeeType);

    setForm((current) => {
      const nextLevel =
        nextLevels.includes(current.level)
          ? current.level
          : nextLevels[0];

      return {
        ...current,
        employeeType,
        level: nextLevel,
        fullCode: "",
        mainSector:
          employeeType === "main" ||
          employeeType === "leader"
            ? ""
            : current.mainSector,
      };
    });

    setMessage("");
    setErrorMessage("");
  }

  function startAddEmployee() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEditEmployee(employee: EmployeeRecord) {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      discordId: employee.discordId,
      employeeType: getEmployeeCategory(
        employee
      ),
      level: employee.level,
      fullCode: employee.fullCode,
      mainSector: employee.mainSector,
      status: employee.status,
    });
    setShowForm(true);
    setMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage("");
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = form.name.trim();
    const cleanDiscordId = form.discordId.trim();
    const cleanSector = form.mainSector.trim();

    if (!cleanName) {
      setErrorMessage("اكتبي اسم الموظف.");
      return;
    }

    if (!cleanDiscordId) {
      setErrorMessage("اكتبي ID الديسكورد.");
      return;
    }

    const requiresMainSector =
      form.employeeType === "certified" ||
      form.employeeType ===
        "certified_leader";

    if (requiresMainSector && !cleanSector) {
      setErrorMessage(
        "اكتبي القطاع الأساسي للاعب المعتمد."
      );
      return;
    }

    if (!form.fullCode) {
      setErrorMessage(
        "هذا المستوى مكتمل ولا يوجد كود متاح. اختاري مستوى آخر."
      );
      return;
    }

    const duplicatedCode = employees.some(
      (employee) =>
        employee.id !== editingId &&
        employee.fullCode.toUpperCase() === form.fullCode.toUpperCase()
    );

    if (duplicatedCode) {
      setErrorMessage("هذا الكود مستخدم بالفعل. اختاري كودًا آخر.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      const parsedCode = parseEmployeeCode(form.fullCode);
      const employeeType =
        getStoredEmployeeType(
          form.employeeType
        );
      const prefix =
        getPrefixForEmployeeType(
          employeeType
        );
      const normalizedCode = formatEmployeeCode(
        prefix,
        parsedCode.codeNumber
      );

      const payload = {
        name: cleanName,
        discordId: cleanDiscordId,
        employeeType,
        codePrefix: prefix,
        codeNumber: parsedCode.codeNumber,
        fullCode: normalizedCode,

        // للتوافق مع الصفحات القديمة التي كانت تستخدم rank:
        rank: normalizedCode,

        level: form.level,
        mainSector:
          employeeType === "main" ||
          employeeType === "leader"
            ? ""
            : cleanSector,
        status: form.status,
        certified:
          employeeType === "certified" ||
          employeeType === "certified_leader",
        certifiedLeader:
          employeeType ===
          "certified_leader",
        isLeader:
          employeeType === "leader",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "employees", editingId), payload);

        try {
          await addActivity(
            `تم تعديل الموظف ${cleanName} إلى ${normalizedCode}`
          );
        } catch (activityError) {
          console.error("تعذر تسجيل النشاط:", activityError);
        }

        setMessage("تم تعديل بيانات الموظف بنجاح.");
      } else {
        await addDoc(collection(db, "employees"), {
          ...payload,
          reports: {
            fieldGuide: 0,
            fieldSupervisor: 0,
            generalSupervisor: 0,
            recruitment: 0,
          },
          warnings: 0,
          coursesCompleted: 0,
          coursesTotal: 0,
          notes: "",
          hiredAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        try {
          await addActivity(
            `تمت إضافة الموظف ${cleanName} بالكود ${normalizedCode}`
          );
        } catch (activityError) {
          console.error("تعذر تسجيل النشاط:", activityError);
        }

        setMessage("تمت إضافة الموظف والكود بنجاح.");
      }

      closeForm();
    } catch (error) {
      console.error("تعذر حفظ الموظف:", error);
      setErrorMessage("حدث خطأ أثناء حفظ بيانات الموظف.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(employee: EmployeeRecord) {
    const confirmed = window.confirm(
      `هل أنتِ متأكدة من حذف ${employee.name} — ${employee.fullCode}؟`
    );

    if (!confirmed) return;

    try {
      setDeletingId(employee.id);
      setErrorMessage("");
      await deleteDoc(doc(db, "employees", employee.id));

      try {
        await addActivity(
          `تم حذف الموظف ${employee.name} — ${employee.fullCode}`
        );
      } catch (activityError) {
        console.error("تعذر تسجيل النشاط:", activityError);
      }

      setMessage("تم حذف الموظف وأصبح كوده متاحًا من جديد.");
    } catch (error) {
      console.error("تعذر حذف الموظف:", error);
      setErrorMessage("حدث خطأ أثناء حذف الموظف.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RoleGuard allow={["owner", "leader", "supervisor"]}>
      <main dir="rtl" className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
              إدارة الموظفين
            </h1>
            <p className="mt-2 text-zinc-400">
              إضافة الموظفين والمعتمدين واختيار الأكواد المتاحة تلقائيًا.
            </p>
          </div>

          <button
            type="button"
            onClick={startAddEmployee}
            className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black transition hover:bg-yellow-400"
          >
            <UserRoundPlus size={20} />
            إضافة موظف
          </button>
        </header>

        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 font-bold text-green-400">
            <CheckCircle2 size={20} />
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-bold text-red-400">
            <AlertTriangle size={20} />
            {errorMessage}
          </div>
        )}

        {showForm && (
          <section className="rounded-[30px] border border-yellow-500/20 bg-[#141414] p-5 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {editingId ? "تعديل الموظف" : "إضافة موظف جديد"}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  اختار النوع والمستوى، وسيظهر لك فقط الكود المتاح.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveEmployee}
              className="mt-7 grid gap-5 lg:grid-cols-2 xl:grid-cols-3"
            >
              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  اسم الموظف
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                  placeholder="الاسم داخل القطاع"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  ID الديسكورد
                </span>
                <input
                  value={form.discordId}
                  onChange={(event) =>
                    updateForm("discordId", event.target.value)
                  }
                  dir="ltr"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left text-white outline-none focus:border-yellow-500"
                  placeholder="123456789..."
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  نوع الموظف
                </span>
                <select
                  value={form.employeeType}
                  onChange={(event) =>
                    updateEmployeeType(
                      event.target
                        .value as EmployeeCategory
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                >
                  <option value="main">موظف أساسي — G</option>
                  <option value="leader">قيادة — G</option>
                  <option value="certified">لاعب معتمد — C</option>
                  <option value="certified_leader">
                    قيادة معتمدة — CA
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  المستوى
                </span>
                <select
                  value={form.level}
                  onChange={(event) =>
                    updateForm(
                      "level",
                      Number(event.target.value) as LevelNumber
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                >
                  {allowedLevels.map((level) => (
                    <option key={level} value={level}>
                      المستوى {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 font-bold text-zinc-300">
                  <span>الكود المتاح</span>
                  <span
                    className={`text-xs ${
                      availableCodes.length === 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    المتبقي {availableCodes.length}
                  </span>
                </span>

                <select
                  value={form.fullCode}
                  disabled={availableCodes.length === 0}
                  onChange={(event) =>
                    updateForm("fullCode", event.target.value)
                  }
                  dir="ltr"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left font-mono font-black text-yellow-400 outline-none focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {availableCodes.length === 0 ? (
                    <option value="">المستوى مكتمل</option>
                  ) : (
                    availableCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-zinc-300">
                  الحالة
                </span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value as EmployeeStatus
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                >
                  <option value="active">على رأس العمل</option>
                  <option value="leave">إجازة</option>
                  <option value="suspended">موقوف</option>
                </select>
              </label>

              {(form.employeeType ===
                "certified" ||
                form.employeeType ===
                  "certified_leader") && (
                <label className="block lg:col-span-2">
                  <span className="mb-2 block font-bold text-zinc-300">
                    القطاع الأساسي
                  </span>
                  <input
                    value={form.mainSector}
                    onChange={(event) =>
                      updateForm("mainSector", event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white outline-none focus:border-yellow-500"
                    placeholder="مثال: الهلال الأحمر، الشرطة..."
                  />
                </label>
              )}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-bold text-zinc-400">
                  إشغال المستوى المحدد
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <strong
                    className={`text-3xl font-black ${
                      selectedUsed >= selectedCapacity
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {selectedUsed}
                  </strong>
                  <span className="pb-1 text-sm text-zinc-500">
                    من {selectedCapacity}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  المتبقي:{" "}
                  {Math.max(0, selectedCapacity - selectedUsed)}
                </p>
              </div>

              <button
                type="submit"
                disabled={saving || !form.fullCode}
                className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 p-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 lg:col-span-2 xl:col-span-3"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {editingId ? "حفظ التعديل" : "إضافة الموظف"}
              </button>
            </form>
          </section>
        )}

        <LevelCapacityStats employees={employees} />

        <section className="rounded-[30px] border border-white/10 bg-[#141414] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                قائمة الموظفين
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                العدد الظاهر: {filteredEmployees.length}
              </p>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-3 xl:w-auto">
              <label className="relative">
                <Search
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 py-3 pl-4 pr-11 text-white outline-none focus:border-yellow-500"
                  placeholder="بحث..."
                />
              </label>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value as
                      | "all"
                      | EmployeeCategory
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white"
              >
                <option value="all">كل الأنواع</option>
                <option value="main">الموظفون الأساسيون</option>
                <option value="leader">القيادات</option>
                <option value="certified">اللاعبون المعتمدون</option>
                <option value="certified_leader">
                  القيادات المعتمدة
                </option>
              </select>

              <select
                value={levelFilter}
                onChange={(event) =>
                  setLevelFilter(
                    event.target.value === "all"
                      ? "all"
                      : (Number(event.target.value) as LevelNumber)
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white"
              >
                <option value="all">كل المستويات</option>
                {LEVEL_NUMBERS.map((level) => (
                  <option key={level} value={level}>
                    المستوى {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="animate-spin text-yellow-400" size={38} />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              لا يوجد موظفون مطابقون للبحث.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.map((employee) => {
                const employeeCategory =
                  getEmployeeCategory(employee);
                const Icon =
                            employeeTypeIcons[employeeCategory];

                return (
                  <article
                    key={employee.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                          <Icon size={22} className="text-yellow-400" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-black text-white">
                            {employee.name}
                          </h3>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {employee.discordId}
                          </p>
                        </div>
                      </div>

                      <span
                        dir="ltr"
                        className="shrink-0 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 font-mono text-sm font-black text-yellow-400"
                      >
                        {employee.fullCode}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${getEmployeeTypeBadge(
                          employeeCategory
                        )}`}
                      >
                        {getEmployeeCategoryLabel(
                          employeeCategory
                        )}
                      </span>

                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-black text-zinc-300">
                        المستوى {employee.level}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadge(
                          employee.status
                        )}`}
                      >
                        {STATUS_LABELS[employee.status]}
                      </span>
                    </div>

                    {(employee.employeeType ===
                      "certified" ||
                      employee.employeeType ===
                        "certified_leader") && (
                      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs text-zinc-500">
                          القطاع الأساسي
                        </p>
                        <p className="mt-1 font-bold text-zinc-200">
                          {employee.mainSector || "غير محدد"}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-3">
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 py-3 font-black text-blue-400 transition hover:bg-blue-500/20"
                      >
                        <Users size={17} />
                        ملف الموظف
                      </Link>

                      <button
                        type="button"
                        onClick={() => startEditEmployee(employee)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 py-3 font-black text-yellow-400 transition hover:bg-yellow-500/20"
                      >
                        <Edit3 size={17} />
                        تعديل البيانات
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === employee.id}
                        onClick={() => removeEmployee(employee)}
                        className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        aria-label={`حذف ${employee.name}`}
                      >
                        {deletingId === employee.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </RoleGuard>
  );
}