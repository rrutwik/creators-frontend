import React from "react";

function ChatMessage({ message }: { message: any}) {
  return (
    <div className="chat-message">
      <p>{message.text}</p>
      <span className="message-time">{message.timestamp}</span>
    </div>
  );
}

export default ChatMessage;
