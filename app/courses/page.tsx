"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  GraduationCap,
  Info,
} from "lucide-react";

import { db } from "@/lib/firebase";

type CourseSchedule = {
  id: string;
  name: string;
  day: string;
  time: string;
  notes?: string;
  active?: boolean;
  createdAt?: {
    toDate?: () => Date;
  };
};

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesQuery = query(
      collection(db, "courseSchedule"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      coursesQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((courseDoc) => ({
            id: courseDoc.id,
            ...(courseDoc.data() as Omit<CourseSchedule, "id">),
          }))
          .filter((course) => course.active !== false);

        setCourses(data);
        setLoading(false);
      },
      (error) => {
        console.error("تعذر تحميل جدول الدورات:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] px-6 py-12 text-white">
      {/* إضاءات الخلفية */}
      <div className="pointer-events-none fixed right-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[160px]" />

      <div className="pointer-events-none fixed bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-yellow-500/5 blur-[180px]" />

      <div className="relative mx-auto max-w-7xl space-y-10">
        {/* الرجوع */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-zinc-300 backdrop-blur-xl transition hover:border-yellow-500/30 hover:text-yellow-400"
        >
          <ArrowRight size={19} />
          الرجوع للرئيسية
        </Link>

        {/* رأس الصفحة */}
        <header className="relative overflow-hidden rounded-[36px] border border-yellow-500/20 bg-white/5 p-8 backdrop-blur-2xl md:p-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-500/10 blur-[110px]" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-yellow-500/25 bg-yellow-500/10">
              <GraduationCap
                size={40}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="font-bold tracking-wide text-yellow-400">
                MECHANIC SECTOR SYSTEM
              </p>

              <h1 className="mt-2 text-4xl font-black md:text-6xl">
                جدول دورات القطاع
              </h1>

              <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
                مواعيد الدورات المعتمدة داخل قطاع الميكانيك. يتم تحديث
                الجدول مباشرة من إدارة القطاع.
              </p>
            </div>
          </div>
        </header>

        {/* العداد */}
        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl">
          <div>
            <h2 className="text-xl font-black text-white">
              الدورات المتاحة
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              الدورات الظاهرة والمعتمدة حاليًا
            </p>
          </div>

          <span className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-3 text-2xl font-black text-yellow-400">
            {courses.length}
          </span>
        </div>

        {/* المحتوى */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-14 text-center text-zinc-400 backdrop-blur-xl">
            جارٍ تحميل جدول الدورات...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-14 text-center">
            <GraduationCap
              size={45}
              className="mx-auto text-zinc-600"
            />

            <h2 className="mt-5 text-2xl font-black text-zinc-300">
              لا توجد دورات معلنة حاليًا
            </h2>

            <p className="mt-3 text-zinc-500">
              ستظهر الدورات هنا فور اعتمادها من إدارة القطاع.
            </p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:border-yellow-500/30 hover:bg-white/[0.07]"
              >
                <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-yellow-500/5 blur-[90px] transition group-hover:bg-yellow-500/10" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
                      <GraduationCap
                        size={27}
                        className="text-yellow-400"
                      />
                    </div>

                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      متاحة
                    </span>
                  </div>

                  <h2 className="mt-6 text-3xl font-black text-white">
                    {course.name}
                  </h2>

                  <div className="mt-7 space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                      <CalendarDays
                        size={21}
                        className="text-yellow-400"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          اليوم
                        </p>

                        <p className="mt-1 font-bold text-zinc-200">
                          {course.day}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                      <Clock3
                        size={21}
                        className="text-yellow-400"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          الوقت
                        </p>

                        <p className="mt-1 font-bold text-zinc-200">
                          {course.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {course.notes && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-4">
                      <Info
                        size={19}
                        className="mt-1 shrink-0 text-yellow-400"
                      />

                      <p className="leading-7 text-zinc-400">
                        {course.notes}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="border-t border-white/10 pt-8 text-center text-sm text-zinc-600">
          جميع المواعيد قابلة للتعديل وفق قرارات إدارة قطاع الميكانيك.
        </footer>
      </div>
    </main>
  );
}