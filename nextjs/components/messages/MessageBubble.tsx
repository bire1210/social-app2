"use client";

import { memo } from "react";
import { Message } from "@/types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FileDisplay } from "@/components/shared/FileDisplay";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
}

// Memoized component to prevent unnecessary re-renders
export const MessageBubble = memo(function MessageBubble({ 
  message, 
  isMe, 
  showAvatar = true 
}: MessageBubbleProps) {
  
  const renderContent = () => {
    if (message.messageType === "text") {
      return message.content;
    }

    if (message.file) {
      return (
        <FileDisplay
          file={message.file}
          messageType={message.messageType}
          caption={message.content}
          showDownload={true}
        />
      );
    }

    return null;
  };

  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && showAvatar && (
        <UserAvatar 
          src={message.sender.avatar} 
          fallback={message.sender.fullName} 
          className="h-7 w-7 shrink-0" 
        />
      )}
      
      <div
        className={`max-w-[70%] rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-gradient-to-r from-red-500 to-yellow-400 text-white rounded-br-sm"
            : "bg-accent rounded-bl-sm"
        } ${message.messageType === "text" ? "px-3 py-2" : "p-2"}`}
      >
        {renderContent()}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";