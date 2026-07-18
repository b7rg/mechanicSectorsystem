"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AlertTriangle,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  UserPlus,
  UserX,
  Wrench,
  XCircle,
} from "lucide-react";

import { db } from "@/lib/firebase";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Statistics from "@/components/landing/Statistics";
import Courses from "@/components/landing/Courses";
import Announcements from "@/components/landing/Announcements";
import Footer from "@/components/landing/Footer";

type RecruitmentStatus =
  | "open"
  | "closed"
  | "paused";

type SiteSettings = {
  sectorName: string;
  englishName: string;
  description: string;
  discordUrl: string;
  supportContact: string;
  footerText: string;

  recruitmentStatus: RecruitmentStatus;

  showAnnouncements: boolean;
  showCourses: boolean;
  showCalendar: boolean;
  maintenanceMode: boolean;
};

type OpenCourse = {
  id: string;
  courseName: string;
  description: string;
  status: string;
  registrationOpen: boolean;
  allowedLevels: number[];
  allowedEmployeeTypes: string[];
  startsAt: string | null;
  registrationEndsAt: string | null;
};

type CoursesResponse = {
  success: boolean;
  courses?: OpenCourse[];
  message?: string;
};

type RegistrationResponse = {
  success: boolean;
  message?: string;
  code?: string;
};

const defaultSettings: SiteSettings = {
  sectorName: "قطاع الميكانيك",
  englishName: "Mechanic Sector",

  description:
    "النظام الرسمي لإدارة قطاع الميكانيك في Thrones.",

  discordUrl: "",
  supportContact: "",

  footerText:
    "جميع الحقوق محفوظة لقطاع الميكانيك.",

  recruitmentStatus: "closed",

  showAnnouncements: true,
  showCourses: true,
  showCalendar: true,
  maintenanceMode: false,
};

