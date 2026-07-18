import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

let adminDatabase:
  | Firestore
  | null = null;

function getRequiredEnvironmentVariable(
  name: string
) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `متغير البيئة ${name} غير موجود.`
    );
  }

  return value;
}

export function getAdminDb() {
  if (adminDatabase) {
    return adminDatabase;
  }

  const projectId =
    getRequiredEnvironmentVariable(
      "FIREBASE_ADMIN_PROJECT_ID"
    );

  const clientEmail =
    getRequiredEnvironmentVariable(
      "FIREBASE_ADMIN_CLIENT_EMAIL"
    );

  const privateKey =
    getRequiredEnvironmentVariable(
      "FIREBASE_ADMIN_PRIVATE_KEY"
    )
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n");

  const adminApp =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });

  adminDatabase =
    getFirestore(adminApp);

  return adminDatabase;
}