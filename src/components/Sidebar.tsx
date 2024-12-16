import React, { useEffect, useState } from 'react';
import {
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    ListItemButton,
    Button,
    Divider,
    Tooltip,
    IconButton,
    useTheme,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatSelectionModel from './ChatSelectionModel';
import AddCredits from './AddCredits';
import { User } from '../interfaces';
import { logout } from '../api';
import './SideBar.css';

function Sidebar({
    user,
    open: sidebarOpen,
    onClose,
    openRechargeOption,
    chatSelectionId,
    setChatSelectionId,
    setBotSelectionId,
}: {
    chatSelectionId: string | null;
    open: boolean;
    user: User;
    openRechargeOption: boolean,
    onClose: () => void;
    setChatSelectionId: (chatId: string) => void;
    setBotSelectionId: (botId: string) => void;
}) {
    const [activeTab, setActiveTab] = useState(openRechargeOption ? 'settings' :'chats');
    console.log({
        activeTab: activeTab
    });
    const theme = useTheme();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/'; // Redirect to the base URL
    };

    const TabButton = ({
        label,
        icon,
        active,
        onClick,
    }: {
        label: string;
        icon: React.ReactNode;
        active: boolean;
        onClick: () => void;
    }) => (
        <ListItemButton
            selected={active}
            onClick={onClick}
            sx={{
                '&.Mui-selected': { backgroundColor: 'primary.light', color: 'primary.contrastText' },
                '&:hover': { backgroundColor: 'action.hover' },
            }}
        >
            <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary' }}>
                {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
        </ListItemButton>
    );

    useEffect(() => {
        if (openRechargeOption) {
            setActiveTab('settings');
        }
    }, [openRechargeOption]);

    return (
        <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={onClose}
            variant="temporary"
            ModalProps={{ keepMounted: true }} // Improves performance on mobile
            PaperProps={{
                sx: {
                    width: { xs: '50%', sm: '300px', md: '20%' },
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Button
                        startIcon={<LogoutIcon />}
                        variant="outlined"
                        onClick={handleLogout}
                    >
                        Log Out
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Tooltip title="Close Sidebar">
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </div>
            {/* Navigation */}
            <List>
                <TabButton
                    label="Chats"
                    icon={<ChatIcon />}
                    active={activeTab === 'chats'}
                    onClick={() => setActiveTab('chats')}
                />
                <TabButton
                    label="Settings"
                    icon={<SettingsIcon />}
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </List>

            <Divider />

            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <div style={{
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[3],
                    maxHeight: '100%'
                }}>
                {activeTab === 'chats' && (
                    <ChatSelectionModel
                        chatSelectionId={chatSelectionId}
                        setChatSelectionId={setChatSelectionId}
                        setBotSelectionId={setBotSelectionId}
                    />
                )}
                {activeTab === 'settings' && (
                    <Box sx={{
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        boxShadow: theme.shadows[3],
                        maxHeight: '100%'
                    }}>
                        <Typography variant="h6" 
                            sx={{
                                width: '100%',
                                alignContent: 'center'
                            }}
                            gutterBottom>
                            Settings
                        </Typography>
                        <AddCredits user={user} />
                    </Box>
                )}
                </div>
            </Box>

            <Divider />

        </Drawer>
    );
}

export default Sidebar;
