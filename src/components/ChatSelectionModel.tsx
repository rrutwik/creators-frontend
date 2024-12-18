import React, { useCallback, useEffect, useState } from 'react';
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
    const [groupedChats, setGroupedChats] = useState<any>({});
    const observer = React.useRef<IntersectionObserver>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useTheme(); // Access the current theme
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleSelectBot = (bot: Bot) => {
        setSelectedBot(bot);
        setChatSelectionId('');
        setSidebarOpen(false);
        console.log(`Selected Bot ID: ${bot._id}`);
    };

    const fetchChats = useCallback(async () => {
        if (loading || !hasMore) return; // Avoid fetching if already loading or no more data
        setLoading(true);
        try {
            const chatResponse = await getPastChats(chats.length, 10);
            const newChats: Chat[] = chatResponse.records;
            setChats((prev) => [...prev, ...newChats.filter((chat) => !prev.find((c) => c.uuid === chat.uuid))]);
            setHasMore(chats.length < chatResponse.total);
        } finally {
            setLoading(false);
        }
    }, [chats, loading, hasMore]);

    const lastChatElementRef = useCallback(
        (node: any) => {
            if (loading) return; // Prevent multiple triggers while loading
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchChats(); // Trigger fetch when last element is visible
                }
            });

            if (node) observer.current.observe(node);
        },
        [fetchChats, hasMore, loading]
    );

    // Group chats by date range
    useEffect(() => {
        const groups: any = {};
        chats.forEach((chat) => {
            const group = formatDateGroup(chat.updatedAt);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(chat);
        });
        setGroupedChats(groups);
    }, [chats]);

    useEffect(() => {
        fetchChats();
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [fetchChats]);

    const handleChatChange = useCallback(
        (uuid: string) => {
            setChatSelectionId(uuid);
        },
        [setChatSelectionId]
    );

    return (
        <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                boxShadow: theme.shadows[3],
            }}>
            <Button onClick={handleOpenModal}>Select Bot</Button>
            <BotSelectionModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSelectBot={handleSelectBot}
            />
            <List sx={{ overflow: 'auto' }}>
                {Object.keys(groupedChats).map((group, index) => (
                    <div key={group}>
                        <Typography variant='subtitle1' sx={{ mt: 2, ml: 1, fontWeight: 'bold' }}>
                            {group}
                        </Typography>
                        {groupedChats[group].map((chat: Chat, chatIndex: number) => (
                            <React.Fragment key={chat.uuid}>
                                <ListItemButton
                                    style={{
                                        backgroundColor:
                                            chat.uuid === chatSelectionId
                                                ? '#333'
                                                : 'transparent', // Dark selection color
                                        color:
                                            chat.uuid === chatSelectionId ? '#fff' : 'inherit', // Adjust text color for contrast
                                    }}
                                    ref={
                                        chatIndex === groupedChats[group].length - 1 &&
                                        index === Object.keys(groupedChats).length - 1
                                            ? lastChatElementRef
                                            : null
                                    }
                                    onClick={() => handleChatChange(chat.uuid)}
                                >
                                    <ListItemText
                                        primary={`${chat.name} - ${chat.chatbot_id?.name}`}
                                        secondary={`Updated: ${new Date(
                                            chat.updatedAt
                                        ).toLocaleDateString()}`}
                                    />
                                </ListItemButton>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </div>
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
