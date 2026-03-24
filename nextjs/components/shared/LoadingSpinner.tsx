export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <div className="relative">
        <div className="h-8 w-8 rounded-full border-2 border-muted" />
        <div className="absolute top-0 left-0 h-8 w-8 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
    </div>
  );
}
