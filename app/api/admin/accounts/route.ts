import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebaseAdmin";

type AccountRole =
  | "owner"
  | "leader"
  | "supervisor"
  | "visitor";

class ApiError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status = 400,
    code = "account_error"
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getBearerToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization") ?? "";

  if (
    !authorization.startsWith("Bearer ")
  ) {
    return "";
  }

  return authorization
    .slice("Bearer ".length)
    .trim();
}

async function requireOwner(
  request: NextRequest
) {
  const token = getBearerToken(request);

  if (!token) {
    throw new ApiError(
      "يجب تسجيل الدخول.",
      401,
      "unauthenticated"
    );
  }

  const db = getAdminDb();
  const adminAuth = getAuth();

  let decodedToken;

  try {
    decodedToken =
      await adminAuth.verifyIdToken(token);
  } catch {
    throw new ApiError(
      "انتهت جلسة تسجيل الدخول. سجل الدخول من جديد.",
      401,
      "invalid_token"
    );
  }

  const userDocument = await db
    .collection("users")
    .doc(decodedToken.uid)
    .get();

  const role = cleanText(
    userDocument.data()?.role
  );

  if (role !== "owner") {
    throw new ApiError(
      "هذه الصفحة متاحة للمالك فقط.",
      403,
      "owner_only"
    );
  }

  return {
    db,
    adminAuth,
    ownerUid: decodedToken.uid,
  };
}

function getRoleLabel(
  role: AccountRole
) {
  if (role === "owner") {
    return "المالك";
  }

  if (role === "leader") {
    return "القيادة";
  }

  if (role === "supervisor") {
    return "المشرف";
  }

  return "زائر";
}

export async function GET(
  request: NextRequest
) {
  try {
    const {
      db,
      adminAuth,
    } = await requireOwner(request);

    const [
      authUsersResult,
      userDocumentsSnapshot,
    ] = await Promise.all([
      adminAuth.listUsers(1000),
      db.collection("users").get(),
    ]);

    const userDocuments = new Map(
      userDocumentsSnapshot.docs.map(
        (userDocument) => [
          userDocument.id,
          userDocument.data(),
        ]
      )
    );

    const accounts =
      authUsersResult.users
        .map((authUser) => {
          const userData =
            userDocuments.get(authUser.uid) ??
            {};

          const rawRole =
            cleanText(userData.role);

          const role: AccountRole =
            rawRole === "owner" ||
            rawRole === "leader" ||
            rawRole === "supervisor" ||
            rawRole === "visitor"
              ? rawRole
              : "visitor";

          return {
            uid: authUser.uid,
            email: authUser.email ?? "",
            displayName:
              cleanText(
                userData.name ??
                  authUser.displayName
              ) || "حساب دون اسم",
            role,
            roleLabel:
              getRoleLabel(role),
            disabled:
              authUser.disabled === true,
            lastSignInAt:
              authUser.metadata
                .lastSignInTime ??
              null,
            createdAt:
              authUser.metadata
                .creationTime ??
              null,
          };
        })
        .sort((first, second) => {
          const roleOrder: Record<
            AccountRole,
            number
          > = {
            owner: 1,
            leader: 2,
            supervisor: 3,
            visitor: 4,
          };

          const roleDifference =
            roleOrder[first.role] -
            roleOrder[second.role];

          if (roleDifference !== 0) {
            return roleDifference;
          }

          return first.displayName.localeCompare(
            second.displayName,
            "ar"
          );
        });

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "تعذر تحميل حسابات الدخول:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تحميل حسابات الدخول.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const {
      db,
      adminAuth,
      ownerUid,
    } = await requireOwner(request);

    const body = await request
      .json()
      .catch(() => null);

    if (
      !body ||
      typeof body !== "object"
    ) {
      throw new ApiError(
        "بيانات الطلب غير صحيحة."
      );
    }

    const uid = cleanText(body.uid);
    const password = cleanText(
      body.password
    );

    if (!uid) {
      throw new ApiError(
        "اختر الحساب المطلوب."
      );
    }

    if (
      password.length < 8 ||
      password.length > 128
    ) {
      throw new ApiError(
        "كلمة المرور يجب أن تكون من 8 إلى 128 خانة."
      );
    }

    if (
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      throw new ApiError(
        "كلمة المرور يجب أن تحتوي على حرف ورقم على الأقل."
      );
    }

    let targetUser;

    try {
      targetUser =
        await adminAuth.getUser(uid);
    } catch {
      throw new ApiError(
        "حساب الدخول غير موجود.",
        404,
        "user_not_found"
      );
    }

    await adminAuth.updateUser(uid, {
      password,
    });

    await adminAuth.revokeRefreshTokens(
      uid
    );

    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          passwordUpdatedAt:
            FieldValue.serverTimestamp(),
          passwordUpdatedBy:
            ownerUid,
        },
        {
          merge: true,
        }
      );

    return NextResponse.json({
      success: true,
      message: `تم تغيير كلمة مرور ${
        targetUser.email ??
        "الحساب"
      } بنجاح.`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "تعذر تغيير كلمة المرور:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ أثناء تغيير كلمة المرور.",
      },
      {
        status: 500,
      }
    );
  }
}