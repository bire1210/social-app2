"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  Search,
  Bell,
  User,
  Settings,
  LogIn,
  UserPlus,
  Clapperboard,
  Store,
  Users,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount ?? 0;

  const navItems = user
    ? [
        { href: "/", label: "Home", icon: Home },
        { href: "/reels", label: "Reels", icon: Clapperboard },
        { href: "/explore", label: "Explore", icon: Search },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { href: "/explore", label: "Explore", icon: Search },
      ];

  // Bottom bar items matching the Facebook-style layout:
  // Home | Reels | Marketplace | Friends | Menu
  const bottomItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/reels", label: "Reels", icon: Clapperboard },
    { href: "/explore", label: "Marketplace", icon: Store },
    { href: "/friends", label: "Friends", icon: Users },
  ];

  const isBottomActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top bar for mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <Link href={user ? "/" : "/explore"} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold bg-linear-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">
            BireSocial
          </span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[260px] p-4">
            <nav className="space-y-1 mt-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-500/10 text-blue-500"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              {user && (
                <Link
                  href={`/profile/${user._id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </Link>
              )}
              {!user && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-500 hover:bg-blue-500/10"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span className="font-medium">Create Account</span>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Bottom nav bar — Facebook-style: Home | Reels | Marketplace | Friends | Menu */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {bottomItems.map((item) => {
            const active = isBottomActive(item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="relative flex-1 flex flex-col items-center py-2.5 transition-all"
              >
                {/* Active indicator line on top */}
                {active && (
                  <span className="absolute top-0 left-2 right-2 h-[3px] rounded-b-full bg-blue-500" />
                )}
                <item.icon
                  className={`h-6 w-6 transition-colors ${
                    active ? "text-blue-500" : "text-muted-foreground"
                  }`}
                  {...(active && item.icon === Home ? { fill: "currentColor" } : {})}
                />
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute top-1 right-1/4 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Menu / More button */}
          <button
            onClick={() => setOpen(true)}
            className="relative flex-1 flex flex-col items-center py-2.5 transition-all"
          >
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </nav>
    </>
  );
}
