import { useCallback, useEffect, useRef, useState } from 'react';
import { getChat, sendMessage } from '../api';
import { ChatSession } from '../interfaces';
import { Button, TextField, useTheme, Box, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Import Material-UI Send Icon


function ChatModel({
    chatSelectionId,
    botSelection,
    setOpenRechargeOption,
    setRefreshSideBarList,
    setChatSelectionId,
}: {
    chatSelectionId: string | null;
    botSelection: string | null;
    setOpenRechargeOption: (ans: boolean) => void;
    setRefreshSideBarList: (ans: boolean) => void;
    setChatSelectionId: (chatId: string) => void;
}) {
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const [newMessage, setNewMessage] = useState(''); // To store the new message typed by the user
    const [loading, setLoading] = useState(false); // To show loading while sending a message
    const theme = useTheme();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatSession?.messages]);

    // Polling to fetch chat session until last message is from the bot
    const fetchChatSession = useCallback(async (chatSelectionId?: string | null) => {
        if (!chatSelectionId) {
            setChatSession(null);
            return;
        }
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

    const startPolling = useCallback(
        async (chatUuid?: string) => {
            if (!chatUuid) return;
            const intervalId = setInterval(async () => {
                console.log(`Polling... ${chatUuid}`); // Debug log to confirm polling happens
                const stopPolling = await fetchChatSession(chatUuid);
                if (stopPolling) {
                    setLoading(false);
                    console.log('Polling stopped');
                    clearInterval(intervalId!); // Stop polling when the condition is met
                }
            }, 5000); // Poll every 5 seconds
            return () => {
                return clearInterval(intervalId);
            };
        },
        [fetchChatSession]
    );

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
        } catch (error: any) {
            if (error?.response?.data?.status === '1000') {
                window.alert(error?.response?.data?.message);
                setOpenRechargeOption(true);
            }
            console.error('Error sending message:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatSession(chatSelectionId);
    }, [chatSelectionId, fetchChatSession]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                width: '100vw',
                height: '100vh',
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.disabled,
                padding: '10px'
            }}
        >
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: { xs: '100%', md: '60%' },
                height: '100vh',
            }}
        >
            <Box
                sx={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                }}
            >
                <Typography variant="h5" component="h1">
                    Chat with {botSelection ?? 'Shri Krishna'}
                </Typography>
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px'
                }}
            >
                {chatSession?.messages.length
                    ? chatSession.messages.map((message, index) => (
                          <Box
                              key={index}
                              sx={{
                                  alignSelf: message.role === 1 ? 'flex-end' : 'flex-start',
                                  maxWidth: '80%',
                                  backgroundColor:
                                      message.role === 1
                                          ? theme.palette.primary.light
                                          : theme.palette.background.paper,
                                  padding: '10px',
                                  borderRadius: '10px',
                                  color:
                                      message.role === 1
                                          ? theme.palette.primary.contrastText
                                          : theme.palette.text.primary,
                              }}
                          >
                              <Typography>{message.text}</Typography>
                          </Box>
                      ))
                    : null}
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '25px',
                    boxShadow: theme.shadows[2],
                }}
            >
                <TextField
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        borderRadius: '10px',
                        maxHeight: '150px',
                        flex: '4 1 0%',
                        overflowY: 'auto',
                        padding: '10px', // Adjust padding for better spacing
                        fontSize: '0.8rem', // 80% of the default text size
                        input: {
                            color: theme.palette.text.primary,
                        },
                    }}
                    multiline={true}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // Prevent default newline behavior
                            handleSendMessage(); // Call the send message function
                        }
                    }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <Button
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        minWidth: '50px', // Ensure a compact, clean button size
                        height: '60%',
                        flex: '1 1 0%',
                        fontSize: '1rem', // Maintain a clear button size
                        padding: '10px 20px',
                        borderRadius: '25px',
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                        '&:disabled': {
                            backgroundColor: theme.palette.action.disabledBackground,
                            color: theme.palette.action.disabled,
                        },
                    }}
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                >
                    {loading ? <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} /> : <SendIcon sx={{ fontSize: '1.5rem' }} />}
                </Button>
            </Box>
        </Box>
        </Box>
    );
}

export default ChatModel;
