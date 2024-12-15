import { useCallback, useEffect, useState } from 'react';
import { getChat, sendMessage } from '../api'; // Ensure this is a function to get chat data from the API
import { ChatSession } from '../interfaces'; // Ensure this interface defines message structure
import './ChatModel.css'; // Ensure styles are linked correctly

function ChatModel({
    chatSelectionId,
    botSelection,
    setRefreshSideBarList,
    setChatSelectionId,
}: {
    chatSelectionId: string | null;
    botSelection: string | null;
    setRefreshSideBarList: (ans: boolean) => void;
    setChatSelectionId: (chatId: string) => void;
}) {
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const [newMessage, setNewMessage] = useState(''); // To store the new message typed by the user
    const [loading, setLoading] = useState(false); // To show loading while sending a message

    // Polling to fetch chat session until last message is from the bot
    const fetchChatSession = useCallback(async (chatSelectionId?: string | null) => {
        if (!chatSelectionId) {
            setChatSession(null);
            return;
        };
        try {
            const response = await getChat(chatSelectionId);

            const data = response.data;

            setChatSession(data);

            // Check if the last message is from the bot (role 2)
            if (data.messages.length && data.messages[data.messages.length - 1].role === 2) {
                return true; // Stop polling when the last message is from the bot
            }

            return false; // Continue polling
        } catch (error) {
            console.error('Error fetching chat session:', error);
            return false;
        }
    }, []);

    const startPolling = useCallback(async (chatUuid?: string) => {
        if (!chatUuid) return;
        const intervalId = setInterval(async () => {
            console.log(`Polling... ${chatUuid}`); // Debug log to confirm polling happens
            const stopPolling = await fetchChatSession(chatUuid);
            if (stopPolling) {
                console.log('Polling stopped');
                clearInterval(intervalId!); // Stop polling when the condition is met
            }
        }, 5000); // Poll every 5 seconds
        return () => {
            return clearInterval(intervalId);
        }
    }, [fetchChatSession]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return; // Don't send empty messages

        setLoading(true);

        try {
            // Send new message to the chat API
            const response = await sendMessage(newMessage, chatSession?.uuid);
            const updatedSession = response.data;
            setChatSession(updatedSession);
            setNewMessage(''); // Reset the input field after sending the message
            // Start polling for new messages
            if (updatedSession?.uuid) {
                startPolling(updatedSession.uuid);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatSession(chatSelectionId);
    }, [chatSelectionId, fetchChatSession])

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1>Chat with {botSelection ?? 'Chatbot'}</h1>
            </header>
            <div className="chat-messages">
                {chatSession?.messages.length
                    ? chatSession.messages.map((message, index) => (
                          <div
                              key={index}
                              className={`chat-message ${message.role === 1 ? 'user-message' : 'bot-message'}`}
                          >
                              <p>{message.text}</p>
                          </div>
                      ))
                    : null}
            </div>
            <div className="chat-input-container">
                <textarea
                    className="chat-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default ChatModel;
