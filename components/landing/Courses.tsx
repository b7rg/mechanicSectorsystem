import {
  CalendarDays,
  Clock3,
  GraduationCap,
  Star,
} from "lucide-react";

const courses = [
  {
    day: "السبت",
    course: "الموجة الميداني",
    time: "10:00 مساءً",
  },
  {
    day: "الأحد",
    course: "الإشراف الميداني",
    time: "10:00 مساءً",
  },
  {
    day: "الاثنين",
    course: "شؤون التوظيف",
    time: "10:00 مساءً",
  },
  {
    day: "الثلاثاء",
    course: "الإشراف العام",
    time: "10:00 مساءً",
  },
  {
    day: "الأربعاء",
    course: "التعديل والتزويد",
    time: "10:00 مساءً",
  },
  {
    day: "الخميس",
    course: "الشؤون الإدارية",
    time: "10:00 مساءً",
  },
  {
    day: "الجمعة",
    course: "شؤون الكراج",
    time: "10:00 مساءً",
    featured: true,
  },
];

export default function Courses() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.04] blur-[130px]" />

      <div className="relative mx-auto w-[92%] max-w-7xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/15 bg-yellow-500/[0.06] px-4 py-2">
            <GraduationCap
              size={16}
              className="text-yellow-400"
            />

            <span className="text-xs font-black tracking-[0.28em] text-yellow-400">
              COURSES
            </span>
          </div>

          <h2 className="mt-5 text-4xl font-black text-white md:text-5xl">
            جدول الدورات
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
            مواعيد الدورات الأسبوعية المعتمدة
            في قطاع الميكانيك.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((item, index) => {
            const featured =
              item.featured === true;

            return (
              <article
                key={item.day}
                className={`group relative min-w-0 overflow-hidden rounded-[26px] border p-6 transition duration-300 hover:-translate-y-1 ${
                  featured
                    ? "border-yellow-500/45 bg-gradient-to-br from-yellow-500/[0.10] via-[#171717] to-[#111111] shadow-[0_18px_60px_rgba(234,179,8,0.10)]"
                    : "border-white/[0.08] bg-[#151515]/90 hover:border-yellow-500/25"
                }`}
              >
                <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-yellow-500/[0.04] blur-3xl transition group-hover:bg-yellow-500/[0.08]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border font-black ${
                        featured
                          ? "border-yellow-500/30 bg-yellow-500 text-black"
                          : "border-yellow-500/15 bg-yellow-500/[0.07] text-yellow-400"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-zinc-600">
                        اليوم
                      </p>

                      <h3 className="mt-1 text-xl font-black text-white">
                        {item.day}
                      </h3>
                    </div>
                  </div>

                  {featured && (
                    <span className="flex items-center gap-1 rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1.5 text-xs font-black text-yellow-400">
                      <Star size={13} />
                      مميز
                    </span>
                  )}
                </div>

                <div className="relative mt-7 rounded-2xl border border-white/[0.06] bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <GraduationCap
                      size={21}
                      className="shrink-0 text-yellow-400"
                    />

                    <p className="min-w-0 truncate text-lg font-black text-zinc-100">
                      {item.course}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <CalendarDays
                        size={16}
                        className="text-zinc-600"
                      />
                      دورة أسبوعية
                    </div>

                    <span className="flex shrink-0 items-center gap-2 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.07] px-3 py-2 text-sm font-black text-yellow-400">
                      <Clock3 size={15} />
                      {item.time}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}