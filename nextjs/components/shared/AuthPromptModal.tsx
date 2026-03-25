"use client";

import { useRouter } from "next/navigation";
import { LogIn, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthPromptModal({
  open,
  onClose,
  message = "Sign in to interact with posts and people",
}: AuthPromptModalProps) {
  const router = useRouter();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">V</span>
          </div>

          <div>
            <h3 className="text-lg font-bold">Join Velora</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/login")}
              className="w-full h-11 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>

            <Button
              onClick={() => router.push("/register")}
              variant="outline"
              className="w-full h-11 rounded-xl font-medium"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
