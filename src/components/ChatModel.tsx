import { useCallback, useEffect, useRef, useState } from 'react';
import { getChat, getUserDetails, sendMessage } from '../api';
import { Bot, ChatSession, ChatMessage } from '../interfaces';
import { Button, TextField, useTheme, Box, Typography, CircularProgress, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Message from './message/Message';
import React from 'react';

window.speechSynthesis.getVoices();

function ChatModel({
    chatSelectionId,
    selectedBot,
    setOpenRechargeOption,
}: {
    chatSelectionId: string | null;
    selectedBot: Bot | null;
    setOpenRechargeOption: (ans: boolean) => void;
    setRefreshSideBarList: (ans: boolean) => void;
    setChatSelectionId: (chatId: string) => void;
}) {
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Store messages separately
    const [newMessage, setNewMessage] = useState(''); // To store the new message typed by the user
    const [loading, setLoading] = useState(false); // To show loading while sending a message
    const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

    const theme = useTheme();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null); // To track the current speech instance

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    const stopSpeaking = useCallback(() => {
        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
            speechSynthesisRef.current = null;
            setCurrentMessageId(null); // Clear the current speaking message
        }
    }, []);

    useEffect(() => {
        return () => {
            stopSpeaking(); // Stop speaking on unmount or refresh
        };
    }, [chatSelectionId, stopSpeaking]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getVoiceForBot = (botName?: string, gender: "male" | "female" = "female"): SpeechSynthesisVoice | null => {
        let voices = window.speechSynthesis.getVoices();
        const voiceMap: Record<string, { male: string; female: string }> = {
            "Bhagwat Gita": {
                male: "Rishi",           // Indian English Male
                female: "Lekha",         // Hindi Female Voice
            },
            "Quran": {
                male: "Majed",           // Arabic Male Voice
                female: "Google UK English Female", // Female fallback in English
            },
            "Bible": {
                male: "Aaron",           // US English Male
                female: "Samantha",      // US English Female
            },
            "Tao Te Ching": {
                male: "Google 普通话（中国大陆）", // Mandarin Male
                female: "Tingting",      // Mandarin Female Voice
            },
            "Tripitaka": {
                male: "Rishi",           // Indian English Male
                female: "Lekha",         // Hindi Female Voice
            },
            "Guru Granth Sahib": {
                male: "Rishi",           // Indian Male Voice
                female: "Lekha",         // Hindi Female Voice
            },
            "default": {
                male: "Rishi",           // Indian Male Voice
                female: "Lekha",         // Hindi Female Voice
            }
        };

        const selectedVoiceName = voiceMap[botName ?? "default"]?.[gender];
        return (
            voices.find((voice) => voice.name === selectedVoiceName) ||
            voices.find((voice) => voice.default) ||
            null
        );
    };

    // Function to handle speech synthesis
    const speak = useCallback((text: string, messageId: string, botName?: string) => {

        stopSpeaking(); // Stop any ongoing speech

        if (!window.speechSynthesis) return;
    
        const utterance = new SpeechSynthesisUtterance(text);

        const selectedVoice = getVoiceForBot(botName);

        console.log({
            selectedVoice
        });

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 1.0; // Set speech rate (1 is normal)
        utterance.pitch = 0.9; // Set speech pitch
        utterance.volume = 1; // Set speech volume
    
        setCurrentMessageId(messageId); // Track the current message being spoken
    
        utterance.onend = () => {
            setCurrentMessageId(null); // Reset when speaking ends
        };
    
        speechSynthesisRef.current = utterance; // Store the current speech instance
        window.speechSynthesis.speak(utterance);
    }, [stopSpeaking]);
    

    // Fetch only new messages
    const fetchNewMessages = useCallback(async (chatSelectionId?: string | null) => {

        if (!chatSelectionId) return true;

        try {
            const response = await getChat(chatSelectionId);
            const data = response.data;
            const _chatSession = data;
            if (!chatSession) {
                setChatSession({..._chatSession});
            }
            // Check if the last message is from the bot (role 2)
            if (data.messages.length && data.messages[data.messages.length - 1].role === 2) {
                const newMessage: ChatMessage = data.messages[data.messages.length - 1];
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                speak(newMessage.text, newMessage._id, chatSession?.chatbot_id?.name);
                return true; // Stop polling when the last message is from the bot
            }
            return false; // Continue polling
        } catch (error) {
            console.error('Error fetching new messages:', error);
            return false;
        }

    }, [chatSession, speak]);

    const fetchChatSession = useCallback(async (chatSelectionId?: string | null) => {
        if (!chatSelectionId) {
            setChatSession(null);
            setMessages([]);
            return;
        }
        try {
            const response = await getChat(chatSelectionId);
            const data = response.data;
            // Add default isSpeaking value
            const initializedMessages = data.messages.map((msg: ChatMessage) => ({
                ...msg,
                isSpeaking: false, // Default value
            }));
            setChatSession(data);
            setMessages(initializedMessages);
        } catch (error) {
            console.error('Error fetching chat session:', error);
        }
    }, []);

    const startPolling = useCallback(
        async (chatUuid?: string) => {
            if (!chatUuid) return;
            const intervalId = setInterval(async () => {
                console.log(`Polling... ${chatUuid}`); // Debug log to confirm polling happens
                const stopPolling = await fetchNewMessages(chatUuid);
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
        [fetchNewMessages]
    );

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return; // Don't send empty messages

        setLoading(true);

        try {
            // Send new message to the chat API
            const response = await sendMessage(newMessage, chatSession?.uuid, selectedBot?._id);
            const updatedSession: ChatSession = response.data;

            const anyNewMessage = updatedSession.messages.pop();
            if (anyNewMessage) {
                setMessages(prev => [...prev, anyNewMessage]);
            }
            setNewMessage(''); // Reset the input field after sending the message
            // Start polling for new messages
            if (updatedSession?.uuid) {
                startPolling(updatedSession.uuid);
            }
        } catch (error: any) {
            if (error?.response?.data?.status === '1000') {
                window.alert(error?.response?.data?.message);
                getUserDetails();
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
                    width: { 
                        xs: '100%', 
                        md: '60%' 
                    },
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
                        {selectedBot?.name ?? chatSession?.chatbot_id?.name ?? 'Select A Bot from List'}
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
                    {messages.map((message: ChatMessage, index) => (
                    <React.Fragment key={message._id}>
                        <Message
                            message={message}
                            currentMessageId={currentMessageId}
                            onPlay={speak}
                            onStop={stopSpeaking}
                            chatBotName={chatSession?.chatbot_id?.name}
                        />
                        {index < messages.length - 1 && <Divider sx={{ my: 2 }} />} {/* Adds a line divider between messages */}
                    </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center',
                        padding: '10px',
                        margin: '10px',
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
                            padding: '10px',
                            fontSize: '0.8rem',
                            input: {
                                color: theme.palette.text.primary,
                            },
                        }}
                        disabled={!(selectedBot?.name || chatSession?.chatbot_id?.name)}
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
                            minWidth: '50px',
                            height: '60%',
                            flex: '1 1 0%',
                            fontSize: '1rem',
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
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} /> : <SendIcon sx={{ fontSize: '1.5rem' }} />}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default ChatModel;
