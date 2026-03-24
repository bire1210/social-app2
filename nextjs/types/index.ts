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

export interface Post {
  _id: string;
  author: User;
  content: string;
  image: string;
  likes: string[];
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
  type: "like" | "comment" | "follow";
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
