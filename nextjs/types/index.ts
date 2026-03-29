export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  role: "user" | "admin";
  isVerified: boolean;
  website: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface Reaction {
  user: string;
  type: ReactionType;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  image: string;
  video: string;
  mediaType: "none" | "image" | "video";
  feeling?: string;
  likes: string[];
  reactions: Reaction[];
  reactionCounts: Record<ReactionType, number>;
  userReaction?: ReactionType | null;
  comments: Comment[] | string[];
  likesCount: number;
  commentsCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  post: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: "like" | "comment" | "follow" | "reaction";
  post?: Post;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
}

export const FEELINGS = [
  { emoji: "😊", label: "happy" },
  { emoji: "😢", label: "sad" },
  { emoji: "😍", label: "loved" },
  { emoji: "😂", label: "amused" },
  { emoji: "😡", label: "angry" },
  { emoji: "😎", label: "cool" },
  { emoji: "🥳", label: "celebrating" },
  { emoji: "😴", label: "tired" },
  { emoji: "🤔", label: "thoughtful" },
  { emoji: "🙏", label: "grateful" },
  { emoji: "😤", label: "motivated" },
  { emoji: "🥰", label: "blessed" },
];

export const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: "like", emoji: "👍", label: "Like", color: "text-blue-500" },
  { type: "love", emoji: "❤️", label: "Love", color: "text-red-500" },
  { type: "haha", emoji: "😂", label: "Haha", color: "text-yellow-500" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-yellow-500" },
  { type: "sad", emoji: "😢", label: "Sad", color: "text-yellow-500" },
  { type: "angry", emoji: "😡", label: "Angry", color: "text-orange-500" },
];
