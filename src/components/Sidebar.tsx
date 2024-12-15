import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    ListItemButton,
    Button,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatSelectionModel from './ChatSelectionModel';
import AddCredits from './AddCredits';
import { User } from '../interfaces';
import { logout } from '../api';

function Sidebar({
    user,
    onClose,
    chatSelectionId,
    setChatSelectionId,
    setBotSelectionId,
}: {
    chatSelectionId: string | null;
    user: User,
    onClose: () => void;
    setChatSelectionId: (chatId: string) => void;
    setBotSelectionId: (botId: string) => void;
}) {
    const [activeTab, setActiveTab] = useState('chats');

    const handleLogout = () => {
        logout();
        window.location.href = '/'; // Redirect to the base URL
    };

    return (
        <Drawer
            variant='permanent'
            sx={{
                width: '20%',
                '& .MuiDrawer-paper': { width: '20%', boxSizing: 'border-box' },
            }}
        >
            <Box
                sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <Typography variant='h6'>Sidebar</Typography>
                <Button onClick={() => handleLogout()}>Log Out</Button>
            </Box>
            <List>
                <ListItemButton onClick={() => setActiveTab('chats')}>
                    <ListItemIcon>
                        <ChatIcon />
                    </ListItemIcon>
                    <ListItemText primary='Chats' />
                </ListItemButton>
                <ListItemButton onClick={() => setActiveTab('settings')}>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary='Settings' />
                </ListItemButton>
            </List>
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                {activeTab === 'chats' && (
                    <ChatSelectionModel
                        chatSelectionId={chatSelectionId}
                        setChatSelectionId={setChatSelectionId}
                        setBotSelectionId={setBotSelectionId}
                    />
                )}
                {activeTab === 'settings' && 
                    <div>
                        <Typography variant='h6'>Settings</Typography>
                        <AddCredits user={user}></AddCredits>
                    </div>
                }
            </Box>
        </Drawer>
    );
}

export default Sidebar;
