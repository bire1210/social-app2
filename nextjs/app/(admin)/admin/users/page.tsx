"use client";

import { useState } from "react";
import { useAdminUsers, useToggleUserRole, useAdminDeleteUser } from "@/hooks/useAdmin";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ShieldOff, Trash2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers();
  const toggleRole = useToggleUserRole();
  const deleteUser = useAdminDeleteUser();

  const users = data?.users ?? [];

  const handleToggleRole = async (userId: string) => {
    try {
      await toggleRole.mutateAsync(userId);
      toast.success("Role updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await deleteUser.mutateAsync(userId);
      toast.success("User deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered users ({users.length} total)
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card
            key={user._id}
            className="border-border/50 bg-card/50"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={user.avatar}
                    fallback={user.fullName}
                    className="h-10 w-10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{user.fullName}</p>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{user.username} · {user.email} · Joined{" "}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleRole(user._id)}
                    title={
                      user.role === "admin" ? "Remove admin" : "Make admin"
                    }
                    className="h-8 w-8"
                  >
                    {user.role === "admin" ? (
                      <ShieldOff className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user._id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
