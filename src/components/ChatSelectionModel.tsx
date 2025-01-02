import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    Box,
    List,
    ListItemText,
    Divider,
    CircularProgress,
    Typography,
    Button,
    ListItemButton,
    useTheme,
} from '@mui/material';
import { Bot, Chat, ChatSelectionModelProps } from '../interfaces';
import { getPastChats } from '../api';
import BotSelectionModal from './BotSelectionModal';

// Helper function to format the date into different timeframes
const formatDateGroup = (date: Date) => {
    const today = new Date();
    const chatDate = new Date(date);
    const diffTime = today.getTime() - chatDate.getTime();
    const daysDiff = diffTime / (1000 * 3600 * 24);

    if (daysDiff < 1) return 'Today';
    if (daysDiff < 2) return 'Yesterday';
    if (daysDiff < 7) return 'Last Week';
    if (daysDiff < 30) return 'Last Month';
    return 'Older';
};

function ChatSelectionModel({
    chatSelectionId,
    setChatSelectionId,
    setSidebarOpen,
    setSelectedBot,
}: ChatSelectionModelProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = React.useRef<IntersectionObserver>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useTheme();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSelectBot = (bot: Bot) => {
        setSelectedBot(bot);
        setChatSelectionId('');
        setSidebarOpen(false);
        console.log(`Selected Bot ID: ${bot._id}`);
    };

    const fetchChats = useCallback(async (offset: number) => {
        setLoading(true);
        try {
            const chatResponse = await getPastChats(offset, 10);
            const newChats: Chat[] = chatResponse.records;

            setChats((prevChats) => [
                ...prevChats,
                ...newChats.filter((chat) => !prevChats.some((c) => c.uuid === chat.uuid)),
            ]);
            setHasMore(offset + newChats.length < chatResponse.total);
        } finally {
            setLoading(false);
        }
    }, []);

    const lastChatElementRef = useCallback(
        (node: any) => {
            if (loading) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchChats(chats.length);
                }
            });

            if (node) observer.current.observe(node);
        },
        [chats.length, fetchChats, hasMore, loading]
    );

    useEffect(() => {
        fetchChats(0); // Initial fetch
        return () => observer.current?.disconnect();
    }, [fetchChats]);

    const groupedChats = useMemo(() => {
        const groups: Record<string, Chat[]> = {};
        chats.forEach((chat) => {
            const group = formatDateGroup(chat.updatedAt);
            if (!groups[group]) groups[group] = [];
            groups[group].push(chat);
        });
        return groups;
    }, [chats]);

    const handleChatChange = useCallback(
        (uuid: string) => {
            setChatSelectionId(uuid);
        },
        [setChatSelectionId]
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                boxShadow: theme.shadows[3],
            }}
        >
            <Button onClick={handleOpenModal}>Select Bot</Button>
            <BotSelectionModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSelectBot={handleSelectBot}
            />
            <List sx={{ overflow: 'auto', height: '100%' }}>    
            {   chats.map((chat: Chat) => (
                <React.Fragment key={chat.uuid}>
                    <ListItemButton
                        style={{
                            backgroundColor:
                                chat.uuid === chatSelectionId
                                    ? '#333'
                                    : 'transparent',
                            color: chat.uuid === chatSelectionId ? '#fff' : 'inherit',
                        }}
                        onClick={() => handleChatChange(chat.uuid)}
                    >
                        <ListItemText
                            primary={`${chat.name} - ${chat.chatbot_id?.name}`}
                            secondary={`Updated: ${new Date(
                                chat.updatedAt
                            ).toLocaleDateString()}`}
                        />
                    </ListItemButton>
                    {/* <Divider /> */}
                </React.Fragment>
            ))}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            )}
            </List>
        </Box>
    );
}

export default ChatSelectionModel;
