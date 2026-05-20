export const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📋";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z")) return "🗜️";
  if (mimeType.includes("text")) return "📄";
  return "📎";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileCategory = (mimeType: string): "image" | "video" | "audio" | "document" | "file" => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  ) {
    return "document";
  }
  return "file";
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith("video/");
};

export const isAudioFile = (file: File): boolean => {
  return file.type.startsWith("audio/");
};

export const getFilePreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error("File is not an image"));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};