import {
  BadgeCheck,
  Building2,
  Crown,
  Handshake,
  HeartPulse,
  Shield,
  ShieldCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type AgreementRow = {
  source: string;
  target: string;
  note?: string;
};

type AgreementTheme = {
  card: string;
  icon: string;
  title: string;
  target: string;
  badge: string;
  footer: string;
  glow: string;
};

type AgreementCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  rows: AgreementRow[];
  footer: string;
  theme: AgreementTheme;
  firstColumnTitle: string;
  secondColumnTitle: string;
};

const THEMES = {
  publicSecurity: {
    card:
      "border-sky-300/20 bg-gradient-to-br from-sky-300/[0.10] via-[#12151b]/95 to-[#101010]/95",
    icon:
      "border-sky-300/25 bg-sky-300/10 text-sky-200",
    title: "text-sky-200",
    target: "text-sky-200",
    badge:
      "border-sky-300/20 bg-sky-300/10 text-sky-200",
    footer:
      "border-sky-300/15 bg-sky-300/[0.07] text-sky-100",
    glow: "bg-sky-300/10",
  },
  facilities: {
    card:
      "border-zinc-400/20 bg-gradient-to-br from-zinc-300/[0.09] via-[#151515]/95 to-[#101010]/95",
    icon:
      "border-zinc-300/25 bg-zinc-300/10 text-zinc-200",
    title: "text-zinc-100",
    target: "text-zinc-100",
    badge:
      "border-zinc-300/20 bg-zinc-300/10 text-zinc-200",
    footer:
      "border-zinc-300/15 bg-zinc-300/[0.06] text-zinc-200",
    glow: "bg-zinc-300/10",
  },
  mechanic: {
    card:
      "border-yellow-500/25 bg-gradient-to-br from-yellow-500/[0.11] via-[#17150f]/95 to-[#101010]/95",
    icon:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    title: "text-yellow-400",
    target: "text-yellow-400",
    badge:
      "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
    footer:
      "border-yellow-500/20 bg-yellow-500/[0.07] text-yellow-200",
    glow: "bg-yellow-500/10",
  },
  redCrescent: {
    card:
      "border-red-500/25 bg-gradient-to-br from-red-500/[0.11] via-[#191010]/95 to-[#101010]/95",
    icon:
      "border-red-500/30 bg-red-500/10 text-red-400",
    title: "text-red-400",
    target: "text-red-400",
    badge:
      "border-red-500/25 bg-red-500/10 text-red-400",
    footer:
      "border-red-500/20 bg-red-500/[0.07] text-red-200",
    glow: "bg-red-500/10",
  },
  military: {
    card:
      "border-blue-400/20 bg-gradient-to-br from-blue-400/[0.08] via-[#11141a]/95 to-[#101010]/95",
    icon:
      "border-blue-400/25 bg-blue-400/10 text-blue-300",
    title: "text-blue-300",
    target: "text-blue-300",
    badge:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    footer:
      "border-blue-400/15 bg-blue-400/[0.07] text-blue-200",
    glow: "bg-blue-400/10",
  },
  administration: {
    card:
      "border-[#8f2948]/35 bg-gradient-to-br from-[#701b35]/20 via-[#171013]/95 to-[#101010]/95",
    icon:
      "border-[#a83a5d]/40 bg-[#701b35]/25 text-[#f0a0b8]",
    title: "text-[#f0a0b8]",
    target: "text-[#f0a0b8]",
    badge:
      "border-[#a83a5d]/35 bg-[#701b35]/25 text-[#f0a0b8]",
    footer:
      "border-[#8f2948]/35 bg-[#701b35]/20 text-[#f0a0b8]",
    glow: "bg-[#701b35]/20",
  },
} satisfies Record<string, AgreementTheme>;

