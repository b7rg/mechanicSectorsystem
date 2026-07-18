"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { hasPermission } from "@/lib/permissions";

export default function Can({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) return;

      const role = snap.data().role;

      setAllowed(hasPermission(role, permission));
    }

    load();
  }, [permission]);

  if (!allowed) return null;

  return <>{children}</>;
}