"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * This route group page also resolves to "/".
 * Since app/page.tsx now handles both authenticated and guest views,
 * we redirect here to avoid any conflict.
 */
export default function CustomerHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
