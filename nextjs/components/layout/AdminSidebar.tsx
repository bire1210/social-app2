"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="sticky top-0 h-screen w-[72px] lg:w-[260px] border-r border-border flex flex-col py-6 px-3 lg:px-4 bg-card/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <div className="hidden lg:block">
          <span className="text-xl font-bold bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            Velora
          </span>
          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      {/* Back to app link */}
      <Link
        href="/"
        className="flex items-center gap-3 px-3 py-2 mb-4 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all text-sm"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span className="hidden lg:block">Back to App</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-rose-500/10 text-rose-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? "text-rose-400" : "group-hover:text-foreground"
                }`}
              />
              <span className="hidden lg:block font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-2 pt-4 border-t border-border">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          <span className="hidden lg:block font-medium">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden lg:block font-medium">Logout</span>
        </button>

        {user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-accent/50 mt-2">
            <UserAvatar
              src={user.avatar}
              fallback={user.fullName}
              className="h-9 w-9"
            />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.fullName}</p>
              <p className="text-xs text-rose-400 truncate">Administrator</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
