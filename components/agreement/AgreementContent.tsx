import {
  Building2,
  Crown,
  Handshake,
  HeartPulse,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type AgreementRow = {
  roles: string[];
  result: string;
  note: string;
};

type AgreementTheme = {
  card: string;
  icon: string;
  title: string;
  result: string;
  badge: string;
  footer: string;
};

type AgreementSectionProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  rows: AgreementRow[];
  theme: AgreementTheme;
  footer: string;
};

const PUBLIC_SECURITY_ROWS: AgreementRow[] = [
  {
    roles: ["قائد الأمن العام", "نائب قائد الأمن العام"],
    result: "المستوى السابع",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
  {
    roles: ["مساعد قائد الأمن العام", "نائب مساعد قائد الأمن العام"],
    result: "المستوى السادس",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
];

const FACILITIES_SECURITY_ROWS: AgreementRow[] = [
  {
    roles: ["قائد أمن المنشآت", "نائب قائد أمن المنشآت"],
    result: "المستوى السابع",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
  {
    roles: ["مساعد قائد أمن المنشآت", "نائب مساعد قائد أمن المنشآت"],
    result: "المستوى السادس",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
];

const MECHANIC_ROWS: AgreementRow[] = [
  { roles: ["قائد كراج الميكانيك"], result: "رتبة مقدم", note: "في جميع القطاعات." },
  { roles: ["نائب قائد كراج الميكانيك"], result: "رتبة رائد", note: "في جميع القطاعات." },
  { roles: ["مساعد قائد كراج الميكانيك"], result: "رتبة نقيب", note: "في جميع القطاعات." },
  { roles: ["نائب مساعد قائد كراج الميكانيك"], result: "رتبة ملازم أول", note: "في جميع القطاعات." },
];

const RED_CRESCENT_ROWS: AgreementRow[] = [
  { roles: ["قائد الهلال الأحمر"], result: "رتبة مقدم", note: "في جميع القطاعات." },
  { roles: ["نائب قائد الهلال الأحمر"], result: "رتبة رائد", note: "في جميع القطاعات." },
  { roles: ["مساعد قائد الهلال الأحمر"], result: "رتبة نقيب", note: "في جميع القطاعات." },
  { roles: ["نائب مساعد قائد الهلال الأحمر"], result: "رتبة ملازم أول", note: "في جميع القطاعات." },
];

const PUBLIC_SECURITY_THEME: AgreementTheme = {
  card: "border-sky-300/20 bg-gradient-to-br from-sky-300/[0.10] via-[#12151b]/95 to-[#101010]/95",
  icon: "border-sky-300/25 bg-sky-300/10 text-sky-200",
  title: "text-sky-200",
  result: "text-sky-200",
  badge: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  footer: "border-sky-300/15 bg-sky-300/[0.07] text-sky-100",
};

const FACILITIES_SECURITY_THEME: AgreementTheme = {
  card: "border-zinc-400/20 bg-gradient-to-br from-zinc-300/[0.09] via-[#151515]/95 to-[#101010]/95",
  icon: "border-zinc-300/25 bg-zinc-300/10 text-zinc-200",
  title: "text-zinc-100",
  result: "text-zinc-100",
  badge: "border-zinc-300/20 bg-zinc-300/10 text-zinc-200",
  footer: "border-zinc-300/15 bg-zinc-300/[0.06] text-zinc-200",
};

const MECHANIC_THEME: AgreementTheme = {
  card: "border-yellow-500/25 bg-gradient-to-br from-yellow-500/[0.11] via-[#17150f]/95 to-[#101010]/95",
  icon: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  title: "text-yellow-400",
  result: "text-yellow-400",
  badge: "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
  footer: "border-yellow-500/20 bg-yellow-500/[0.07] text-yellow-200",
};

const RED_CRESCENT_THEME: AgreementTheme = {
  card: "border-red-500/25 bg-gradient-to-br from-red-500/[0.11] via-[#191010]/95 to-[#101010]/95",
  icon: "border-red-500/30 bg-red-500/10 text-red-400",
  title: "text-red-400",
  result: "text-red-400",
  badge: "border-red-500/25 bg-red-500/10 text-red-400",
  footer: "border-red-500/20 bg-red-500/[0.07] text-red-200",
};

function AgreementSection({
  title,
  subtitle,
  icon: Icon,
  rows,
  theme,
  footer,
}: AgreementSectionProps) {
  return (
    <section className={`overflow-hidden rounded-[30px] border shadow-2xl shadow-black/20 ${theme.card}`}>
      <header className="border-b border-white/10 p-6 md:p-7">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}>
            <Icon size={25} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className={`text-2xl font-black md:text-3xl ${theme.title}`}>{title}</h2>
              <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${theme.badge}`}>
                اتفاقية قيادية
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-zinc-400">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-right">
          <thead className="bg-black/25 text-sm text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-black">المسمى القيادي</th>
              <th className="px-6 py-4 font-black">المعادلة المعتمدة</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`} className="border-t border-white/[0.07] transition hover:bg-white/[0.025]">
                <td className="px-6 py-5 align-top">
                  <div className="space-y-2">
                    {row.roles.map((role) => (
                      <div key={role} className="flex items-center gap-2 font-black text-zinc-100">
                        <Crown size={16} className="shrink-0 text-zinc-500" />
                        {role}
                      </div>
                    ))}
                  </div>
                </td>

                <td className="px-6 py-5 align-top">
                  <p className={`text-lg font-black ${theme.result}`}>{row.result}</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{row.note}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className={`border-t px-6 py-4 text-sm font-bold leading-7 ${theme.footer}`}>
        {footer}
      </footer>
    </section>
  );
}

export default function AgreementContent() {
  return (
    <main dir="rtl" className="mx-auto min-h-screen w-full max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-10">
      <header className="overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-l from-yellow-500/10 via-[#141414] to-[#101010] p-7 md:p-9">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-400">
            <Handshake size={31} />
          </div>

          <div>
            <p className="text-xs font-black tracking-[0.2em] text-yellow-500">MECHANIC SECTOR AGREEMENTS</p>
            <h1 className="mt-2 text-3xl font-black text-white md:text-5xl">اتفاقية القيادات بين القطاعات</h1>
            <p className="mt-4 max-w-4xl text-sm leading-8 text-zinc-400 md:text-base">
              المعادلات المعتمدة للقيادات عند الانتقال بين الأمن العام، أمن المنشآت، الهلال الأحمر وكراج الميكانيك.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-2">
        <AgreementSection
          title="إدارة الأمن العام"
          subtitle="معادلة قيادات الأمن العام في الهلال الأحمر والميكانيك والقطاعات الميدانية."
          icon={ShieldCheck}
          rows={PUBLIC_SECURITY_ROWS}
          theme={PUBLIC_SECURITY_THEME}
          footer="قائد الأمن العام ونائبه يعادلان المستوى السابع، والمساعد ونائب المساعد يعادلان المستوى السادس."
        />

        <AgreementSection
          title="قوات أمن المنشآت"
          subtitle="معادلة قيادات أمن المنشآت في الهلال الأحمر والميكانيك والقطاعات الميدانية."
          icon={Building2}
          rows={FACILITIES_SECURITY_ROWS}
          theme={FACILITIES_SECURITY_THEME}
          footer="قائد أمن المنشآت ونائبه يعادلان المستوى السابع، والمساعد ونائب المساعد يعادلان المستوى السادس."
        />

        <AgreementSection
          title="كراج الميكانيك"
          subtitle="المعادلة العسكرية لقيادات كراج الميكانيك عند الانتقال إلى القطاعات الأخرى."
          icon={Wrench}
          rows={MECHANIC_ROWS}
          theme={MECHANIC_THEME}
          footer="تُعتمد الرتبة الموضحة لكل منصب قيادي في جميع القطاعات."
        />

        <AgreementSection
          title="الهلال الأحمر"
          subtitle="المعادلة العسكرية لقيادات الهلال الأحمر عند الانتقال إلى القطاعات الأخرى."
          icon={HeartPulse}
          rows={RED_CRESCENT_ROWS}
          theme={RED_CRESCENT_THEME}
          footer="تُعتمد الرتبة الموضحة لكل منصب قيادي في جميع القطاعات."
        />
      </div>
    </main>
  );
}
