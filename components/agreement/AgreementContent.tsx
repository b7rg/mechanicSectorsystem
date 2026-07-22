import {
  BadgeCheck,
  Building2,
  Crown,
  Handshake,
  HeartPulse,
  ShieldCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type AgreementRow = {
  source: string;
  target: string;
};

type LeadershipRow = {
  roles: string[];
  result: string;
  note: string;
};

type AgreementTheme = {
  card: string;
  glow: string;
  icon: string;
  target: string;
  footer: string;
  badge: string;
};

type AgreementTableProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  rows: AgreementRow[];
  maximum: string;
  theme: AgreementTheme;
};

type LeadershipTableProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  rows: LeadershipRow[];
  footer: string;
  theme: AgreementTheme;
};

const MILITARY_ROWS: AgreementRow[] = [
  {
    source: "رقيب",
    target: "المستوى الثالث",
  },
  {
    source: "رقيب أول",
    target: "المستوى الرابع",
  },
  {
    source: "رئيس رقباء",
    target: "المستوى الرابع",
  },
  {
    source: "ملازم",
    target: "المستوى الخامس",
  },
  {
    source: "ملازم أول",
    target: "المستوى الخامس",
  },
  {
    source: "نقيب وما فوق",
    target: "المستوى السادس",
  },
];

const RED_CRESCENT_ROWS: AgreementRow[] = [
  {
    source: "المستوى الثالث",
    target: "المستوى الثاني",
  },
  {
    source: "المستوى الرابع",
    target: "المستوى الثالث",
  },
  {
    source: "المستوى الخامس",
    target: "المستوى الرابع",
  },
  {
    source: "المستوى السادس",
    target: "المستوى الخامس",
  },
  {
    source: "المستوى السابع",
    target: "المستوى الخامس",
  },
];

const ADMINISTRATION_ROWS: AgreementRow[] = [
  {
    source: "دعم ومساعدة — S",
    target: "المستوى الثاني",
  },
  {
    source: "مشرف متدرب — M",
    target: "المستوى الثالث",
  },
  {
    source: "مشرف — M",
    target: "المستوى الرابع",
  },
  {
    source: "مشرف+ — M",
    target: "المستوى الخامس",
  },
  {
    source: "مشرف عام — F",
    target: "المستوى السادس",
  },
  {
    source: "أدمن — A",
    target: "المستوى السابع",
  },
];

