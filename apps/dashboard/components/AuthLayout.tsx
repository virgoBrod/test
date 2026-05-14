"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Si está en la página de login, renderizar sin AppShell
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}