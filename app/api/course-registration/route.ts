import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  getAdminDb,
} from "@/lib/firebaseAdmin";

import {
  isCoreCourseName,
} from "@/lib/courseCatalog";

type EmployeeType =
  | "main"
  | "certified"
  | "certified_leader";

class RegistrationError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status = 400,
    code = "registration_error"
  ) {
    super(message);

    this.status = status;
    this.code = code;
  }
}

function cleanText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeName(
  value: string
) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getEmployeeType(
  employee: Record<
    string,
    unknown
  >
): EmployeeType {
  const savedType = cleanText(
    employee.employeeType
  );

  if (
    savedType === "main" ||
    savedType === "certified" ||
    savedType ===
      "certified_leader"
  ) {
    return savedType;
  }

  const code = cleanText(
    employee.fullCode ??
      employee.rank
  ).toUpperCase();

  if (code.startsWith("CA-")) {
    return "certified_leader";
  }

  if (code.startsWith("C-")) {
    return "certified";
  }

  return "main";
}

function getEmployeeLevel(
  value: unknown
) {
  const level = Number(value);

  if (
    !Number.isInteger(level) ||
    level < 1 ||
    level > 10
  ) {
    return 0;
  }

  return level;
}

function timestampToISOString(
  value: unknown
) {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate ===
      "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }

  return null;
}

function timestampToMilliseconds(
  value: unknown
) {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis ===
      "function"
  ) {
    return value.toMillis();
  }

  return null;
}

/*
  GET

  يعرض للصفحة العامة الدورات
  المفتوحة فقط، بدون كشف بيانات
  الموظفين أو بيانات داخلية.
*/

