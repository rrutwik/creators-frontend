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
import { logout } from '../api';
import './SideBar.css';

function Sidebar({
    open: sidebarOpen,
    onClose,
    openRechargeOption,
    chatSelectionId,
    setChatSelectionId,
    setBotSelectionId,
}: {
    chatSelectionId: string | null;
    open: boolean;
    openRechargeOption: boolean,
    onClose: () => void;
    setChatSelectionId: (chatId: string) => void;
    setBotSelectionId: (botId: string) => void;
}) {
    const [activeTab, setActiveTab] = useState(openRechargeOption ? 'settings' :'chats');

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
            className='testing'
            sx={{
                justifyContent: 'space-between',
                display: 'flex',
                '&.Mui-selected': { backgroundColor: 'primary.light', color: 'primary.contrastText' },
                '&:hover': { backgroundColor: 'action.hover' },
            }}
        >
            <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary' }}>
                {icon}
            </ListItemIcon>
            <ListItemText primary={label} sx={{
                width: '1px'
            }} />
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
                    width: { xs: '30%', sm: '20%', md: '20%' },
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
                        sx={{
                            fontSize: { xs: '1vw' }
                        }}
                        startIcon={<LogoutIcon />}
                        variant="contained"
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
            <List 
            sx={{
                width: 'parent'
            }}>
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
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingTop: '2px',
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        boxShadow: theme.shadows[3],
                        maxHeight: '100%'
                    }}>
                        <Typography variant="h6" 
                            sx={{
                            }}
                            gutterBottom>
                            Settings
                        </Typography>
                        <AddCredits />
                    </Box>
                )}
                </div>
            </Box>

            <Divider />

        </Drawer>
    );
}

export default Sidebar;
