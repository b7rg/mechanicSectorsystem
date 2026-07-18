"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

type EditEmployeeButtonProps = {
  id: string;
};

export default function EditEmployeeButton({
  id,
}: EditEmployeeButtonProps) {
  return (
    <Link
      href={`/dashboard/employees/${id}/edit`}
      className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-6 py-3 font-black text-black transition hover:scale-[1.03] hover:bg-yellow-400"
    >
      <Pencil size={19} />
      تعديل الموظف
    </Link>
  );
}