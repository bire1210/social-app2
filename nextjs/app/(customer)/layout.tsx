"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar — Desktop */}
      <div className="hidden md:block">
        <TopNavbar />
      </div>

      {/* Mobile top + bottom nav */}
      <MobileNav />

      <div className="flex max-w-[1920px] mx-auto">
        {/* Left Sidebar — Desktop */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-screen mt-14 md:mt-14 mb-16 md:mb-0">
          <div className="max-w-[680px] mx-auto px-4 py-4">{children}</div>
        </main>

        {/* Right Sidebar — Large screens only */}
        <div className="hidden xl:block w-[340px] shrink-0 pr-4 mt-14">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
