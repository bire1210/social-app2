"use client";

import { useParams } from "next/navigation";
import { usePost } from "@/hooks/usePosts";
import { PostCard } from "@/components/posts/PostCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = usePost(id);

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  if (!data?.post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Post not found</p>
        <Link href="/" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <PostCard post={data.post} />
    </div>
  );
}
