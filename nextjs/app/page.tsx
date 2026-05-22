"use client";

import { useFeed } from "@/hooks/usePosts";
import { PostCard } from "@/components/posts/PostCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";

export default function HomePage() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed();

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return <LoadingSpinner className="mt-20" />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Explore Posts
        </h1>
        <p className="text-gray-600 mb-4">
          Discover amazing content from the community
        </p>
        
        {/* Auth buttons for guests */}
        <div className="flex justify-center space-x-4 mb-6">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">
              No posts available at the moment. Check back later! ✨
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}

        {hasNextPage && posts.length > 0 && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 transition-colors bg-white rounded-xl border border-gray-200 font-medium"
          >
            {isFetchingNextPage ? "Loading..." : "Load more posts"}
          </button>
        )}
      </div>
    </div>
  );
}

// Alternative: You could also create a landing page
// export default function HomePage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-gray-900 mb-4">
//           Welcome to Social Media App
//         </h1>
//         <p className="text-lg text-gray-600 mb-8">
//           Connect, share, and explore with friends
//         </p>
//         <div className="space-x-4">
//           <a
//             href="/login"
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Login
//           </a>
//           <a
//             href="/register"
//             className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
//           >
//             Register
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }