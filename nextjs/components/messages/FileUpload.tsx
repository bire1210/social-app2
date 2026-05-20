"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Paperclip, 
  Image, 
  Video, 
  FileText, 
  Music, 
  X,
  File
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFileSize, getFilePreviewUrl, isImageFile } from "@/lib/fileUtils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes, default 50MB
}

// Memoized file type configurations for better performance
const FILE_TYPES = {
  image: { accept: "image/*", icon: Image, label: "Photo" },
  video: { accept: "video/*", icon: Video, label: "Video" },
  audio: { accept: "audio/*", icon: Music, label: "Audio" },
  document: { 
    accept: ".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx", 
    icon: FileText, 
    label: "Document" 
  },
  any: { accept: "*", icon: File, label: "Any File" }
} as const;

export function FileUpload({ onFileSelect, disabled, maxSize = 50 * 1024 * 1024 }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`File too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }
      onFileSelect(file);
    }
    // Reset input for reusability
    e.target.value = "";
  }, [onFileSelect, maxSize]);

  // Memoize menu items to prevent re-renders
  const menuItems = useMemo(() => 
    Object.entries(FILE_TYPES).map(([key, config]) => {
      const IconComponent = config.icon;
      return (
        <DropdownMenuItem 
          key={key}
          onClick={() => handleFileSelect(config.accept)}
        >
          <IconComponent className="h-4 w-4 mr-2" />
          {config.label}
        </DropdownMenuItem>
      );
    }), [handleFileSelect]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {menuItems}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // Memoize file icon to prevent recalculation
  const FileIcon = useMemo(() => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type.startsWith("video/")) return Video;
    if (file.type.startsWith("audio/")) return Music;
    if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text")) {
      return FileText;
    }
    return File;
  }, [file.type]);

  // Memoize file size to prevent recalculation
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);

  // Generate preview for images only once
  useState(() => {
    if (isImageFile(file)) {
      getFilePreviewUrl(file)
        .then(setPreview)
        .catch(() => setPreview(null));
    }
  });

  return (
    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border border-border">
      {preview ? (
        <img 
          src={preview} 
          alt="Preview" 
          className="h-12 w-12 rounded object-cover"
          loading="lazy" // Performance: lazy load images
        />
      ) : (
        <div className="h-12 w-12 rounded bg-accent flex items-center justify-center">
          <FileIcon className="h-4 w-4" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{fileSize}</p>
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}