function RecruitmentStatusCard({
  status,
}: {
  status: RecruitmentStatus;
}) {
  const statusData = {
    open: {
      title: "التوظيف متاح",

      description:
        "يتم استقبال طلبات التوظيف حاليًا في قطاع الميكانيك.",

      icon: UserPlus,

      containerClass:
        "border-green-500/20 bg-green-500/[0.06]",

      iconClass:
        "bg-green-500/10 text-green-400",

      titleClass:
        "text-green-400",

      badgeClass:
        "border-green-500/20 bg-green-500/10 text-green-400",
    },

    paused: {
      title: "التوظيف متوقف مؤقتًا",

      description:
        "تم إيقاف استقبال طلبات التوظيف مؤقتًا.",

      icon: Clock3,

      containerClass:
        "border-yellow-500/20 bg-yellow-500/[0.06]",

      iconClass:
        "bg-yellow-500/10 text-yellow-400",

      titleClass:
        "text-yellow-400",

      badgeClass:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    },

    closed: {
      title: "التوظيف مغلق",

      description:
        "لا يتم استقبال طلبات توظيف جديدة حاليًا.",

      icon: UserX,

      containerClass:
        "border-red-500/20 bg-red-500/[0.06]",

      iconClass:
        "bg-red-500/10 text-red-400",

      titleClass:
        "text-red-400",

      badgeClass:
        "border-red-500/20 bg-red-500/10 text-red-400",
    },
  } as const;

  const currentStatus =
    statusData[status];

  const Icon =
    currentStatus.icon;

  return (
    <section
      dir="rtl"
      className="relative z-20 mx-auto -mt-10 w-[min(92%,1100px)] px-4"
    >
      <div
        className={`flex flex-col gap-5 rounded-[28px] border p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between md:p-6 ${currentStatus.containerClass}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${currentStatus.iconClass}`}
          >
            <Icon size={27} />
          </div>

          <div>
            <h2
              className={`text-xl font-black ${currentStatus.titleClass}`}
            >
              {currentStatus.title}
            </h2>

            <p className="mt-2 leading-7 text-zinc-400">
              {currentStatus.description}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full border px-4 py-2 text-sm font-black ${currentStatus.badgeClass}`}
        >
          {status === "open"
            ? "متاح الآن"
            : status === "paused"
              ? "متوقف مؤقتًا"
              : "غير متاح"}
        </span>
      </div>
    </section>
  );
}

function formatCourseDate(
  value: string | null
) {
  if (!value) {
    return "سيتم تحديد الموعد لاحقًا";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "سيتم تحديد الموعد لاحقًا";
  }

  return new Intl.DateTimeFormat(
    "ar-SA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function getEmployeeTypeLabel(
  type: string
) {
  if (type === "main") {
    return "الأساسي G";
  }

  if (type === "certified") {
    return "المعتمد C";
  }

  if (
    type === "certified_leader"
  ) {
    return "قيادة المعتمد CA";
  }

  return type;
}

function CourseRegistrationSection() {
  const [
    courses,
    setCourses,
  ] = useState<OpenCourse[]>([]);

  const [
    loadingCourses,
    setLoadingCourses,
  ] = useState(true);

  const [
    coursesError,
    setCoursesError,
  ] = useState("");

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState("");

  const [
    employeeName,
    setEmployeeName,
  ] = useState("");

  const [
    discordId,
    setDiscordId,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    resultMessage,
    setResultMessage,
  ] = useState("");

  const [
    resultType,
    setResultType,
  ] = useState<
    "success" | "error" | null
  >(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setCoursesError("");

        const response =
          await fetch(
            "/api/course-registration",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          (await response
            .json()
            .catch(() => null)) as
            | CoursesResponse
            | null;

        if (!response.ok) {
          throw new Error(
            data?.message ??
              "تعذر تحميل الدورات المفتوحة."
          );
        }

        const loadedCourses =
          Array.isArray(
            data?.courses
          )
            ? data.courses
            : [];

        if (!active) {
          return;
        }

        setCourses(
          loadedCourses
        );

        setSelectedCourseId(
          loadedCourses[0]?.id ??
            ""
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setCourses([]);
        setSelectedCourseId("");

        setCoursesError(
          error instanceof Error
            ? error.message
            : "تعذر تحميل الدورات المفتوحة."
        );
      } finally {
        if (active) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const selectedCourse =
    courses.find(
      (course) =>
        course.id ===
        selectedCourseId
    ) ?? null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setResultMessage("");
    setResultType(null);

    const cleanName =
      employeeName.trim();

    const cleanDiscordId =
      discordId.trim();

    if (
      !selectedCourseId
    ) {
      setResultType("error");

      setResultMessage(
        "اختاري الدورة المطلوبة."
      );

      return;
    }

    if (
      cleanName.length < 2
    ) {
      setResultType("error");

      setResultMessage(
        "اكتبي اسمك المسجل في القطاع."
      );

      return;
    }

    if (
      !/^\d{15,22}$/.test(
        cleanDiscordId
      )
    ) {
      setResultType("error");

      setResultMessage(
        "اكتبي Discord ID بشكل صحيح."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response =
        await fetch(
          "/api/course-registration",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              courseId:
                selectedCourseId,

              name: cleanName,

              discordId:
                cleanDiscordId,
            }),
          }
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | RegistrationResponse
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "تعذر إكمال التسجيل."
        );
      }

      setResultType("success");

      setResultMessage(
        data?.message ??
          "تم تسجيل طلب حضورك بنجاح."
      );

      setEmployeeName("");
      setDiscordId("");
    } catch (error) {
      setResultType("error");

      setResultMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء التسجيل."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="course-registration"
      dir="rtl"
      className="relative overflow-hidden bg-[#090909] px-5 py-24 text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[10%] top-[15%] h-72 w-72 rounded-full bg-yellow-500/[0.08] blur-[140px]" />

        <div className="absolute bottom-0 left-[8%] h-80 w-80 rounded-full bg-amber-700/[0.08] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-black text-yellow-400">
            <BookOpenCheck size={18} />
            التسجيل في الدورات
          </div>

          <h2 className="mt-6 text-3xl font-black md:text-5xl">
            سجل حضورك في الدورة
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-zinc-400">
            أدخل اسمك وDiscord ID المسجلين
            في القطاع، وسيتم التحقق من
            مستواك والدورات الحاصل عليها
            تلقائيًا.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                <CalendarDays size={23} />
              </div>

              <div>
                <h3 className="text-xl font-black">
                  الدورة المختارة
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  تفاصيل الدورة المتاحة
                </p>
              </div>
            </div>

            {loadingCourses ? (
              <div className="mt-8 flex min-h-52 flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-center">
                <Loader2
                  size={34}
                  className="animate-spin text-yellow-400"
                />

                <p className="mt-4 font-bold text-zinc-400">
                  جارٍ تحميل الدورات...
                </p>
              </div>
            ) : coursesError ? (
              <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-6 text-center">
                <XCircle
                  size={34}
                  className="mx-auto text-red-400"
                />

                <p className="mt-4 font-bold text-red-300">
                  {coursesError}
                </p>
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-7 text-center">
                <Clock3
                  size={35}
                  className="mx-auto text-zinc-500"
                />

                <h4 className="mt-4 text-lg font-black">
                  لا توجد دورات مفتوحة
                </h4>

                <p className="mt-2 leading-7 text-zinc-500">
                  لا يوجد تسجيل متاح
                  في الوقت الحالي.
                </p>
              </div>
            ) : selectedCourse ? (
              <div className="mt-8">
                <h4 className="text-2xl font-black text-yellow-400">
                  {selectedCourse.courseName}
                </h4>

                {selectedCourse.description && (
                  <p className="mt-4 leading-8 text-zinc-400">
                    {selectedCourse.description}
                  </p>
                )}

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold text-zinc-500">
                      موعد الدورة
                    </p>

                    <p className="mt-2 font-black text-zinc-200">
                      {formatCourseDate(
                        selectedCourse.startsAt
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold text-zinc-500">
                      المستويات المسموحة
                    </p>

                    <p className="mt-2 font-black text-zinc-200">
                      {selectedCourse
                        .allowedLevels
                        .length > 0
                        ? selectedCourse.allowedLevels.join(
                            "، "
                          )
                        : "جميع المستويات"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold text-zinc-500">
                      الفئات المسموحة
                    </p>

                    <p className="mt-2 font-black text-zinc-200">
                      {selectedCourse
                        .allowedEmployeeTypes
                        .length > 0
                        ? selectedCourse.allowedEmployeeTypes
                            .map(
                              getEmployeeTypeLabel
                            )
                            .join("، ")
                        : "جميع الفئات"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-yellow-500/15 bg-gradient-to-b from-yellow-500/[0.07] to-white/[0.025] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
          >
            <h3 className="text-2xl font-black">
              بيانات التسجيل
            </h3>

            <p className="mt-3 leading-7 text-zinc-400">
              يجب أن تكون البيانات مطابقة
              للبيانات المسجلة في النظام.
            </p>

            <div className="mt-8 space-y-6">
              <label className="block">
                <span className="mb-3 block text-sm font-black text-zinc-300">
                  الدورة المطلوبة
                </span>

                <select
                  value={
                    selectedCourseId
                  }
                  onChange={(event) => {
                    setSelectedCourseId(
                      event.target.value
                    );

                    setResultMessage("");
                    setResultType(null);
                  }}
                  disabled={
                    loadingCourses ||
                    courses.length === 0
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#111111] px-4 font-bold text-white outline-none transition focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {courses.length === 0 ? (
                    <option value="">
                      لا توجد دورات متاحة
                    </option>
                  ) : (
                    courses.map(
                      (course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.courseName}
                        </option>
                      )
                    )
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-3 block text-sm font-black text-zinc-300">
                  اسم الموظف
                </span>

                <input
                  type="text"
                  value={employeeName}
                  onChange={(event) => {
                    setEmployeeName(
                      event.target.value
                    );

                    setResultMessage("");
                    setResultType(null);
                  }}
                  placeholder="اكتب اسمك المسجل في القطاع"
                  autoComplete="name"
                  maxLength={80}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10"
                />
              </label>

              <label className="block">
                <span className="mb-3 block text-sm font-black text-zinc-300">
                  Discord ID
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={discordId}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setDiscordId(value);
                    setResultMessage("");
                    setResultType(null);
                  }}
                  placeholder="مثال: 123456789012345678"
                  autoComplete="off"
                  maxLength={22}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-left font-bold tracking-wide text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10"
                />
              </label>

              {resultMessage && (
                <div
                  className={
                    resultType === "success"
                      ? "flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.07] p-4 text-green-300"
                      : "flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4 text-red-300"
                  }
                >
                  {resultType ===
                  "success" ? (
                    <CheckCircle2
                      size={22}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <XCircle
                      size={22}
                      className="mt-0.5 shrink-0"
                    />
                  )}

                  <p className="font-bold leading-7">
                    {resultMessage}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingCourses ||
                  courses.length === 0
                }
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-yellow-400 px-5 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={21}
                      className="animate-spin"
                    />

                    جارٍ التحقق والتسجيل...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    تسجيل الحضور
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function LoadingPage() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#080808] text-white"
    >
      <div className="text-center">
        <Loader2
          size={45}
          className="mx-auto animate-spin text-yellow-400"
        />

        <p className="mt-5 font-bold text-zinc-400">
          جارٍ تحميل الموقع...
        </p>
      </div>
    </main>
  );
}

function MaintenancePage({
  sectorName,
}: {
  sectorName: string;
}) {
  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-5 text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-yellow-500/10 blur-[130px]" />

        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-yellow-700/10 blur-[150px]" />
      </div>

      <section className="relative z-10 w-full max-w-2xl rounded-[36px] border border-yellow-500/20 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-yellow-500/20 bg-yellow-500/10">
          <Wrench
            size={38}
            className="text-yellow-400"
          />
        </div>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-black text-yellow-400">
          <AlertTriangle size={17} />
          وضع الصيانة
        </div>

        <h1 className="mt-7 text-4xl font-black md:text-5xl">
          الموقع تحت الصيانة
        </h1>

        <p className="mx-auto mt-5 max-w-xl leading-8 text-zinc-400">
          يتم إجراء بعض التحديثات
          على موقع{" "}
          <span className="font-bold text-yellow-400">
            {sectorName}
          </span>
          . سيتم فتح الموقع مجددًا
          بعد اكتمال التحديثات.
        </p>
      </section>
    </main>
  );
}

export default function Home() {
  const [
    settings,
    setSettings,
  ] = useState<SiteSettings>(
    defaultSettings
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const settingsReference =
      doc(
        db,
        "settings",
        "site"
      );

    const unsubscribe =
      onSnapshot(
        settingsReference,

        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            const data =
              snapshot.data() as Partial<SiteSettings>;

            setSettings({
              ...defaultSettings,
              ...data,
            });
          } else {
            setSettings(
              defaultSettings
            );
          }

          setLoading(false);
        },

        (error) => {
          console.error(
            "تعذر تحميل إعدادات الموقع:",
            error
          );

          setSettings(
            defaultSettings
          );

          setLoading(false);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (
    settings.maintenanceMode
  ) {
    return (
      <MaintenancePage
        sectorName={
          settings.sectorName
        }
      />
    );
  }

  return (
    <>
      <Navbar />

      <Hero
        sectorName={
          settings.sectorName
        }
        englishName={
          settings.englishName
        }
        description={
          settings.description
        }
        discordUrl={
          settings.discordUrl
        }
      />

      <RecruitmentStatusCard
        status={
          settings.recruitmentStatus
        }
      />

      <About />

      <Statistics />

      {settings.showCourses && (
        <>
          <Courses />
          <CourseRegistrationSection />
        </>
      )}

      {settings.showAnnouncements && (
        <Announcements />
      )}

      <Footer />
    </>
  );
}