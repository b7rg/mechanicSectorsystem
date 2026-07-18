import Link from "next/link";

type Employee = {
  id: string;
  name: string;
  discordId: string;
  rank: string;
  level: number;
};

export default function EmployeeCard({
  employee,
}: {
  employee: Employee;
}) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <div className="cursor-pointer rounded-3xl border border-white/10 bg-[#141414] p-6 transition duration-300 hover:scale-[1.02] hover:border-yellow-500">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold text-white">
              {employee.name}
            </h2>

            <p className="mt-2 text-zinc-400">
              Discord ID: {employee.discordId}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-yellow-400">
              {employee.rank}
            </p>

            <p className="mt-2 text-zinc-400">
              المستوى {employee.level}
            </p>
          </div>

        </div>

      </div>
    </Link>
  );
}