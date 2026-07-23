import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed)
    ? Math.max(0, parsed)
    : 0;
}

function cleanEmployeeName(value: unknown) {
  return text(value)
    .replace(
      /\s*\[(?:G|C|CA|S|M|F|A\+?|A)-?\d+\]\s*$/i,
      ""
    )
    .trim();
}

function statusOf(
  employee: Record<string, unknown>
) {
  const raw = text(employee.status);
  const leave =
    employee.leave &&
    typeof employee.leave === "object"
      ? (employee.leave as Record<
          string,
          unknown
        >)
      : null;

  if (
    leave?.active === true ||
    raw === "leave" ||
    raw === "إجازة" ||
    raw === "في إجازة"
  ) {
    return "leave";
  }

  if (
    raw === "suspended" ||
    raw === "موقوف"
  ) {
    return "suspended";
  }

  return "active";
}

function classificationOf(
  employeeType: string,
  fullCode: string,
  administrationTitle: string
) {
  const normalizedCode =
    fullCode.toUpperCase();

  if (
    employeeType ===
    "certified_leader"
  ) {
    return "مسؤولو المعتمد";
  }

  if (employeeType === "certified") {
    return "لاعب معتمد";
  }

  if (
    employeeType ===
    "administration"
  ) {
    if (
      normalizedCode.startsWith("A+") ||
      administrationTitle ===
        "الإدارة العليا A+"
    ) {
      return "الإدارة العليا A+";
    }

    return "الإدارة";
  }

  if (employeeType === "leader") {
    return "القيادة";
  }

  return "موظف أساسي";
}

function isoDate(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }

  return null;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request
      .json()
      .catch(() => null);

    const discordId = text(
      body?.discordId
    ).replace(/\D/g, "");

    if (!/^\d{15,25}$/.test(discordId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ألصق كوبي آيدي ديسكورد صحيح.",
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    const snapshot = await db
      .collection("employees")
      .where(
        "discordId",
        "==",
        discordId
      )
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ما لقينا بطاقة مرتبطة بهذا الآيدي.",
        },
        { status: 404 }
      );
    }

    const employee =
      snapshot.docs[0].data() as Record<
        string,
        unknown
      >;

    const reportsSource =
      employee.reports &&
      typeof employee.reports === "object"
        ? (employee.reports as Record<
            string,
            unknown
          >)
        : {};

    const reports = {
      fieldGuide: number(
        reportsSource.fieldGuide
      ),
      fieldSupervisor: number(
        reportsSource.fieldSupervisor
      ),
      generalSupervisor: number(
        reportsSource.generalSupervisor
      ),
      recruitment: number(
        reportsSource.recruitment
      ),
    };

    const fullCode =
      text(employee.fullCode) ||
      text(employee.rank) ||
      "غير محدد";

    const employeeType =
      text(employee.employeeType) ||
      (fullCode.startsWith("CA-")
        ? "certified_leader"
        : fullCode.startsWith("C-")
          ? "certified"
          : "main");

    const administrationTitle = text(
      employee.administrationTitle
    );

    const level = Math.max(
      1,
      Math.min(
        10,
        Math.trunc(
          number(employee.level) || 1
        )
      )
    );

    const courses = Array.isArray(
      employee.courses
    )
      ? employee.courses
          .filter(
            (
              course
            ): course is string =>
              typeof course === "string"
          )
          .map((course) =>
            course.trim()
          )
          .filter(Boolean)
      : [];

    const warningsCount =
      Array.isArray(employee.warnings)
        ? employee.warnings.length
        : number(employee.warnings);

    return NextResponse.json(
      {
        success: true,
        employee: {
          name:
            cleanEmployeeName(
              employee.name
            ) || "موظف القطاع",
          discordId,
          fullCode,
          level,
          employeeType,
          classification:
            classificationOf(
              employeeType,
              fullCode,
              administrationTitle
            ),
          mainSector: text(
            employee.mainSector
          ),
          administrationTitle,
          status: statusOf(employee),
          reports,
          reportsTotal:
            reports.fieldGuide +
            reports.fieldSupervisor +
            reports.generalSupervisor +
            reports.recruitment,
          courses,
          warningsCount,
          hiredAt: isoDate(
            employee.hiredAt ??
              employee.createdAt
          ),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public employee card error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر عرض البطاقة حاليًا.",
      },
      { status: 500 }
    );
  }
}
