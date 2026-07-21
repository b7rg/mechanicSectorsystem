import {
  Building2,
  HeartPulse,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

type AgreementRow = {
  from: string;
  to: string;
};

type AgreementCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    size?: number;
  }>;
  rows: AgreementRow[];
  note: string;
  theme: {
    border: string;
    bg: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    valueColor: string;
    noteBg: string;
    noteColor: string;
    headBg: string;
  };
};

const militaryRows: AgreementRow[] = [
  {
    from: "رقيب",
    to: "المستوى الثالث",
  },
  {
    from: "رقيب أول",
    to: "المستوى الرابع",
  },
  {
    from: "رئيس رقباء",
    to: "المستوى الرابع",
  },
  {
    from: "ملازم",
    to: "المستوى الخامس",
  },
  {
    from: "ملازم أول",
    to: "المستوى الخامس",
  },
  {
    from: "نقيب وما فوق",
    to: "المستوى السادس",
  },
];

const redCrescentRows: AgreementRow[] = [
  {
    from: "المستوى الثالث",
    to: "المستوى الثاني",
  },
  {
    from: "المستوى الرابع",
    to: "المستوى الثالث",
  },
  {
    from: "المستوى الخامس",
    to: "المستوى الرابع",
  },
  {
    from: "المستوى السادس",
    to: "المستوى الخامس",
  },
  {
    from: "المستوى السابع",
    to: "المستوى الخامس",
  },
];

const administrationRows: AgreementRow[] = [
  {
    from: "دعم ومساعدة — S",
    to: "المستوى الثاني",
  },
  {
    from: "مشرف متدرب — M",
    to: "المستوى الثالث",
  },
  {
    from: "مشرف — M",
    to: "المستوى الرابع",
  },
  {
    from: "مشرف+ — M",
    to: "المستوى الخامس",
  },
  {
    from: "مشرف عام — F",
    to: "المستوى السادس",
  },
  {
    from: "أدمن — A",
    to: "المستوى السابع",
  },
];

function AgreementCard({
  title,
  description,
  icon: Icon,
  rows,
  note,
  theme,
}: AgreementCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-[32px] border ${theme.border} ${theme.bg} shadow-[0_0_0_1px_rgba(255,255,255,0.02)]`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-6 md:px-8">
        <div>
          <h2
            className={`text-2xl font-black md:text-4xl ${theme.titleColor}`}
          >
            {title}
          </h2>

          <p className="mt-2 text-sm leading-7 text-zinc-400 md:text-base">
            {description}
          </p>
        </div>

        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${theme.iconBg}`}
        >
          <Icon
            size={30}
            className={theme.iconColor}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr
              className={`${theme.headBg} text-right text-sm font-black text-zinc-300`}
            >
              <th className="px-6 py-4 md:px-8">
                الرتبة أو المستوى الأساسي
              </th>
              <th className="px-6 py-4 md:px-8">
                المستوى في الميكانيك
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.from}-${index}`}
                className="border-t border-white/5"
              >
                <td className="px-6 py-5 text-base font-bold text-white md:px-8 md:text-xl">
                  {row.from}
                </td>

                <td
                  className={`px-6 py-5 text-base font-black md:px-8 md:text-xl ${theme.valueColor}`}
                >
                  {row.to}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`border-t border-white/5 px-6 py-4 text-center text-sm font-black md:px-8 md:text-base ${theme.noteBg} ${theme.noteColor}`}
      >
        {note}
      </div>
    </section>
  );
}

export default function AgreementPage() {
  return (
    <main
      dir="rtl"
      className="space-y-8"
    >
      <header className="rounded-[32px] border border-white/10 bg-[#0f0f10] px-6 py-7 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-yellow-400 md:text-5xl">
              صفحة الاتفاقيات
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-8 text-zinc-400 md:text-base">
              توضح هذه الصفحة آلية معادلة الرتب والمستويات عند انتقال
              الأفراد من الجهات الأخرى إلى قطاع كراج الميكانيك، إضافة إلى
              اتفاقية الإدارة المعتمدة.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10">
            <ShieldCheck
              size={30}
              className="text-yellow-400"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-8">
        <AgreementCard
          title="اتفاقية الأمن العام"
          description="معادلة رتب الأمن العام عند الانتقال إلى كراج الميكانيك."
          icon={Shield}
          rows={militaryRows}
          note="الحد الأعلى للأمن العام هو المستوى السادس مهما كانت الرتبة."
          theme={{
            border: "border-blue-500/20",
            bg: "bg-gradient-to-br from-[#0d1420] via-[#111214] to-[#0b0c0f]",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-300",
            titleColor: "text-blue-300",
            valueColor: "text-blue-200",
            noteBg: "bg-blue-500/10",
            noteColor: "text-blue-200",
            headBg: "bg-blue-500/5",
          }}
        />

        <AgreementCard
          title="اتفاقية أمن المنشآت"
          description="معادلة رتب أمن المنشآت عند الانتقال إلى كراج الميكانيك."
          icon={Building2}
          rows={militaryRows}
          note="الحد الأعلى لأمن المنشآت هو المستوى السادس مهما كانت الرتبة."
          theme={{
            border: "border-zinc-500/20",
            bg: "bg-gradient-to-br from-[#151515] via-[#111214] to-[#0b0c0f]",
            iconBg: "bg-zinc-400/10",
            iconColor: "text-zinc-300",
            titleColor: "text-zinc-200",
            valueColor: "text-zinc-200",
            noteBg: "bg-zinc-400/10",
            noteColor: "text-zinc-200",
            headBg: "bg-zinc-400/5",
          }}
        />

        <AgreementCard
          title="اتفاقية الهلال الأحمر"
          description="معادلة مستويات الهلال الأحمر عند الانتقال إلى كراج الميكانيك."
          icon={HeartPulse}
          rows={redCrescentRows}
          note="الحد الأعلى لموظفي الهلال الأحمر هو المستوى الخامس."
          theme={{
            border: "border-red-500/20",
            bg: "bg-gradient-to-br from-[#1a0f12] via-[#111214] to-[#0b0c0f]",
            iconBg: "bg-red-500/10",
            iconColor: "text-red-300",
            titleColor: "text-red-300",
            valueColor: "text-red-200",
            noteBg: "bg-red-500/10",
            noteColor: "text-red-200",
            headBg: "bg-red-500/5",
          }}
        />

        <AgreementCard
          title="اتفاقية الإدارة"
          description="المستوى والرمز المعتمد حسب المسمى الإداري."
          icon={Users}
          rows={administrationRows}
          note="موظف الإدارة يُعيّن مباشرة حسب مسماه، ولا يخضع لشروط الترقية أو التقارير أو الدورات."
          theme={{
            border: "border-rose-700/25",
            bg: "bg-gradient-to-br from-[#1a0d12] via-[#111214] to-[#0b0c0f]",
            iconBg: "bg-rose-700/15",
            iconColor: "text-rose-300",
            titleColor: "text-rose-300",
            valueColor: "text-rose-200",
            noteBg: "bg-rose-700/15",
            noteColor: "text-rose-200",
            headBg: "bg-rose-700/5",
          }}
        />
      </div>
    </main>
  );
}