export async function GET() {
  try {
    const db = getAdminDb();

    const snapshot = await db
      .collection(
        "courseSessions"
      )
      .where(
        "registrationOpen",
        "==",
        true
      )
      .get();

    const courses = snapshot.docs
      .map((courseDocument) => {
        const course =
          courseDocument.data();

        return {
          id:
            courseDocument.id,

          courseName:
            cleanText(
              course.courseName
            ),

          description:
            cleanText(
              course.description
            ),

          status:
            cleanText(
              course.status
            ),

          registrationOpen:
            course.registrationOpen ===
            true,

          allowedLevels:
            Array.isArray(
              course.allowedLevels
            )
              ? course.allowedLevels
                  .map(Number)
                  .filter(
                    (level) =>
                      Number.isInteger(
                        level
                      ) &&
                      level >= 1 &&
                      level <= 10
                  )
              : [],

          allowedEmployeeTypes:
            Array.isArray(
              course.allowedEmployeeTypes
            )
              ? course.allowedEmployeeTypes
                  .map(String)
                  .filter(
                    (type) =>
                      type === "main" ||
                      type ===
                        "certified" ||
                      type ===
                        "certified_leader"
                  )
              : [],

          startsAt:
            timestampToISOString(
              course.startsAt
            ),

          registrationEndsAt:
            timestampToISOString(
              course.registrationEndsAt
            ),
        };
      })
      .filter(
        (course) =>
          isCoreCourseName(
            course.courseName
          ) &&
          course.status === "open" &&
          course.registrationOpen
      );

    courses.sort(
      (
        firstCourse,
        secondCourse
      ) => {
        if (
          !firstCourse.startsAt ||
          !secondCourse.startsAt
        ) {
          return 0;
        }

        return (
          new Date(
            firstCourse.startsAt
          ).getTime() -
          new Date(
            secondCourse.startsAt
          ).getTime()
        );
      }
    );

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(
      "تعذر تحميل الدورات المفتوحة:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "تعذر تحميل الدورات المفتوحة حاليًا.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
  POST

  يستقبل:
  - courseId
  - name
  - discordId

  ويتحقق من الموظف والمستوى
  والدورة والتسجيل المكرر.
*/

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request
        .json()
        .catch(() => null);

    if (
      !body ||
      typeof body !== "object"
    ) {
      throw new RegistrationError(
        "بيانات التسجيل غير صحيحة."
      );
    }

    const courseId = cleanText(
      body.courseId
    );

    const submittedName =
      cleanText(body.name);

    const discordId = cleanText(
      body.discordId
    );

    if (!courseId) {
      throw new RegistrationError(
        "اختر الدورة المطلوبة."
      );
    }

    if (
      submittedName.length < 2 ||
      submittedName.length > 80
    ) {
      throw new RegistrationError(
        "اكتب اسم الموظف بشكل صحيح."
      );
    }

    if (
      !/^\d{15,22}$/.test(
        discordId
      )
    ) {
      throw new RegistrationError(
        "اكتب Discord ID بشكل صحيح."
      );
    }

    const db = getAdminDb();

    /*
      البحث يتم بالـDiscord ID.

      لا يتم إنشاء أي طلب إذا لم
      يكن الـID موجودًا في employees.
    */

    const employeeSnapshot =
      await db
        .collection("employees")
        .where(
          "discordId",
          "==",
          discordId
        )
        .limit(2)
        .get();

    if (
      employeeSnapshot.empty
    ) {
      throw new RegistrationError(
        "الاسم أو Discord ID غير مسجل ضمن موظفي القطاع.",
        404,
        "employee_not_found"
      );
    }

    if (
      employeeSnapshot.size > 1
    ) {
      throw new RegistrationError(
        "يوجد تكرار في Discord ID. تواصل مع القيادة لتصحيح البيانات.",
        409,
        "duplicated_discord_id"
      );
    }

    const employeeDocument =
      employeeSnapshot.docs[0];

    const employee =
      employeeDocument.data();

    const employeeName =
      cleanText(employee.name);

    /*
      الاسم والـID لازم يكونان لنفس
      الموظف، مع تجاهل المسافات
      الزائدة.
    */

    if (
      normalizeName(
        employeeName
      ) !==
      normalizeName(
        submittedName
      )
    ) {
      throw new RegistrationError(
        "الاسم أو Discord ID غير مسجل ضمن موظفي القطاع.",
        404,
        "employee_not_found"
      );
    }

    const employeeLevel =
      getEmployeeLevel(
        employee.level
      );

    if (!employeeLevel) {
      throw new RegistrationError(
        "مستوى الموظف غير مسجل بشكل صحيح. تواصل مع القيادة.",
        409,
        "invalid_employee_level"
      );
    }

    const employeeType =
      getEmployeeType(
        employee
      );

    const employeeCode =
      cleanText(
        employee.fullCode ??
          employee.rank
      );

    const employeeCourses =
      Array.isArray(
        employee.courses
      )
        ? employee.courses
            .map(String)
            .map((course) =>
              course.trim()
            )
            .filter(Boolean)
        : [];

    const courseReference =
      db
        .collection(
          "courseSessions"
        )
        .doc(courseId);

    /*
      نستخدم معرفًا ثابتًا للطلب،
      وبالتالي نفس الموظف لا يستطيع
      التسجيل مرتين في نفس الدورة.
    */

    const registrationId =
      `${courseId}__${employeeDocument.id}`;

    const registrationReference =
      db
        .collection(
          "courseRegistrations"
        )
        .doc(registrationId);

    await db.runTransaction(
      async (transaction) => {
        const [
          courseSnapshot,
          registrationSnapshot,
        ] = await Promise.all([
          transaction.get(
            courseReference
          ),

          transaction.get(
            registrationReference
          ),
        ]);

        if (
          !courseSnapshot.exists
        ) {
          throw new RegistrationError(
            "الدورة غير موجودة.",
            404,
            "course_not_found"
          );
        }

        const course =
          courseSnapshot.data() ?? {};

        const courseName =
          cleanText(
            course.courseName
          );

        const status =
          cleanText(
            course.status
          );

        if (
          !isCoreCourseName(
            courseName
          )
        ) {
          throw new RegistrationError(
            "هذه الدورة غير معتمدة.",
            409,
            "invalid_course_name"
          );
        }

        if (
          status !== "open" ||
          course.registrationOpen !==
            true
        ) {
          throw new RegistrationError(
            "انتهى أو أُغلق التسجيل في هذه الدورة.",
            409,
            "registration_closed"
          );
        }

        const registrationEndsAt =
          timestampToMilliseconds(
            course.registrationEndsAt
          );

        if (
          registrationEndsAt !==
            null &&
          registrationEndsAt <
            Date.now()
        ) {
          throw new RegistrationError(
            "انتهى وقت التسجيل في هذه الدورة.",
            409,
            "registration_expired"
          );
        }

        const allowedLevels =
          Array.isArray(
            course.allowedLevels
          )
            ? course.allowedLevels
                .map(Number)
                .filter(
                  (level) =>
                    Number.isInteger(
                      level
                    )
                )
            : [];

        if (
          allowedLevels.length >
            0 &&
          !allowedLevels.includes(
            employeeLevel
          )
        ) {
          throw new RegistrationError(
            "هذه الدورة غير متاحة لمستواك الحالي.",
            403,
            "level_not_allowed"
          );
        }

        const allowedEmployeeTypes =
          Array.isArray(
            course.allowedEmployeeTypes
          )
            ? course.allowedEmployeeTypes.map(
                String
              )
            : [];

        if (
          allowedEmployeeTypes.length >
            0 &&
          !allowedEmployeeTypes.includes(
            employeeType
          )
        ) {
          throw new RegistrationError(
            "هذه الدورة غير متاحة لنوع عضويتك.",
            403,
            "employee_type_not_allowed"
          );
        }

        if (
          courseName &&
          employeeCourses.includes(
            courseName
          )
        ) {
          throw new RegistrationError(
            "أنت حاصل على هذه الدورة مسبقًا.",
            409,
            "course_already_completed"
          );
        }

        if (
          registrationSnapshot.exists
        ) {
          throw new RegistrationError(
            "أنت مسجل بالفعل في هذه الدورة.",
            409,
            "already_registered"
          );
        }

        transaction.create(
          registrationReference,
          {
            courseId:
              courseSnapshot.id,

            courseName,

            employeeId:
              employeeDocument.id,

            employeeName,

            discordId,

            employeeCode,

            employeeLevel,

            employeeType,

            status:
              "registered",

            attended: false,

            createdAt:
              FieldValue.serverTimestamp(),

            updatedAt:
              FieldValue.serverTimestamp(),
          }
        );
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "تم تسجيل طلب حضورك بنجاح.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof
      RegistrationError
    ) {
      return NextResponse.json(
        {
          success: false,

          code: error.code,

          message:
            error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "تعذر تسجيل الموظف في الدورة:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "حدث خطأ أثناء التسجيل. حاول مرة أخرى.",
      },
      {
        status: 500,
      }
    );
  }
}