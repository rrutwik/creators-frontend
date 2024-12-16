import { useState, useEffect } from 'react';
import './App.css';
import GoogleLoginComponent from './components/GoogleLoginComponent';
import { checkAuthentication, getUserDetails } from './api';
import { IconButton, PaletteMode, Switch, ThemeProvider } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './Sidebar.css'; // Assume new CSS for sidebar
import Sidebar from './components/Sidebar';
import { createTheme } from '@mui/material/styles';
import ChatModel from './components/ChatModel';
import { User } from './interfaces';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [selectedChatId, setChatSelectionId] = useState<string | null>(null);
    const [botSelectionId, setBotSelectionId] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const clientId = '590138639341-52k54qmlvdhbbr9vsfmm8q4hgu4maln5.apps.googleusercontent.com';
    const [themeMode, setThemeMode] = useState<PaletteMode>('dark');
    const [refreshSideBarList, setRefreshSideBarList] = useState(false);
    const [openRechargeOption, setOpenRechargeOption] = useState(false);

    const [selectedTheme, setSelectedTheme] = useState(
        createTheme({
            palette: {
                mode: themeMode,
            },
        })
    );

    useEffect(() => {
        setSelectedTheme(
            createTheme({
                palette: {
                    mode: themeMode,
                },
            })
        );
        if (openRechargeOption) {
            setSidebarOpen(true);
        }
    }, [themeMode, openRechargeOption]);

    const verifyAuth = async () => {
        const authStatus = await checkAuthentication();
        setAuthenticated(authStatus);
        if (authStatus) {
            const userDetails = await getUserDetails();
            setUser(userDetails.data);
        }
    };
    useEffect(() => {
    }, [selectedChatId, refreshSideBarList]);

    useEffect(() => {
        verifyAuth();
    }, []);

    const onSuccess = (value: boolean) => {
        console.log('Login success:', value);
        verifyAuth();
    };

    const toggleTheme = () => {
        setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    if (!authenticated) {
        return (
            <div>
                <div style={{
                    background: selectedTheme.palette.background.default
                }}>
                    <Switch checked={themeMode === 'dark'} onChange={toggleTheme} />
                </div>
                <ThemeProvider theme={selectedTheme}>
                    <GoogleOAuthProvider clientId={clientId}>
                        <GoogleLoginComponent isSuccess={onSuccess} />
                    </GoogleOAuthProvider>
                </ThemeProvider>
            </div>
        );
    }

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
            <ThemeProvider theme={selectedTheme}>
                {user ? (
                    <div className='side_bar_div'>
                        <IconButton
                            className={`toggle-icon ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
                            onClick={handleDrawerToggle}
                            style={{
                                color: themeMode === 'dark' ? selectedTheme.palette.primary.light : selectedTheme.palette.text.primary,
                                cursor: 'pointer',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <div>
                            <Switch checked={themeMode === 'dark'} onChange={toggleTheme} />
                        </div>
                        <Sidebar
                            open={sidebarOpen}
                            user={user}
                            chatSelectionId={selectedChatId}
                            openRechargeOption={openRechargeOption}
                            onClose={handleDrawerToggle}
                            setChatSelectionId={setChatSelectionId}
                            setBotSelectionId={setBotSelectionId}
                        />
                    </div>
                ) : null}
                {user ? (
                    <ChatModel
                        chatSelectionId={selectedChatId}
                        botSelection={botSelectionId}
                        setOpenRechargeOption={setOpenRechargeOption}
                        setChatSelectionId={setChatSelectionId}
                        setRefreshSideBarList={setRefreshSideBarList}
                    />
                ) : null}
            </ThemeProvider>
        </div>
    );
}

export default App;
