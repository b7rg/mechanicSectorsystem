"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";

import {
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { addActivity } from "@/lib/activity";

type DeleteEmployeeButtonProps = {
  id: string;
};

export default function DeleteEmployeeButton({
  id,
}: DeleteEmployeeButtonProps) {
  const router = useRouter();

  const [role, setRole] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setRole("");
            return;
          }

          try {
            const userSnapshot =
              await getDoc(
                doc(
                  db,
                  "users",
                  user.uid
                )
              );

            if (
              userSnapshot.exists()
            ) {
              setRole(
                String(
                  userSnapshot.data()
                    .role ?? ""
                )
              );
            }
          } catch (error) {
            console.error(
              "تعذر تحميل صلاحية المستخدم:",
              error
            );

            setRole("");
          }
        }
      );

    return () => unsubscribe();
  }, []);

  async function handleDelete() {
    if (deleting) {
      return;
    }

    const confirmed =
      window.confirm(
        "هل أنتِ متأكدة من حذف هذا الموظف؟ لا يمكن التراجع عن العملية."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const employeeReference =
        doc(
          db,
          "employees",
          id
        );

      const employeeSnapshot =
        await getDoc(
          employeeReference
        );

      const employeeName =
        employeeSnapshot.exists()
          ? String(
              employeeSnapshot.data()
                .name ?? "موظف"
            )
          : "موظف";

      await deleteDoc(
        employeeReference
      );

      /*
        ننتقل فورًا بعد الحذف حتى لا تبقى
        صفحة الموظف المحذوف وتظهر 404.
      */

      router.replace(
        "/dashboard/employees"
      );

      router.refresh();

      /*
        فشل تسجيل النشاط لا يلغي نجاح الحذف.
      */

      try {
        await addActivity(
          `حذف الموظف ${employeeName}`
        );
      } catch (activityError) {
        console.error(
          "تم الحذف لكن تعذر تسجيل النشاط:",
          activityError
        );
      }
    } catch (error) {
      console.error(
        "تعذر حذف الموظف:",
        error
      );

      alert(
        "حدث خطأ أثناء حذف الموظف."
      );

      setDeleting(false);
    }
  }

  if (
    role !== "owner" &&
    role !== "leader"
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting
        ? "جارٍ الحذف..."
        : "🗑️ حذف"}
    </button>
  );
}