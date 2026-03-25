"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile nav */}
      <MobileNav />

      {/* Main content */}
      <main className="flex-1 min-h-screen md:ml-0 mt-14 md:mt-0 mb-16 md:mb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
