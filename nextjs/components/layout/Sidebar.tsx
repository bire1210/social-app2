"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  PlusCircle,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="sticky top-0 h-screen w-[72px] lg:w-[240px] border-r border-border flex flex-col py-6 px-3 lg:px-4 bg-card/50 backdrop-blur-xl">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 px-2"
      >
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-500 to-blue-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <span className="hidden lg:block text-xl font-bold bg-linear-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">
          Velora
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${
                  isActive
                    ? "text-blue-500"
                    : "group-hover:text-foreground"
                }`}
              />
              <span className="hidden lg:block font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile link */}
        {user && (
          <Link
            href={`/profile/${user._id}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              pathname.startsWith("/profile")
                ? "bg-blue-500/10 text-blue-500"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <User className="h-5 w-5 shrink-0" />
            <span className="hidden lg:block font-medium">Profile</span>
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      <div className="space-y-2 pt-4 border-t border-border">
        {/* Theme toggle */}
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
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden lg:block font-medium">Logout</span>
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-accent/50 mt-2">
            <UserAvatar
              src={user.avatar}
              fallback={user.fullName}
              className="h-9 w-9"
            />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
