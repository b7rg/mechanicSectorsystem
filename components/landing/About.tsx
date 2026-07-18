import {
  MapPinned,
  Radio,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import Reveal from "../shared/Reveal";

const features = [
  {
    title: "خدمة ميدانية",
    description:
      "تغطية البلاغات وتنفيذ مهام الإصلاح والتسطيح داخل المدينة.",
    icon: MapPinned,
  },
  {
    title: "تنظيم قيادي",
    description:
      "إدارة منظمة للورش والأفراد وفق الأنظمة المعتمدة بالقطاع.",
    icon: ShieldCheck,
  },
  {
    title: "موجة القطاع",
    description:
      "تنسيق الوحدات والمهام الميدانية عبر موجة الميكانيك 18.",
    icon: Radio,
  },
];

export default function About() {
  return (
    <Reveal>
      <section
        id="about"
        dir="rtl"
        className="relative overflow-hidden px-5 py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.04] blur-[150px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[36px] border border-white/[0.08] bg-gradient-to-br from-[#171717] via-[#111111] to-[#0d0d0d] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] md:p-12 lg:p-14">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/[0.06] blur-[90px]" />

            <div className="pointer-events-none absolute bottom-0 right-0 h-px w-2/3 bg-gradient-to-l from-yellow-500/60 to-transparent" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/[0.07] px-4 py-2">
                  <Wrench
                    size={15}
                    className="text-yellow-400"
                  />

                  <span className="text-xs font-black tracking-[0.25em] text-yellow-400">
                    ABOUT MSS
                  </span>
                </div>

                <h2 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
                  قطاع الميكانيك
                  <span className="mt-2 block text-yellow-400">
                    قوة ميدانية ثرونزية
                  </span>
                </h2>

                <p className="mt-7 max-w-3xl text-base leading-9 text-zinc-400 md:text-lg">
                  قطاع ثرونزي متخصص في خدمات الميكانيك، وإدارة
                  الورش، وصيانة المركبات، وتنفيذ مهام التسطيح
                  والإصلاح والتعديل والتزويد ضمن منظومة ميدانية
                  منظمة تخدم المدينة بكفاءة واحترافية.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-bold text-zinc-300">
                    صيانة وإصلاح
                  </span>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-bold text-zinc-300">
                    تعديل وتزويد
                  </span>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-bold text-zinc-300">
                    مهام ميدانية
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[32px] bg-yellow-500/[0.03] blur-2xl" />

                <div className="relative overflow-hidden rounded-[30px] border border-yellow-500/15 bg-black/25 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-600">
                        الهوية الرسمية
                      </p>

                      <p className="mt-2 text-xl font-black text-white">
                        MECHANICS SECTOR
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-400">
                      <Wrench size={26} />
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    {features.map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <div
                          key={feature.title}
                          className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition duration-300 hover:border-yellow-500/20 hover:bg-yellow-500/[0.04]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition group-hover:bg-yellow-500 group-hover:text-black">
                            <Icon size={20} />
                          </div>

                          <div>
                            <h3 className="font-black text-white">
                              {feature.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-zinc-500">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}