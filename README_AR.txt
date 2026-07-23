إصلاح بطاقة الموظف والتصنيفات

يعالج:
- Internal Server Error في /employee-card
- ظهور "مسؤولو المعتمد — CA" عند إضافة وتعديل الموظف
- ظهور "الإدارة العليا A+" داخل المسميات الإدارية
- توليد أكواد الإدارة العليا بالبادئة A+
- عرض كود المعتمد مع القطاع الأساسي
- إزالة الكود المكتوب داخل نهاية الاسم عند عرض البطاقة

التركيب:
1. فك الضغط داخل مجلد MSS.
2. افتح PowerShell داخل MSS.
3. أوقف الموقع بـ Ctrl + C.
4. شغل:
   powershell -ExecutionPolicy Bypass -File .\install-repair.ps1
5. شغل:
   npm run dev

التجربة:
http://localhost:3000/employee-card
http://localhost:3000/dashboard/employees/add

داخل إضافة موظف:
- اختر "مسؤولو المعتمد — CA"
- أو اختر "الإدارة والإدارة العليا"
  ثم من المسمى الإداري اختر "الإدارة العليا A+"

الرفع:
git add app/employee-card/page.tsx app/api/public-employee/route.ts app/dashboard/employees/add/page.tsx "app/dashboard/employees/[id]/edit/page.tsx" lib/administration.ts lib/employeeCodes.ts
git commit -m "Repair employee card and categories"
git push origin main
