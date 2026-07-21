import {
  BadgeCheck,
  HeartPulse,
  Shield,
  UsersRound,
} from "lucide-react";

import RoleGuard from "@/components/auth/RoleGuard";

type AgreementRow = {
  source: string;
  target: string;
};

function AgreementTable({
  title,
  description,
  icon: Icon,
  rows,
  maximum,
}: {
  title: string;
  description: string;
  icon: typeof Shield;
  rows: AgreementRow[];
  maximum: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#141414]/90">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
            <Icon size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-7 text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-right">
          <thead className="bg-white/[0.03] text-sm text-zinc-400">
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
                className="border-t border-white/5"
              >
                <td className="px-6 py-4 font-bold text-zinc-200">
                  {row.source}
                </td>

                <td className="px-6 py-4 font-bold text-yellow-400">
                  {row.target}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/10 bg-yellow-500/[0.06] px-6 py-4 text-sm font-bold text-yellow-300">
        {maximum}
      </div>
    </section>
  );
}

export default function AgreementPage() {
  return (
    <RoleGuard
      allow={[
        "owner",
        "leader",
        "supervisor",
      ]}
    >
      <main
        dir="rtl"
        className="mx-auto max-w-6xl space-y-8 p-4 md:p-8"
      >
        <header className="rounded-3xl border border-yellow-500/15 bg-gradient-to-l from-yellow-500/10 to-transparent p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black">
              <BadgeCheck size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">
                اتفاقية معادلة الرتب والمستويات
              </h1>

              <p className="mt-2 leading-7 text-zinc-400">
                المستويات المعتمدة عند انتقال موظفي القطاعات
                والإدارة إلى قطاع كراج الميكانيك.
              </p>
            </div>
          </div>
        </header>

        <AgreementTable
          title="اتفاقية القطاعات العسكرية"
          description="معادلة الرتب العسكرية عند الانتقال إلى كراج الميكانيك."
          icon={Shield}
          rows={[
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
          ]}
          maximum="الحد الأعلى للقطاعات العسكرية هو المستوى السادس مهما كانت الرتبة."
        />

        <AgreementTable
          title="اتفاقية الهلال الأحمر"
          description="معادلة مستويات الهلال الأحمر عند الانتقال إلى كراج الميكانيك."
          icon={HeartPulse}
          rows={[
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
          ]}
          maximum="الحد الأعلى لموظفي الهلال الأحمر هو المستوى الخامس."
        />

        <AgreementTable
          title="اتفاقية الإدارة"
          description="المستوى والرمز المعتمد حسب المسمى الإداري."
          icon={UsersRound}
          rows={[
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
          ]}
          maximum="موظف الإدارة يُعيّن مباشرة حسب مسماه، ولا يخضع لشروط الترقية أو التقارير أو الدورات."
        />
      </main>
    </RoleGuard>
  );
}