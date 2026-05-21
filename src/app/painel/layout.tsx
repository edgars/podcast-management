import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        role={session.user.role}
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 cc-grid-bg opacity-[0.2] dark:opacity-[0.35]" />
        <main className="relative flex-1 space-y-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
