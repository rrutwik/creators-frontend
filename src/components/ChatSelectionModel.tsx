import React, { useCallback, useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Divider, CircularProgress, Typography } from '@mui/material';
import { Chat, ChatSelectionModelProps } from '../interfaces';
import { getPastChats } from '../api';

function ChatSelectionModel({ setChatSelection, setBotSelection }: ChatSelectionModelProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = React.useRef<IntersectionObserver>();
    const fetchChats = useCallback(async () => {
        setLoading(true);
        try {
            const newChats = await getPastChats(chats.length, 10); // Adjust your API to fetch chats with pagination
            console.log(newChats);
            setChats(prev => [...prev, ...newChats]);
            setHasMore(newChats.length > 0);
        } finally {
            setLoading(false);
        }
    }, [chats.length]);

    const lastChatElementRef = useCallback((node: any) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchChats();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchChats]);

    useEffect(() => {
        fetchChats();
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [fetchChats]);

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ my: 2, mx: 1 }}>
                Chat Selection
            </Typography>
            <List sx={{ overflow: 'auto' }}>
                {chats.map((chat, index) => (
                    <React.Fragment key={chat.id}>
                        <ListItem button ref={index === chats.length - 1 ? lastChatElementRef : null} onClick={() => setChatSelection(chat.id)}>
                            <ListItemText primary={chat.title} secondary={`Updated: ${new Date(chat.updatedAt).toLocaleDateString()}`} />
                        </ListItem>
                        <Divider />
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
