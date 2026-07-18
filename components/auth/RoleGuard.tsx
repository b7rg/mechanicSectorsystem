"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

type RoleGuardProps = {
  allow: string[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allow,
  children,
}: RoleGuardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        router.replace("/");
        return;
      }

      const role = snap.data().role;

      if (!allow.includes(role)) {
        router.replace("/");
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [allow, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        جارٍ التحقق...
      </div>
    );
  }

  return <>{children}</>;
}