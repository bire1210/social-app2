"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  Home,
  Search,
  Users,
  Clock,
  Bookmark,
  UsersRound,
  Video,
  ShoppingBag,
  Newspaper,
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const mainNavItems = user
    ? [
        { href: "/", label: "Home", icon: Home },
        { href: "/explore", label: "Explore", icon: Search },
        {
          href: `/profile/${user._id}`,
          label: user.fullName,
          icon: null,
          isProfile: true,
        },
        { href: "/friends", label: "Friends", icon: Users },
        { href: "#", label: "Memories", icon: Clock },
        { href: "#", label: "Saved", icon: Bookmark },
        { href: "#", label: "Groups", icon: UsersRound },
      ]
    : [{ href: "/explore", label: "Explore", icon: Search }];

  const moreNavItems = [
    { href: "#", label: "Reels", icon: Video },
    { href: "#", label: "Marketplace", icon: ShoppingBag },
    { href: "#", label: "Feeds", icon: Newspaper },
  ];

  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] w-[280px] overflow-y-auto py-3 px-2 scrollbar-hide">
      <nav className="space-y-0.5">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              !item.href.startsWith("#") &&
              pathname.startsWith(item.href));

          if (item.isProfile && user) {
            return (
              <Link
                key="profile"
                href={item.href}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 ${
                  pathname.startsWith("/profile")
                    ? "bg-accent"
                    : "hover:bg-accent"
                }`}
              >
                <UserAvatar
                  src={user.avatar}
                  fallback={user.fullName}
                  className="h-9 w-9"
                />
                <span className="font-medium text-sm">{user.fullName}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-accent font-semibold"
                  : "hover:bg-accent"
              }`}
            >
              {item.icon && (
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-accent/80 text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
              )}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* Show More / Less */}
        {user && (
          <>
            {showMore &&
              moreNavItems.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-accent"
                >
                  <div className="h-9 w-9 rounded-full bg-accent/80 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}

            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-accent w-full"
            >
              <div className="h-9 w-9 rounded-full bg-accent/80 flex items-center justify-center shrink-0">
                {showMore ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm">
                {showMore ? "See less" : "See more"}
              </span>
            </button>
          </>
        )}
      </nav>

      {/* Shortcuts section */}
      {user && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">
            Your shortcuts
          </h3>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-all"
          >
            <div className="h-9 w-9 rounded-lg bg-accent/80 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-sm">Settings</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all w-full"
          >
            <div className="h-9 w-9 rounded-lg bg-accent/80 flex items-center justify-center shrink-0">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      )}

      {/* Guest: Sign In / Register */}
      {!user && (
        <div className="mt-4 pt-4 border-t border-border space-y-1">
          <Link
            href="/login"
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-all w-full"
          >
            <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <LogIn className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Sign In</span>
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-all w-full"
          >
            <div className="h-9 w-9 rounded-full bg-accent/80 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Create Account</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 px-2">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Privacy · Terms · Advertising · Ad Choices · Cookies ·
          More · BireSocial © 2026
        </p>
      </div>
    </aside>
  );
}
