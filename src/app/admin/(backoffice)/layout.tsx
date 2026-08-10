import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminShellData } from "@/lib/admin/backoffice";
import { getCurrentAdminProfile } from "@/lib/repositories/adminRepository";

export const dynamic = "force-dynamic";

export default async function BackOfficeLayout({ children }: LayoutProps<"/admin">) {
  const { profile, status } = await getCurrentAdminProfile();

  if (status === "unconfigured") {
    redirect("/admin/login?error=oauth_unavailable");
  }

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (status === "unauthorized" || status === "unauthorized_email") {
    redirect("/admin/login?error=unauthorized");
  }

  if (status === "profile_inactive") {
    redirect("/admin/login?error=profile_inactive");
  }

  const shellData = await getAdminShellData();

  return (
    <AdminShell profile={profile} shellData={shellData}>
      {children}
    </AdminShell>
  );
}
