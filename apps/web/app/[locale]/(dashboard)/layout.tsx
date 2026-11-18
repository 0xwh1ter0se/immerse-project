import type { ReactNode } from "react";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { StudyBottomNav } from "../../components/layout/StudyBottomNav";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl">
      <AppSidebar />
      <div className="min-w-0 flex-1 px-4 py-6 pb-28 md:px-10 md:py-8 md:pb-8">{children}</div>
      <StudyBottomNav />
    </div>
  );
}
