"use client";

import { memo, useMemo, useCallback } from "react";
import { UPLOADS_URL } from "@/lib/constants";
import { formatFileSize as formatBytes } from "@/lib/fileUtils";
import { 
  Download, 
  FileText, 
  File, 
  Music, 
  Video,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";

interface FileInfo {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface FileDisplayProps {
  file: FileInfo;
  messageType: "image" | "video" | "audio" | "document" | "file";
  caption?: string;
  className?: string;
  showDownload?: boolean;
  maxWidth?: string;
}

// Memoized component for better performance
export const FileDisplay = memo(function FileDisplay({ 
  file, 
  messageType, 
  caption, 
  className = "",
  showDownload = true,
  maxWidth = "max-w-xs"
}: FileDisplayProps) {
  
  // Memoize file URL to prevent recalculation
  const fileUrl = useMemo(() => {
    if (!file.url) return "";
    if (file.url.startsWith("http")) return file.url;
    return `${UPLOADS_URL}${file.url}`;
  }, [file.url]);

  // Memoize file size to prevent recalculation
  const fileSize = useMemo(() => formatBytes(file.size), [file.size]);

  // Memoize file icon based on mime type
  const FileIcon = useMemo(() => {
    if (file.mimeType.startsWith("image/")) return ImageIcon;
    if (file.mimeType.startsWith("video/")) return Video;
    if (file.mimeType.startsWith("audio/")) return Music;
    if (file.mimeType.includes("pdf") || file.mimeType.includes("document") || file.mimeType.includes("text")) {
      return FileText;
    }
    return File;
  }, [file.mimeType]);

  // Memoized download handler
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.originalName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileUrl, file.originalName]);

  // Memoized open handler for images
  const handleOpen = useCallback(() => {
    window.open(fileUrl, "_blank");
  }, [fileUrl]);

  const renderContent = () => {
    switch (messageType) {
      case "image":
        return (
          <div className={maxWidth}>
            <img
              src={fileUrl}
              alt={file.originalName}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleOpen}
              loading="lazy" // Performance: lazy load images
            />
            {caption && (
              <p className="mt-2 text-sm">{caption}</p>
            )}
          </div>
        );

      case "video":
        return (
          <div className={maxWidth}>
            <video
              src={fileUrl}
              controls
              className="rounded-lg max-w-full h-auto"
              preload="metadata" // Performance: only load metadata initially
            >
              Your browser does not support the video tag.
            </video>
            {caption && (
              <p className="mt-2 text-sm">{caption}</p>
            )}
          </div>
        );

      case "audio":
        return (
          <div className={maxWidth}>
            <div className="flex items-center gap-3 p-3 bg-black/10 rounded-lg">
              <Music className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.originalName}</p>
                <p className="text-xs text-muted-foreground">{fileSize}</p>
              </div>
              {showDownload && (
                <button
                  onClick={handleDownload}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
            <audio 
              src={fileUrl} 
              controls 
              className="w-full mt-2"
              preload="metadata" // Performance: only load metadata initially
            >
              Your browser does not support the audio tag.
            </audio>
            {caption && (
              <p className="mt-2 text-sm">{caption}</p>
            )}
          </div>
        );

      case "document":
      case "file":
        return (
          <div className={maxWidth}>
            <div className="flex items-center gap-3 p-3 bg-black/10 rounded-lg">
              <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.originalName}</p>
                <p className="text-xs text-muted-foreground">{fileSize}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={handleOpen}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors flex items-center justify-center"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                {showDownload && (
                  <button
                    onClick={handleDownload}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors flex items-center justify-center"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {caption && (
              <p className="mt-2 text-sm">{caption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
});

FileDisplay.displayName = "FileDisplay";