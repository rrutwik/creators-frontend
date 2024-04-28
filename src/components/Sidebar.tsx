import React, { useState } from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Typography, Box, ListItemButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatSelectionModel from './ChatSelectionModel';

function Sidebar({ open, onClose, setChatSelection, setBotSelection }: { open: boolean, onClose: () => void, setChatSelection: (chatId: string) => void, setBotSelection: (botId: string) => void}) {
    const [activeTab, setActiveTab] = useState('chats');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: '20%',
        '& .MuiDrawer-paper': { width: '20%', boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6">Sidebar</Typography>
      </Box>
      <List>
        <ListItemButton onClick={() => setActiveTab('chats')}>
          <ListItemIcon><ChatIcon /></ListItemIcon>
          <ListItemText primary="Chats" />
        </ListItemButton>
        <ListItemButton onClick={() => setActiveTab('settings')}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {activeTab === 'chats' && <ChatSelectionModel setChatSelection={setChatSelection} setBotSelection={setBotSelection} />}
        {activeTab === 'settings' && <Typography>Settings</Typography>}
      </Box>
    </Drawer>
  );
}
//EAHQZCKPFT9NZ6XL94YMF598
export default Sidebar;