const LEADERSHIP_PUBLIC_SECURITY: AgreementRow[] = [
  {
    source: "قائد الأمن العام / نائب قائد الأمن العام",
    target: "المستوى السابع",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
  {
    source: "مساعد قائد الأمن العام / نائب مساعد قائد الأمن العام",
    target: "المستوى السادس",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
];

const LEADERSHIP_FACILITIES: AgreementRow[] = [
  {
    source: "قائد أمن المنشآت / نائب قائد أمن المنشآت",
    target: "المستوى السابع",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
  {
    source: "مساعد قائد أمن المنشآت / نائب مساعد قائد أمن المنشآت",
    target: "المستوى السادس",
    note: "في الهلال الأحمر والميكانيك وجميع القطاعات الميدانية.",
  },
];

const LEADERSHIP_MECHANIC: AgreementRow[] = [
  {
    source: "قائد كراج الميكانيك",
    target: "رتبة مقدم",
    note: "في جميع القطاعات.",
  },
  {
    source: "نائب قائد كراج الميكانيك",
    target: "رتبة رائد",
    note: "في جميع القطاعات.",
  },
  {
    source: "مساعد قائد كراج الميكانيك",
    target: "رتبة نقيب",
    note: "في جميع القطاعات.",
  },
  {
    source: "نائب مساعد قائد كراج الميكانيك",
    target: "رتبة ملازم أول",
    note: "في جميع القطاعات.",
  },
];

const LEADERSHIP_RED_CRESCENT: AgreementRow[] = [
  {
    source: "قائد الهلال الأحمر",
    target: "رتبة مقدم",
    note: "في جميع القطاعات.",
  },
  {
    source: "نائب قائد الهلال الأحمر",
    target: "رتبة رائد",
    note: "في جميع القطاعات.",
  },
  {
    source: "مساعد قائد الهلال الأحمر",
    target: "رتبة نقيب",
    note: "في جميع القطاعات.",
  },
  {
    source: "نائب مساعد قائد الهلال الأحمر",
    target: "رتبة ملازم أول",
    note: "في جميع القطاعات.",
  },
];

const MILITARY_RANKS: AgreementRow[] = [
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

const RED_CRESCENT_LEVELS: AgreementRow[] = [
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

const ADMINISTRATION_LEVELS: AgreementRow[] = [
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

function AgreementCard({
  title,
  description,
  icon: Icon,
  rows,
  footer,
  theme,
  firstColumnTitle,
  secondColumnTitle,
}: AgreementCardProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[30px] border shadow-2xl shadow-black/20 ${theme.card}`}
    >
      <div
        className={`pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full blur-3xl ${theme.glow}`}
      />

      <header className="relative border-b border-white/10 p-6 md:p-7">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}
          >
            <Icon size={25} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className={`text-2xl font-black md:text-3xl ${theme.title}`}
              >
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
      </header>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[620px] text-right">
          <thead className="bg-black/25 text-sm text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-black">
                {firstColumnTitle}
              </th>

              <th className="px-6 py-4 font-black">
                {secondColumnTitle}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${title}-${row.source}-${index}`}
                className="border-t border-white/[0.07] transition hover:bg-white/[0.025]"
              >
                <td className="px-6 py-5 align-top font-black text-zinc-100">
                  <div className="flex items-start gap-2">
                    <Crown
                      size={16}
                      className="mt-1 shrink-0 text-zinc-600"
                    />
                    <span>{row.source}</span>
                  </div>
                </td>

                <td className="px-6 py-5 align-top">
                  <p
                    className={`text-lg font-black ${theme.target}`}
                  >
                    {row.target}
                  </p>

                  {row.note && (
                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                      {row.note}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer
        className={`relative border-t px-6 py-4 text-sm font-bold leading-7 ${theme.footer}`}
      >
        {footer}
      </footer>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs font-black tracking-[0.18em] text-yellow-500">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-4xl text-sm leading-8 text-zinc-400 md:text-base">
        {description}
      </p>
    </div>
  );
}

export default function AgreementContent() {
  return (
    <main
      dir="rtl"
      className="mx-auto min-h-screen w-full max-w-7xl space-y-10 px-4 py-8 md:px-8 md:py-10"
    >
      <header className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-l from-yellow-500/10 via-[#141414] to-[#101010] p-7 md:p-9">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-400">
            <Handshake size={31} />
          </div>

          <div>
            <p className="text-xs font-black tracking-[0.2em] text-yellow-500">
              MECHANIC SECTOR AGREEMENTS
            </p>

            <h1 className="mt-2 text-3xl font-black text-white md:text-5xl">
              اتفاقيات معادلة الرتب والمستويات
            </h1>

            <p className="mt-4 max-w-4xl text-sm leading-8 text-zinc-400 md:text-base">
              تشمل الاتفاقيات القيادية الجديدة، إضافة إلى
              اتفاقية الرتب العسكرية، الهلال الأحمر، والإدارة
              المعتمدة سابقًا.
            </p>
          </div>
        </div>
      </header>

      <SectionHeading
        eyebrow="LEADERSHIP AGREEMENTS"
        title="أولًا: اتفاقية القيادات بين القطاعات"
        description="المعادلات المعتمدة للقيادات عند الانتقال بين الأمن العام، أمن المنشآت، الهلال الأحمر وكراج الميكانيك."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <AgreementCard
          title="إدارة الأمن العام"
          description="معادلة قيادات الأمن العام في الهلال الأحمر والميكانيك والقطاعات الميدانية."
          icon={ShieldCheck}
          rows={LEADERSHIP_PUBLIC_SECURITY}
          theme={THEMES.publicSecurity}
          footer="قائد الأمن العام ونائبه يعادلان المستوى السابع، والمساعد ونائب المساعد يعادلان المستوى السادس."
          firstColumnTitle="المسمى القيادي"
          secondColumnTitle="المعادلة المعتمدة"
        />

        <AgreementCard
          title="قوات أمن المنشآت"
          description="معادلة قيادات أمن المنشآت في الهلال الأحمر والميكانيك والقطاعات الميدانية."
          icon={Building2}
          rows={LEADERSHIP_FACILITIES}
          theme={THEMES.facilities}
          footer="قائد أمن المنشآت ونائبه يعادلان المستوى السابع، والمساعد ونائب المساعد يعادلان المستوى السادس."
          firstColumnTitle="المسمى القيادي"
          secondColumnTitle="المعادلة المعتمدة"
        />

        <AgreementCard
          title="كراج الميكانيك"
          description="المعادلة العسكرية لقيادات كراج الميكانيك عند الانتقال إلى القطاعات الأخرى."
          icon={Wrench}
          rows={LEADERSHIP_MECHANIC}
          theme={THEMES.mechanic}
          footer="تُعتمد الرتبة الموضحة لكل منصب قيادي في جميع القطاعات."
          firstColumnTitle="المسمى القيادي"
          secondColumnTitle="المعادلة المعتمدة"
        />

        <AgreementCard
          title="الهلال الأحمر"
          description="المعادلة العسكرية لقيادات الهلال الأحمر عند الانتقال إلى القطاعات الأخرى."
          icon={HeartPulse}
          rows={LEADERSHIP_RED_CRESCENT}
          theme={THEMES.redCrescent}
          footer="تُعتمد الرتبة الموضحة لكل منصب قيادي في جميع القطاعات."
          firstColumnTitle="المسمى القيادي"
          secondColumnTitle="المعادلة المعتمدة"
        />
      </div>

      <SectionHeading
        eyebrow="RANK & LEVEL AGREEMENTS"
        title="ثانيًا: الاتفاقيات السابقة للرتب والمستويات"
        description="هذه هي الاتفاقيات التي كانت موجودة قبل إضافة اتفاقية القيادات، وتمت إعادتها كاملة دون حذف."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <AgreementCard
          title="اتفاقية القطاعات العسكرية"
          description="معادلة الرتب العسكرية عند الانتقال إلى كراج الميكانيك."
          icon={Shield}
          rows={MILITARY_RANKS}
          theme={THEMES.military}
          footer="الحد الأعلى للقطاعات العسكرية هو المستوى السادس مهما كانت الرتبة."
          firstColumnTitle="الرتبة العسكرية"
          secondColumnTitle="المستوى في الميكانيك"
        />

        <AgreementCard
          title="اتفاقية الهلال الأحمر"
          description="معادلة مستويات الهلال الأحمر عند الانتقال إلى كراج الميكانيك."
          icon={HeartPulse}
          rows={RED_CRESCENT_LEVELS}
          theme={THEMES.redCrescent}
          footer="الحد الأعلى لموظفي الهلال الأحمر هو المستوى الخامس."
          firstColumnTitle="المستوى الأساسي"
          secondColumnTitle="المستوى في الميكانيك"
        />

        <AgreementCard
          title="اتفاقية الإدارة"
          description="المستوى والرمز المعتمد حسب المسمى الإداري."
          icon={UsersRound}
          rows={ADMINISTRATION_LEVELS}
          theme={THEMES.administration}
          footer="موظف الإدارة يُعيّن مباشرة حسب مسماه، ولا يخضع لشروط الترقية أو التقارير أو الدورات."
          firstColumnTitle="المسمى الإداري والرمز"
          secondColumnTitle="المستوى في الميكانيك"
        />

        <section className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[30px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.08] via-[#141414]/95 to-[#101010]/95 p-8 text-center">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-400">
              <BadgeCheck size={30} />
            </div>

            <h3 className="mt-5 text-2xl font-black text-white">
              اعتماد الاتفاقيات
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-zinc-400">
              تسري كل اتفاقية حسب الفئة والمسمى والرتبة
              الموضحة فيها، وأي حالة غير مدرجة تخضع لمراجعة
              واعتماد قيادات القطاعات المعنية.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}