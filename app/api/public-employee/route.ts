import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EmployeeReports = {
  fieldGuide: number;
  fieldSupervisor: number;
  generalSupervisor: number;
  recruitment: number;
};

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue)
    ? Math.max(0, numberValue)
    : 0;
}

function getWarningsCount(value: unknown) {
  if (Array.isArray(value)) {
    return value.length;
  }

  return cleanNumber(value);
}

function getStatus(
  employee: Record<string, unknown>
) {
  const rawStatus = cleanText(
    employee.status
  );

  const leave =
    employee.leave &&
    typeof employee.leave === "object"
      ? employee.leave as Record<
          string,
          unknown
        >
      : null;

  if (
    leave?.active === true ||
    rawStatus === "leave" ||
    rawStatus === "إجازة" ||
    rawStatus === "في إجازة"
  ) {
    return "leave";
  }

  if (
    rawStatus === "suspended" ||
    rawStatus === "موقوف"
  ) {
    return "suspended";
  }

  return "active";
}

function getEmployeeClassification(
  employeeType: string,
  fullCode: string,
  administrationTitle: string
) {
  const normalizedCode =
    fullCode.trim().toUpperCase();

  const normalizedTitle =
    administrationTitle.trim();

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
    const isSeniorAdministration =
      normalizedCode.startsWith("A+") ||
      normalizedCode.startsWith("A-") ||
      normalizedTitle.includes("أدمن") ||
      normalizedTitle.includes(
        "الإدارة العليا"
      );

    return isSeniorAdministration
      ? "الإدارة العليا A+"
      : "الإدارة";
  }

  if (employeeType === "leader") {
    return "القيادة";
  }

  return "موظف أساسي";
}

function timestampToISOString(
  value: unknown
) {
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

    const discordId = cleanText(
      body?.discordId
    );

    if (!/^\d{15,25}$/.test(discordId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ألصق كوبي آيدي ديسكورد صحيح.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
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
      .limit(2)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ما لقينا بطاقة مرتبطة بهذا الآيدي.",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const employeeDocument =
      snapshot.docs[0];

    const employee =
      employeeDocument.data() as Record<
        string,
        unknown
      >;

    const reportsSource =
      employee.reports &&
      typeof employee.reports === "object"
        ? employee.reports as Record<
            string,
            unknown
          >
        : {};

    const reports: EmployeeReports = {
      fieldGuide: cleanNumber(
        reportsSource.fieldGuide
      ),
      fieldSupervisor: cleanNumber(
        reportsSource.fieldSupervisor
      ),
      generalSupervisor: cleanNumber(
        reportsSource.generalSupervisor
      ),
      recruitment: cleanNumber(
        reportsSource.recruitment
      ),
    };

    const employeeType =
      cleanText(
        employee.employeeType
      ) || "main";

    const level = Math.min(
      10,
      Math.max(
        1,
        Math.trunc(
          cleanNumber(employee.level) || 1
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
          .slice(0, 30)
      : [];

    const fullCode =
      cleanText(
        employee.fullCode
      ) ||
      cleanText(employee.rank) ||
      "غير محدد";

    return NextResponse.json(
      {
        success: true,
        employee: {
          name:
            cleanText(employee.name) ||
            "موظف القطاع",
          discordId,
          fullCode,
          level,
          employeeType,
          employeeTypeLabel:
            getEmployeeClassification(
              employeeType,
              fullCode,
              cleanText(
                employee.administrationTitle
              )
            ),
          mainSector:
            cleanText(
              employee.mainSector
            ),
          administrationTitle:
            cleanText(
              employee.administrationTitle
            ),
          status:
            getStatus(employee),
          courses,
          reports,
          reportsTotal:
            reports.fieldGuide +
            reports.fieldSupervisor +
            reports.generalSupervisor +
            reports.recruitment,
          warningsCount:
            getWarningsCount(
              employee.warnings
            ),
          hiredAt:
            timestampToISOString(
              employee.hiredAt ??
                employee.createdAt
            ),
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public employee lookup failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر عرض البطاقة حاليًا. حاول مرة ثانية.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