const PUBLIC_SECURITY_LEADERSHIP: LeadershipRow[] = [
  {
    roles: [
      "قائد الأمن العام",
      "نائب قائد الأمن العام",
    ],
    result: "المستوى السابع",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
  {
    roles: [
      "مساعد قائد الأمن العام",
      "نائب مساعد قائد الأمن العام",
    ],
    result: "المستوى السادس",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
];

const FACILITIES_SECURITY_LEADERSHIP: LeadershipRow[] = [
  {
    roles: [
      "قائد أمن المنشآت",
      "نائب قائد أمن المنشآت",
    ],
    result: "المستوى السابع",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
  {
    roles: [
      "مساعد قائد أمن المنشآت",
      "نائب مساعد قائد أمن المنشآت",
    ],
    result: "المستوى السادس",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
];

const MECHANIC_LEADERSHIP: LeadershipRow[] = [
  {
    roles: ["قائد كراج الميكانيك"],
    result: "رتبة مقدم",
    note: "في جميع القطاعات.",
  },
  {
    roles: ["نائب قائد كراج الميكانيك"],
    result: "رتبة رائد",
    note: "في جميع القطاعات.",
  },
  {
    roles: ["مساعد قائد كراج الميكانيك"],
    result: "رتبة نقيب",
    note: "في جميع القطاعات.",
  },
  {
    roles: ["نائب مساعد قائد كراج الميكانيك"],
    result: "رتبة ملازم أول",
    note: "في جميع القطاعات.",
  },
];

const RED_CRESCENT_LEADERSHIP: LeadershipRow[] = [
  {
    roles: ["قائد الهلال الأحمر"],
    result: "رتبة مقدم",
    note: "في جميع القطاعات.",
  },
  {
    roles: ["نائب قائد الهلال الأحمر"],
    result: "رتبة رائد",
    note: "في جميع القطاعات.",
  },
  {
    roles: ["مساعد قائد الهلال الأحمر"],
    result: "رتبة نقيب",
    note: "في جميع القطاعات.",
  },
  {
    roles: ["نائب مساعد قائد الهلال الأحمر"],
    result: "رتبة ملازم أول",
    note: "في جميع القطاعات.",
  },
];

const PUBLIC_SECURITY_THEME: AgreementTheme = {
  card:
    "border-sky-300/20 bg-gradient-to-br from-sky-300/[0.10] via-[#141414]/95 to-[#141414]/95",
  glow: "bg-sky-300/10",
  icon:
    "border-sky-300/25 bg-sky-300/10 text-sky-200",
  target: "text-sky-200",
  footer:
    "border-sky-300/15 bg-sky-300/[0.08] text-sky-200",
  badge:
    "border-sky-300/20 bg-sky-300/10 text-sky-200",
};

const FACILITIES_SECURITY_THEME: AgreementTheme = {
  card:
    "border-zinc-400/20 bg-gradient-to-br from-zinc-400/[0.09] via-[#141414]/95 to-[#141414]/95",
  glow: "bg-zinc-300/10",
  icon:
    "border-zinc-300/25 bg-zinc-300/10 text-zinc-200",
  target: "text-zinc-200",
  footer:
    "border-zinc-300/15 bg-zinc-300/[0.07] text-zinc-200",
  badge:
    "border-zinc-300/20 bg-zinc-300/10 text-zinc-200",
};

const RED_CRESCENT_THEME: AgreementTheme = {
  card:
    "border-red-500/25 bg-gradient-to-br from-red-500/[0.11] via-[#141414]/95 to-[#141414]/95",
  glow: "bg-red-500/10",
  icon:
    "border-red-500/30 bg-red-500/10 text-red-400",
  target: "text-red-400",
  footer:
    "border-red-500/20 bg-red-500/[0.08] text-red-300",
  badge:
    "border-red-500/25 bg-red-500/10 text-red-400",
};

const ADMINISTRATION_THEME: AgreementTheme = {
  card:
    "border-[#8f2948]/35 bg-gradient-to-br from-[#701b35]/20 via-[#141414]/95 to-[#141414]/95",
  glow: "bg-[#701b35]/20",
  icon:
    "border-[#a83a5d]/40 bg-[#701b35]/25 text-[#f0a0b8]",
  target: "text-[#f0a0b8]",
  footer:
    "border-[#8f2948]/35 bg-[#701b35]/20 text-[#f0a0b8]",
  badge:
    "border-[#a83a5d]/35 bg-[#701b35]/25 text-[#f0a0b8]",
};

const MECHANIC_THEME: AgreementTheme = {
  card:
    "border-yellow-500/25 bg-gradient-to-br from-yellow-500/[0.10] via-[#141414]/95 to-[#141414]/95",
  glow: "bg-yellow-500/10",
  icon:
    "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
  target: "text-yellow-400",
  footer:
    "border-yellow-500/20 bg-yellow-500/[0.08] text-yellow-300",
  badge:
    "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
};

function AgreementTable({
  title,
  description,
  icon: Icon,
  rows,
  maximum,
  theme,
}: AgreementTableProps) {
  return (
    <section
      className={`group relative overflow-hidden rounded-[28px] border shadow-2xl shadow-black/10 ${theme.card}`}
    >
      <div
        className={`pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full blur-3xl ${theme.glow}`}
      />

      <div className="relative border-b border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}
          >
            <Icon size={24} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-white">
                {title}
              </h2>

              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-black ${theme.badge}`}
              >
                اتفاقية معتمدة
              </span>
            </div>

            <p className="mt-2 text-sm leading-7 text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[520px] text-right">
          <thead className="bg-black/20 text-sm text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-bold">
                الرتبة أو المستوى الأساسي
              </th>

              <th className="px-6 py-4 font-bold">
                المستوى في الميكانيك
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.source}-${row.target}`}
                className="border-t border-white/[0.06] transition hover:bg-white/[0.025]"
              >
                <td className="px-6 py-4 font-bold text-zinc-100">
                  {row.source}
                </td>

                <td
                  className={`px-6 py-4 font-black ${theme.target}`}
                >
                  {row.target}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`relative border-t px-6 py-4 text-sm font-black leading-7 ${theme.footer}`}
      >
        {maximum}
      </div>
    </section>
  );
}

function LeadershipTable({
  title,
  description,
  icon: Icon,
  rows,
  footer,
  theme,
}: LeadershipTableProps) {
  return (
    <section
      className={`group relative overflow-hidden rounded-[28px] border shadow-2xl shadow-black/10 ${theme.card}`}
    >
      <div
        className={`pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full blur-3xl ${theme.glow}`}
      />

      <div className="relative border-b border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}
          >
            <Icon size={24} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-white">
                {title}
              </h2>

              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-black ${theme.badge}`}
              >
                اتفاقية قيادية
              </span>
            </div>

            <p className="mt-2 text-sm leading-7 text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[620px] text-right">
          <thead className="bg-black/20 text-sm text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-bold">
                المسمى القيادي
              </th>

              <th className="px-6 py-4 font-bold">
                المعادلة المعتمدة
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${title}-${index}`}
                className="border-t border-white/[0.06] transition hover:bg-white/[0.025]"
              >
                <td className="px-6 py-4 align-top">
                  <div className="space-y-2">
                    {row.roles.map((role) => (
                      <div
                        key={role}
                        className="flex items-center gap-2 font-bold text-zinc-100"
                      >
                        <Crown
                          size={15}
                          className="shrink-0 text-zinc-500"
                        />
                        {role}
                      </div>
                    ))}
                  </div>
                </td>

                <td className="px-6 py-4 align-top">
                  <p
                    className={`font-black ${theme.target}`}
                  >
                    {row.result}
                  </p>

                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    {row.note}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`relative border-t px-6 py-4 text-sm font-black leading-7 ${theme.footer}`}
      >
        {footer}
      </div>
    </section>
  );
}

