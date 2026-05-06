"use client";

import { useAdminDashboard } from "@/hooks/useAdmin";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, MessageSquare, BookOpen,
  MessageCircle, TrendingUp, TrendingDown, Minus,
  ArrowRight, Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

// ─── Mini bar chart (no external lib needed) ─────────────
function SignupChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 4);
        const dayName = days[new Date(d.date + "T12:00:00").getDay()];
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: "80px" }}>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-red-500 to-yellow-400 opacity-80 group-hover:opacity-100 transition-all"
                style={{ height: `${height}%` }}
                title={`${d.count} signups`}
              />
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {d.count}
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground">{dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Growth badge ─────────────────────────────────────────
function GrowthBadge({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-xs text-emerald-500 font-medium">
      <TrendingUp className="h-3 w-3" /> +{value}%
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-xs text-destructive font-medium">
      <TrendingDown className="h-3 w-3" /> {value}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-medium">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  const stats = data?.stats ?? null;
  const recentUsers = data?.recentUsers ?? [];
  const recentPosts = data?.recentPosts ?? [];
  const signupChart = data?.signupChart ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers?.toLocaleString() ?? "0",
      sub: `+${stats?.newUsersThisMonth ?? 0} this month`,
      growth: stats?.userGrowth ?? 0,
      icon: Users,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts?.toLocaleString() ?? "0",
      sub: `+${stats?.newPostsThisMonth ?? 0} this month`,
      growth: stats?.postGrowth ?? 0,
      icon: FileText,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Comments",
      value: stats?.totalComments?.toLocaleString() ?? "0",
      sub: "All time",
      growth: null,
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Stories",
      value: stats?.totalStories?.toLocaleString() ?? "0",
      sub: "Active (24h)",
      growth: null,
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Messages",
      value: stats?.totalMessages?.toLocaleString() ?? "0",
      sub: "All time",
      growth: null,
      icon: MessageCircle,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
          <Activity className="h-4 w-4" />
          Live
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.growth !== null && <GrowthBadge value={stat.growth} />}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Recent Users row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signup chart */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">New Signups — Last 7 Days</CardTitle>
              <span className="text-xs text-muted-foreground">
                {signupChart.reduce((a, b) => a + b.count, 0)} total
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {signupChart.length > 0 ? (
              <SignupChart data={signupChart} />
            ) : (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                No signup data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm font-medium">New Users</span>
              </div>
              <span className="text-lg font-bold">{stats?.newUsersThisMonth ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-yellow-500" />
                </div>
                <span className="text-sm font-medium">New Posts</span>
              </div>
              <span className="text-lg font-bold">{stats?.newPostsThisMonth ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500/20 to-yellow-400/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm font-medium">User Growth</span>
              </div>
              <GrowthBadge value={stats?.userGrowth ?? 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users + Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
              <Link
                href="/admin/users"
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No users yet</p>
            ) : recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent/40 transition-colors">
                <div className="flex items-center gap-3">
                  <UserAvatar src={user.avatar} fallback={user.fullName} className="h-9 w-9" />
                  <div>
                    <p className="text-sm font-medium leading-tight">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-[10px] mb-1"
                    >
                      {user.role}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
              <Link
                href="/admin/posts"
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No posts yet</p>
            ) : recentPosts.map((post) => (
              <div key={post._id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/40 transition-colors">
                <UserAvatar
                  src={post.author?.avatar}
                  fallback={post.author?.fullName ?? "?"}
                  className="h-8 w-8 shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold truncate">{post.author?.fullName}</p>
                    <p className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {post.content || "— no text —"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      ❤️ {Array.isArray(post.likes) ? post.likes.length : 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
