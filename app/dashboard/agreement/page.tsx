import RoleGuard from "@/components/auth/RoleGuard";
import AgreementContent from "@/components/agreement/AgreementContent";

export default function DashboardAgreementPage() {
  return (
    <RoleGuard allow={["owner", "leader", "supervisor"]}>
      <AgreementContent />
    </RoleGuard>
  );
}
