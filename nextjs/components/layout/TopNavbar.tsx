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
  Video,
  Store,
  Gamepad2,
  LayoutGrid,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount ?? 0;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navIcons = user
    ? [
        { href: "/", icon: Home, label: "Home" },
        { href: "/reels", icon: Video, label: "Reels" },
        { href: "/explore", icon: Store, label: "Marketplace" },
        { href: "/friends", icon: Users, label: "Friends" },
        { href: "/explore", icon: Gamepad2, label: "Gaming" },
      ]
    : [
        { href: "/explore", icon: Users, label: "Explore" },
        { href: "/reels", icon: Video, label: "Reels" },
      ];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border shadow-sm">
      <div className="h-full flex items-center justify-between px-4 max-w-[1920px] mx-auto">

        {/* Left — Logo + Search */}
        <div className="flex items-center gap-2 min-w-[240px]">
          <Link href={user ? "/" : "/explore"} className="shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
          </Link>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="Search BireSocial"
              className="h-10 w-[220px] rounded-full bg-accent/80 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* Center — Nav Icons */}
        <nav className="hidden md:flex items-center">
          {navIcons.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) && item.href !== "/explore";
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                title={item.label}
                className={`relative flex items-center justify-center h-14 w-[80px] lg:w-[100px] border-b-[3px] transition-all duration-150 group ${
                  isActive
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-muted-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-6 w-6" />
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute top-2 right-5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right — Action Icons */}
        <div className="flex items-center gap-1.5 min-w-[240px] justify-end">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Apps / Grid */}
          <button
            className="h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
            title="Menu"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>

          {/* Messenger */}
          <Link
            href="/friends"
            className="relative h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
            title="Messenger"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>

          {/* Notifications */}
          {user && (
            <Link
              href="/notifications"
              className="relative h-10 w-10 rounded-full bg-accent/80 flex items-center justify-center hover:bg-accent transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile avatar + dropdown */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-1 rounded-full hover:bg-accent p-1 transition-colors"
              >
                <UserAvatar
                  src={user.avatar}
                  fallback={user.fullName}
                  className="h-9 w-9"
                />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-card border border-border rounded-2xl shadow-xl p-2 z-50">
                  {/* Profile card */}
                  <Link
                    href={`/profile/${user._id}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                  >
                    <UserAvatar src={user.avatar} fallback={user.fullName} className="h-14 w-14" />
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-xs text-blue-500 mt-0.5">See your profile</p>
                    </div>
                  </Link>

                  <div className="border-t border-border my-2" />

                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-sm"
                  >
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
                      <Settings className="h-5 w-5" />
                    </div>
                    Settings & privacy
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-sm"
                  >
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
                      <LogOut className="h-5 w-5" />
                    </div>
                    Log out
                  </button>

                  <p className="text-[10px] text-muted-foreground px-3 pt-2">
                    BireSocial © 2026
                  </p>
                </div>
              )}
            </div>
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