export default function AgreementContent() {
  return (
    <main
      dir="rtl"
      className="mx-auto max-w-6xl space-y-8 p-4 md:p-8"
    >
      <header className="relative overflow-hidden rounded-[30px] border border-yellow-500/15 bg-gradient-to-l from-yellow-500/10 via-[#141414] to-[#141414] p-7">
        <div className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/10">
            <BadgeCheck size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              اتفاقية معادلة الرتب والمستويات
            </h1>

            <p className="mt-2 leading-7 text-zinc-400">
              المستويات المعتمدة عند انتقال موظفي
              القطاعات والإدارة إلى قطاع كراج
              الميكانيك.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-2">
        <AgreementTable
          title="اتفاقية الأمن العام"
          description="معادلة رتب الأمن العام عند الانتقال إلى كراج الميكانيك."
          icon={ShieldCheck}
          rows={MILITARY_ROWS}
          maximum="الحد الأعلى لموظفي الأمن العام هو المستوى السادس مهما كانت الرتبة."
          theme={PUBLIC_SECURITY_THEME}
        />

        <AgreementTable
          title="اتفاقية أمن المنشآت"
          description="معادلة رتب أمن المنشآت عند الانتقال إلى كراج الميكانيك."
          icon={Building2}
          rows={MILITARY_ROWS}
          maximum="الحد الأعلى لموظفي أمن المنشآت هو المستوى السادس مهما كانت الرتبة."
          theme={FACILITIES_SECURITY_THEME}
        />

        <AgreementTable
          title="اتفاقية الهلال الأحمر"
          description="معادلة مستويات الهلال الأحمر عند الانتقال إلى كراج الميكانيك."
          icon={HeartPulse}
          rows={RED_CRESCENT_ROWS}
          maximum="الحد الأعلى لموظفي الهلال الأحمر هو المستوى الخامس."
          theme={RED_CRESCENT_THEME}
        />

        <AgreementTable
          title="اتفاقية الإدارة"
          description="المستوى والرمز المعتمد حسب المسمى الإداري."
          icon={UsersRound}
          rows={ADMINISTRATION_ROWS}
          maximum="موظف الإدارة يُعيّن مباشرة حسب مسماه، ولا يخضع لشروط الترقية أو التقارير أو الدورات."
          theme={ADMINISTRATION_THEME}
        />
      </div>

      <section className="relative overflow-hidden rounded-[30px] border border-yellow-500/15 bg-gradient-to-l from-yellow-500/10 via-[#141414] to-[#141414] p-7">
        <div className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-400">
            <Handshake size={28} />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white md:text-4xl">
              اتفاقية القيادات بين القطاعات
            </h2>

            <p className="mt-2 leading-7 text-zinc-400">
              أُضيفت هذه الاتفاقيات إلى الاتفاقيات السابقة
              دون حذفها أو تغييرها.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <LeadershipTable
          title="إدارة الأمن العام"
          description="معادلة قيادات الأمن العام في الهلال الأحمر والميكانيك والقطاعات الميدانية."
          icon={ShieldCheck}
          rows={PUBLIC_SECURITY_LEADERSHIP}
          footer="القائد ونائبه مستوى 7، والمساعد ونائب المساعد مستوى 6."
          theme={PUBLIC_SECURITY_THEME}
        />

        <LeadershipTable
          title="قوات أمن المنشآت"
          description="معادلة قيادات أمن المنشآت في الهلال الأحمر والميكانيك والقطاعات الميدانية."
          icon={Building2}
          rows={FACILITIES_SECURITY_LEADERSHIP}
          footer="القائد ونائبه مستوى 7، والمساعد ونائب المساعد مستوى 6."
          theme={FACILITIES_SECURITY_THEME}
        />

        <LeadershipTable
          title="كراج الميكانيك"
          description="المعادلة العسكرية لقيادات كراج الميكانيك في جميع القطاعات."
          icon={Wrench}
          rows={MECHANIC_LEADERSHIP}
          footer="مقدم، رائد، نقيب، وملازم أول حسب المسمى القيادي."
          theme={MECHANIC_THEME}
        />

        <LeadershipTable
          title="الهلال الأحمر"
          description="المعادلة العسكرية لقيادات الهلال الأحمر في جميع القطاعات."
          icon={HeartPulse}
          rows={RED_CRESCENT_LEADERSHIP}
          footer="مقدم، رائد، نقيب، وملازم أول حسب المسمى القيادي."
          theme={RED_CRESCENT_THEME}
        />
      </div>
    </main>
  );
}
