"use client";

import { useState } from "react";
import { Copy, Check, X, Twitter, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
}

export function ShareModal({ open, onClose, postId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${postId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: "twitter" | "facebook" | "whatsapp") => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const text = encodeURIComponent("Check out this post!");
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${text}%20${encodedUrl}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl border border-border shadow-lg max-w-sm w-full mx-4 p-6 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Share Post</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Post Link</label>
          <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-3 border border-border">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
              title="Copy link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Share on</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white text-sm font-medium transition-colors"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white text-sm font-medium transition-colors"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full rounded-lg"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
