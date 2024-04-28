import { useEffect, useState } from "react";
import { getChat } from "../api";
import { ChatSession } from "../interfaces";
import './ChatModel.css';  // Ensure styles are linked correctly

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

function ChatModel({ chatId, botId }: { chatId: string, botId: string}) {
  const [chatSession, setChatSession] = useState<ChatSession>({
    uuid: '',
    user_id: '',
    messages: []
  });

  useEffect(() => {
    const fetchChatSession = async () => {
      if (!chatId) return;
      try {
        const response = await getChat(chatId);
        const data = await response.json();
        setChatSession(data.data);
      } catch (error) {
        console.error("Error fetching chat session:", error);
      }
    };

    fetchChatSession();
  }, [chatId]);

  if (!chatSession) {
    return <div className="chat-loading">Unable to load chat or chat is not selected.</div>;
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Chat with {botId ?? 'lol'}</h1>
      </header>
      <MainContainer>
      <ChatContainer>
        <MessageList>
        {chatSession.messages.map((message, index) => (
          <Message
            model={{
              message: message.message,
              sentTime: message.timestamp.toISOString(),
              direction: message.role === "user" ? "outgoing" : "incoming",
              position: "single"
            }}
          />
        ))}
        </MessageList>
        <MessageInput placeholder="Type message here" />
      </ChatContainer>
    </MainContainer>
    </div>
  );
}

export default ChatModel;
