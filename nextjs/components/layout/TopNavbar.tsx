"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useTheme } from "next-themes";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Home,
  Search,
  Bell,
  MessageCircle,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function TopNavbar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount ?? 0;

  const navIcons = user
    ? [
        { href: "/", icon: Home, label: "Home" },
        { href: "/friends", icon: Users, label: "Friends" },
        { href: "/notifications", icon: Bell, label: "Notifications" },
      ]
    : [{ href: "/explore", icon: Users, label: "Explore" }];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border shadow-sm">
      <div className="h-full flex items-center justify-between px-4 max-w-[1920px] mx-auto">
        {/* Left — Logo + Search */}
        <div className="flex items-center gap-2 min-w-[280px]">
          <Link
            href={user ? "/" : "/explore"}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
          </Link>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BireSocial"
              className="h-10 w-[240px] rounded-full bg-accent/80 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* Center — Nav Icons */}
        <nav className="hidden md:flex items-center gap-1">
          {navIcons.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-center h-12 w-[110px] rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "text-blue-500"
                    : "text-muted-foreground hover:bg-accent"
                }`}
                title={item.label}
              >
                <item.icon
                  className={`h-6 w-6 ${isActive ? "text-blue-500" : ""}`}
                />
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-6 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-blue-500 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 min-w-[280px] justify-end">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Messenger */}
          <button className="h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors">
            <MessageCircle className="h-5 w-5" />
          </button>

          {/* Notifications  */}
          {user && (
            <Link
              href="/notifications"
              className="relative h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile avatar */}
          {user ? (
            <Link href={`/profile/${user._id}`}>
              <UserAvatar
                src={user.avatar}
                fallback={user.fullName}
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all rounded-full"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
