"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { hasPermission } from "@/lib/permissions";
import { useRouter } from "next/navigation";

export default function PermissionGuard({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      const snapshot = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!snapshot.exists()) {
        router.push("/dashboard");
        return;
      }

      const role = snapshot.data().role;

      if (!hasPermission(role, permission)) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    }

    check();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center">
        جاري التحقق...
      </div>
    );
  }

  return <>{children}</>;
}