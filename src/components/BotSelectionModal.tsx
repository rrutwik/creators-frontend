import React, { useEffect, useState } from 'react';
import {
    Box,
    Modal,
    Typography,
    Button,
    CircularProgress,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    useTheme,
} from '@mui/material';
import { getAvailableBots } from '../api'; // API to fetch available bots
import { Bot } from '../interfaces';

interface BotSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelectBot: (bot: Bot) => void;
}

const BotSelectionModal: React.FC<BotSelectionModalProps> = ({ open, onClose, onSelectBot }) => {
    const [bots, setBots] = useState<Bot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    const fetchBots = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAvailableBots();
            console.log({
                response
            })
            setBots(response.records || []);
        } catch (err) {
            setError('Failed to fetch bots. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchBots();
    }, [open]);

    const handleSelectBot = (botId: string) => {
        const selectedBot = bots.find(bot => bot._id.toString() === botId.toString());
        if (!selectedBot) {
            return;
        }
        onSelectBot(selectedBot); // Pass the selected bot ID back to the parent
        onClose(); // Close the modal
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" gutterBottom sx={{
                    color: theme.palette.text.primary
                }}>
                    Select a Bot
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography gutterBottom sx={{
                        color: theme.palette.text.secondary
                    }}>{error}</Typography>
                ) : bots.length > 0 ? (
                    <List sx={{
                        color: theme.palette.text.secondary
                    }}>
                        {bots.map((bot) => (
                            <React.Fragment key={bot._id}>
                                <ListItemButton onClick={() => handleSelectBot(bot._id)}>
                                    <ListItemText
                                        primary={bot.name}
                                    />
                                </ListItemButton>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography>No bots available to select.</Typography>
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onClose} variant="contained" color="secondary">
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default BotSelectionModal;
