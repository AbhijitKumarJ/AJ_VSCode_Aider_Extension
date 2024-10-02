import React from "react";
import { CodeBlock } from "./CodeBlock";

type MessageSender = "User" | "Aider";

interface ChatMessageProps {
  sender: MessageSender;
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  content,
}) => {
  const renderContent = () => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      const language = match[1] || "plaintext";
      const code = match[2];
      parts.push(
        <CodeBlock key={match.index} language={language} code={code} />,
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`chat-message ${sender.toLowerCase()}-message`}>
      <div className="message-sender">{sender}</div>
      <div className="message-content">{renderContent()}</div>
    </div>
  );
};
