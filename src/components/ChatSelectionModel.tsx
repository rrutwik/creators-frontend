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
} from '@mui/material';
import { Chat, ChatSelectionModelProps } from '../interfaces';
import { getPastChats } from '../api';

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
    setBotSelectionId: setBotSelection,
}: ChatSelectionModelProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [groupedChats, setGroupedChats] = useState<any>({});
    const observer = React.useRef<IntersectionObserver>();

    const fetchChats = useCallback(async () => {
        setLoading(true);
        try {
            const chatResponse = await getPastChats(chats.length, 10);
            const newChats = chatResponse.records;
            if (newChats.length > 0) {
                setChats((prev) =>
                    [...prev, ...newChats].filter((value, index, array) => {
                        return array.findIndex((item) => item.uuid === value.uuid) === index;
                    })
                );
            }
            setHasMore(newChats.length > 0);
        } finally {
            setLoading(false);
        }
    }, [chats.length]);

    const lastChatElementRef = useCallback(
        (node: any) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchChats();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, fetchChats]
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
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <Typography variant='h6' sx={{ my: 2, mx: 1 }}>
                Chat Selection
            </Typography>
            <Button onClick={() => setChatSelectionId('')}>Add Chat</Button>

            <List sx={{ overflow: 'auto', maxHeight: '500px' }}>
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
                                        primary={chat.name}
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
