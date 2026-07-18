"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Save,
  Trash2,
  Unlock,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";
import {
  CORE_COURSES,
  isCoreCourseName,
} from "@/lib/courseCatalog";
import PermissionGuard from "@/components/auth/PermissionGuard";

type EmployeeType = "main" | "certified" | "certified_leader";
type CourseStatus = "open" | "closed" | "completed";
type RegistrationStatus =
  | "registered"
  | "attended"
  | "completed"
  | "absent";

type CourseSession = {
  id: string;
  courseName: string;
  description?: string;
  startsAt?: Timestamp | null;
  registrationEndsAt?: Timestamp | null;
  allowedLevels: number[];
  allowedEmployeeTypes: EmployeeType[];
  registrationOpen: boolean;
  status: CourseStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type CourseRegistration = {
  id: string;
  courseId: string;
  courseName: string;
  employeeId: string;
  employeeName: string;
  discordId: string;
  employeeCode?: string;
  employeeLevel: number;
  employeeType: EmployeeType;
  attended: boolean;
  status: RegistrationStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type CourseForm = {
  courseName: string;
  description: string;
  startsAt: string;
  registrationEndsAt: string;
  allowedLevels: number[];
  allowedEmployeeTypes: EmployeeType[];
  registrationOpen: boolean;
};

const ALL_LEVELS = Array.from({ length: 10 }, (_, index) => index + 1);

const EMPLOYEE_TYPES: Array<{
  value: EmployeeType;
  label: string;
}> = [
  { value: "main", label: "الأساسي G" },
  { value: "certified", label: "المعتمد C" },
  { value: "certified_leader", label: "قيادة المعتمد CA" },
];

const emptyForm: CourseForm = {
  courseName: "",
  description: "",
  startsAt: "",
  registrationEndsAt: "",
  allowedLevels: [...ALL_LEVELS],
  allowedEmployeeTypes: EMPLOYEE_TYPES.map((type) => type.value),
  registrationOpen: true,
};

function toInputDateTime(value?: Timestamp | null) {
  if (!value) return "";

  const date = value.toDate();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function formatDateTime(value?: Timestamp | null) {
  if (!value) return "غير محدد";

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value.toDate());
}

function getEmployeeTypeLabel(type: EmployeeType) {
  return EMPLOYEE_TYPES.find((item) => item.value === type)?.label ?? type;
}

function getStatusData(status: CourseStatus) {
  if (status === "completed") {
    return {
      label: "مكتملة",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    };
  }

  if (status === "open") {
    return {
      label: "التسجيل مفتوح",
      className: "border-green-500/20 bg-green-500/10 text-green-400",
    };
  }

  return {
    label: "التسجيل مغلق",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSession[]>([]);
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    const coursesQuery = query(
      collection(db, "courseSessions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      coursesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((courseDocument) => ({
          id: courseDocument.id,
          ...(courseDocument.data() as Omit<CourseSession, "id">),
        }));

        setCourses(data);
        setLoadingCourses(false);

        setSelectedCourseId((current) => {
          if (current && data.some((course) => course.id === current)) {
            return current;
          }

          return data[0]?.id ?? "";
        });
      },
      (error) => {
        console.error("تعذر تحميل جلسات الدورات:", error);
        setLoadingCourses(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setRegistrations([]);
      setLoadingRegistrations(false);
      return;
    }

    setLoadingRegistrations(true);

    const registrationsQuery = query(
      collection(db, "courseRegistrations"),
      where("courseId", "==", selectedCourseId)
    );

    const unsubscribe = onSnapshot(
      registrationsQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((registrationDocument) => ({
            id: registrationDocument.id,
            ...(registrationDocument.data() as Omit<
              CourseRegistration,
              "id"
            >),
          }))
          .sort((first, second) => {
            const firstTime = first.createdAt?.toMillis?.() ?? 0;
            const secondTime = second.createdAt?.toMillis?.() ?? 0;
            return firstTime - secondTime;
          });

        setRegistrations(data);
        setLoadingRegistrations(false);
      },
      (error) => {
        console.error("تعذر تحميل المسجلين في الدورة:", error);
        setRegistrations([]);
        setLoadingRegistrations(false);
      }
    );

    return () => unsubscribe();
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  const attendanceCount = registrations.filter(
    (registration) => registration.attended
  ).length;

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function toggleLevel(level: number) {
    setForm((current) => ({
      ...current,
      allowedLevels: current.allowedLevels.includes(level)
        ? current.allowedLevels.filter((item) => item !== level)
        : [...current.allowedLevels, level].sort((a, b) => a - b),
    }));
  }

  function toggleEmployeeType(type: EmployeeType) {
    setForm((current) => ({
      ...current,
      allowedEmployeeTypes: current.allowedEmployeeTypes.includes(type)
        ? current.allowedEmployeeTypes.filter((item) => item !== type)
        : [...current.allowedEmployeeTypes, type],
    }));
  }

  function startEditing(course: CourseSession) {
    setEditingId(course.id);
    setForm({
      courseName: course.courseName ?? "",
      description: course.description ?? "",
      startsAt: toInputDateTime(course.startsAt),
      registrationEndsAt: toInputDateTime(course.registrationEndsAt),
      allowedLevels:
        course.allowedLevels?.length > 0
          ? [...course.allowedLevels]
          : [...ALL_LEVELS],
      allowedEmployeeTypes:
        course.allowedEmployeeTypes?.length > 0
          ? [...course.allowedEmployeeTypes]
          : EMPLOYEE_TYPES.map((type) => type.value),
      registrationOpen: course.registrationOpen ?? false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCourse() {
    const courseName = form.courseName.trim();
    const description = form.description.trim();

    if (!isCoreCourseName(courseName)) {
      alert("اختر دورة معتمدة من القائمة.");
      return;
    }

    if (!form.startsAt) {
      alert("حدد موعد الدورة.");
      return;
    }

    if (form.allowedLevels.length === 0) {
      alert("اختر مستوى واحدًا على الأقل.");
      return;
    }

    if (form.allowedEmployeeTypes.length === 0) {
      alert("اختر فئة موظفين واحدة على الأقل.");
      return;
    }

    const startsAtDate = new Date(form.startsAt);
    const registrationEndsAtDate = form.registrationEndsAt
      ? new Date(form.registrationEndsAt)
      : null;

    if (Number.isNaN(startsAtDate.getTime())) {
      alert("موعد الدورة غير صحيح.");
      return;
    }

    if (
      registrationEndsAtDate &&
      Number.isNaN(registrationEndsAtDate.getTime())
    ) {
      alert("موعد إغلاق التسجيل غير صحيح.");
      return;
    }

    if (
      registrationEndsAtDate &&
      registrationEndsAtDate.getTime() > startsAtDate.getTime()
    ) {
      alert("موعد إغلاق التسجيل يجب أن يكون قبل موعد الدورة.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        courseName,
        description,
        startsAt: Timestamp.fromDate(startsAtDate),
        registrationEndsAt: registrationEndsAtDate
          ? Timestamp.fromDate(registrationEndsAtDate)
          : null,
        allowedLevels: [...form.allowedLevels].sort((a, b) => a - b),
        allowedEmployeeTypes: form.allowedEmployeeTypes,
        registrationOpen: form.registrationOpen,
        status: form.registrationOpen ? "open" : "closed",
        updatedAt: serverTimestamp(),
      } satisfies Omit<
        CourseSession,
        "id" | "createdAt" | "updatedAt"
      > & { updatedAt: ReturnType<typeof serverTimestamp> };

      if (editingId) {
        const currentCourse = courses.find((course) => course.id === editingId);

        if (currentCourse?.status === "completed") {
          alert("لا يمكن تعديل دورة مكتملة.");
          return;
        }

        await updateDoc(doc(db, "courseSessions", editingId), payload);
        await addActivity(`تعديل دورة ${courseName}`);
      } else {
        await addDoc(collection(db, "courseSessions"), {
          ...payload,
          createdAt: serverTimestamp(),
        });

        await addActivity(`إنشاء دورة ${courseName}`);
      }

      resetForm();
    } catch (error) {
      console.error("تعذر حفظ الدورة:", error);
      alert("حدث خطأ أثناء حفظ الدورة.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRegistration(course: CourseSession) {
    if (course.status === "completed") {
      alert("هذه الدورة مكتملة ولا يمكن إعادة فتحها.");
      return;
    }

    const nextStatus = !course.registrationOpen;

    try {
      await updateDoc(doc(db, "courseSessions", course.id), {
        registrationOpen: nextStatus,
        status: nextStatus ? "open" : "closed",
        updatedAt: serverTimestamp(),
      });

      await addActivity(
        `${nextStatus ? "فتح" : "إغلاق"} التسجيل في دورة ${course.courseName}`
      );
    } catch (error) {
      console.error("تعذر تغيير حالة التسجيل:", error);
      alert("حدث خطأ أثناء تغيير حالة التسجيل.");
    }
  }

  async function removeCourse(course: CourseSession) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف دورة "${course.courseName}"؟`
    );

    if (!confirmed) return;

    try {
      const registrationsSnapshot = await getDocs(
        query(
          collection(db, "courseRegistrations"),
          where("courseId", "==", course.id),
          limit(1)
        )
      );

      if (!registrationsSnapshot.empty) {
        alert("لا يمكن حذف الدورة لوجود موظفين مسجلين فيها. أغلق التسجيل بدلًا من حذفها.");
        return;
      }

      await deleteDoc(doc(db, "courseSessions", course.id));
      await addActivity(`حذف دورة ${course.courseName}`);
    } catch (error) {
      console.error("تعذر حذف الدورة:", error);
      alert("حدث خطأ أثناء حذف الدورة.");
    }
  }

  async function toggleAttendance(registration: CourseRegistration) {
    if (selectedCourse?.status === "completed") {
      alert("تم اعتماد هذه الدورة بالفعل.");
      return;
    }

    const nextAttendance = !registration.attended;

    try {
      await updateDoc(doc(db, "courseRegistrations", registration.id), {
        attended: nextAttendance,
        status: nextAttendance ? "attended" : "registered",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("تعذر تحديث الحضور:", error);
      alert("حدث خطأ أثناء تحديث الحضور.");
    }
  }

  async function finalizeCourse() {
    if (!selectedCourse) return;

    if (selectedCourse.status === "completed") {
      alert("تم اعتماد هذه الدورة مسبقًا.");
      return;
    }

    if (!isCoreCourseName(selectedCourse.courseName)) {
      alert("لا يمكن اعتماد دورة غير موجودة في قائمة الدورات الرسمية.");
      return;
    }

    const attendees = registrations.filter((registration) => registration.attended);
    const attendeeNames = attendees.map((registration) => registration.employeeName);

    const confirmed = window.confirm(
      `سيتم اعتماد ${attendees.length} حاضرًا وإضافة دورة "${selectedCourse.courseName}" إلى ملفاتهم. هل تريد المتابعة؟`
    );

    if (!confirmed) return;

    if (registrations.length > 240) {
      alert("عدد المسجلين كبير جدًا لاعتماده دفعة واحدة. قسّم العملية إلى أكثر من دورة.");
      return;
    }

    try {
      setFinalizing(true);

      const batch = writeBatch(db);

      registrations.forEach((registration) => {
        const registrationReference = doc(
          db,
          "courseRegistrations",
          registration.id
        );

        batch.update(registrationReference, {
          status: registration.attended ? "completed" : "absent",
          finalizedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (registration.attended) {
          const employeeReference = doc(db, "employees", registration.employeeId);

          batch.update(employeeReference, {
            courses: arrayUnion(selectedCourse.courseName),
            updatedAt: serverTimestamp(),
          });
        }
      });

      batch.update(doc(db, "courseSessions", selectedCourse.id), {
        status: "completed",
        registrationOpen: false,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const notificationReference = doc(collection(db, "notifications"));

      batch.set(notificationReference, {
        type: "course_completed",
        audience: "leadership",
        title: `اعتماد حضور دورة ${selectedCourse.courseName}`,
        message:
          attendeeNames.length > 0
            ? `تم اعتماد حضور: ${attendeeNames.join("، ")}`
            : "تم إنهاء الدورة دون تسجيل حضور لأي موظف.",
        courseId: selectedCourse.id,
        courseName: selectedCourse.courseName,
        attendeeNames,
        attendeeCount: attendeeNames.length,
        readBy: [],
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      await addActivity(
        `اعتماد حضور دورة ${selectedCourse.courseName} لعدد ${attendeeNames.length} موظف`
      );

      alert("تم اعتماد الحضور وإضافة الدورة للموظفين الحاضرين.");
    } catch (error) {
      console.error("تعذر اعتماد الدورة:", error);
      alert("حدث خطأ أثناء اعتماد الحضور.");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <PermissionGuard permission="courses">
      <main className="space-y-8" dir="rtl">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">
              إدارة الدورات والتسجيل
            </h1>

            <p className="mt-2 text-zinc-400">
              أنشئ الدورة، افتح التسجيل، تابع المسجلين، ثم اعتمد الحضور.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-400">
            {courses.length} دورة
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {editingId ? "تعديل الدورة" : "إنشاء دورة جديدة"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                الدورات المفتوحة ستظهر تلقائيًا في نموذج التسجيل العام.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-zinc-300 transition hover:bg-white/5"
              >
                <X size={18} />
                إلغاء التعديل
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                اسم الدورة
              </span>

              <select
                value={form.courseName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    courseName: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              >
                <option value="">اختر الدورة</option>

                {CORE_COURSES.map((courseName) => (
                  <option key={courseName} value={courseName}>
                    {courseName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                موعد الدورة
              </span>

              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startsAt: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                موعد إغلاق التسجيل
              </span>

              <input
                type="datetime-local"
                value={form.registrationEndsAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    registrationEndsAt: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-bold text-zinc-300">
                وصف الدورة
              </span>

              <input
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="مثال: دورة إلزامية للمستوى الرابع فما فوق"
                className="w-full rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 text-white outline-none transition focus:border-yellow-500"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-black text-white">المستويات المسموحة</h3>

              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    allowedLevels:
                      current.allowedLevels.length === ALL_LEVELS.length
                        ? []
                        : [...ALL_LEVELS],
                  }))
                }
                className="text-sm font-bold text-yellow-400"
              >
                {form.allowedLevels.length === ALL_LEVELS.length
                  ? "إلغاء تحديد الكل"
                  : "تحديد الكل"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {ALL_LEVELS.map((level) => {
                const selected = form.allowedLevels.includes(level);

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleLevel(level)}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 font-black transition ${
                      selected
                        ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                        : "border-white/10 bg-white/5 text-zinc-500"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-black text-white">فئات الموظفين المسموحة</h3>

            <div className="mt-4 flex flex-wrap gap-3">
              {EMPLOYEE_TYPES.map((employeeType) => {
                const selected = form.allowedEmployeeTypes.includes(
                  employeeType.value
                );

                return (
                  <button
                    key={employeeType.value}
                    type="button"
                    onClick={() => toggleEmployeeType(employeeType.value)}
                    className={`rounded-xl border px-4 py-3 font-bold transition ${
                      selected
                        ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                        : "border-white/10 bg-white/5 text-zinc-500"
                    }`}
                  >
                    {employeeType.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-6 flex w-fit cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
            <input
              type="checkbox"
              checked={form.registrationOpen}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  registrationOpen: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-yellow-500"
            />

            <span className="font-bold text-white">فتح التسجيل مباشرة</span>
          </label>

          <button
            type="button"
            onClick={saveCourse}
            disabled={saving}
            className="mt-7 flex items-center gap-2 rounded-2xl bg-yellow-500 px-7 py-4 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : editingId ? (
              <Save size={20} />
            ) : (
              <Plus size={20} />
            )}

            {saving
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "إنشاء الدورة"}
          </button>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white">الدورات</h2>

            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Eye size={17} />
              اختر دورة لعرض المسجلين
            </div>
          </div>

          {loadingCourses ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              جارٍ تحميل الدورات...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              لا توجد دورات حتى الآن.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const status = getStatusData(course.status);
                const selected = selectedCourseId === course.id;

                return (
                  <article
                    key={course.id}
                    className={`rounded-3xl border p-6 backdrop-blur-xl transition ${
                      selected
                        ? "border-yellow-500/40 bg-yellow-500/[0.07]"
                        : "border-white/10 bg-[#141414]/90"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className="w-full text-right"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black text-yellow-400">
                            {course.courseName}
                          </h3>

                          <div className="mt-5 space-y-3 text-zinc-300">
                            <div className="flex items-center gap-3">
                              <CalendarDays size={19} className="text-yellow-400" />
                              {formatDateTime(course.startsAt)}
                            </div>

                            <div className="flex items-center gap-3">
                              <Clock3 size={19} className="text-yellow-400" />
                              إغلاق التسجيل: {formatDateTime(course.registrationEndsAt)}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {course.description && (
                        <p className="mt-5 rounded-2xl bg-white/5 p-4 leading-7 text-zinc-400">
                          {course.description}
                        </p>
                      )}
                    </button>

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() => startEditing(course)}
                        disabled={course.status === "completed"}
                        className="flex items-center gap-2 rounded-xl bg-blue-600/15 px-4 py-2 font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Pencil size={17} />
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleRegistration(course)}
                        disabled={course.status === "completed"}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          course.registrationOpen
                            ? "bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white"
                            : "bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-black"
                        }`}
                      >
                        {course.registrationOpen ? (
                          <Lock size={17} />
                        ) : (
                          <Unlock size={17} />
                        )}
                        {course.registrationOpen ? "إغلاق التسجيل" : "فتح التسجيل"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeCourse(course)}
                        disabled={course.status === "completed"}
                        className="flex items-center gap-2 rounded-xl bg-red-600/15 px-4 py-2 font-bold text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={17} />
                        حذف
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#141414]/90 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
                  <Users size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">
                    المسجلون في الدورة
                  </h2>

                  <p className="mt-1 text-zinc-500">
                    {selectedCourse?.courseName ?? "اختر دورة من الأعلى"}
                  </p>
                </div>
              </div>
            </div>

            {selectedCourse && (
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-300">
                  المسجلون: {registrations.length}
                </div>

                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-400">
                  الحضور: {attendanceCount}
                </div>
              </div>
            )}
          </div>

          {!selectedCourse ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              اختر دورة لعرض المسجلين.
            </div>
          ) : loadingRegistrations ? (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-white/10 p-10 text-zinc-400">
              <Loader2 size={22} className="animate-spin text-yellow-400" />
              جارٍ تحميل المسجلين...
            </div>
          ) : registrations.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              لا يوجد موظفون مسجلون في هذه الدورة حتى الآن.
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[850px] text-right">
                <thead className="bg-white/5 text-sm text-zinc-400">
                  <tr>
                    <th className="p-4">الموظف</th>
                    <th className="p-4">الكود</th>
                    <th className="p-4">المستوى</th>
                    <th className="p-4">الفئة</th>
                    <th className="p-4">Discord ID</th>
                    <th className="p-4">الحضور</th>
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="border-t border-white/10 text-zinc-300"
                    >
                      <td className="p-4 font-black text-white">
                        {registration.employeeName}
                      </td>

                      <td className="p-4 text-yellow-400">
                        {registration.employeeCode || "—"}
                      </td>

                      <td className="p-4">{registration.employeeLevel}</td>

                      <td className="p-4">
                        {getEmployeeTypeLabel(registration.employeeType)}
                      </td>

                      <td className="p-4 font-mono text-sm">
                        {registration.discordId}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => toggleAttendance(registration)}
                          disabled={selectedCourse.status === "completed"}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            registration.attended
                              ? "border-green-500/30 bg-green-500/15 text-green-400"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:border-yellow-500/30 hover:text-yellow-400"
                          }`}
                        >
                          {registration.attended ? (
                            <>
                              <Check size={17} />
                              حاضر
                            </>
                          ) : (
                            <>
                              <UserX size={17} />
                              لم يحضر
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedCourse && (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <div className="flex items-start gap-3 text-sm leading-7 text-zinc-500">
                <BookOpenCheck size={20} className="mt-1 shrink-0 text-yellow-400" />
                بعد تحديد الحضور اضغط اعتماد الدورة، وستضاف الدورة تلقائيًا لملف كل حاضر.
              </div>

              <button
                type="button"
                onClick={finalizeCourse}
                disabled={
                  finalizing ||
                  selectedCourse.status === "completed" ||
                  loadingRegistrations
                }
                className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {finalizing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : selectedCourse.status === "completed" ? (
                  <Award size={20} />
                ) : (
                  <UserCheck size={20} />
                )}

                {finalizing
                  ? "جارٍ الاعتماد..."
                  : selectedCourse.status === "completed"
                    ? "تم اعتماد الدورة"
                    : "اعتماد الحضور وإنهاء الدورة"}
              </button>
            </div>
          )}
        </section>
      </main>
    </PermissionGuard>
  );
}