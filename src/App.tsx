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
import { Bot, User } from './interfaces';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';

function ProtectedRoute({ authenticated, children }: { authenticated: boolean; children: JSX.Element }) {
    return authenticated ? children : <Navigate to="/login" />;
}

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [selectedChatId, setChatSelectionId] = useState<string | null>(null);
    const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const clientId = '590138639341-52k54qmlvdhbbr9vsfmm8q4hgu4maln5.apps.googleusercontent.com';
    const [themeMode, setThemeMode] = useState<PaletteMode>('dark');
    const [, setRefreshSideBarList] = useState(false);
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
        } else {
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
        verifyAuth();
    }, []);

    const onSuccess = (value: boolean) => {
        console.log('Login success:', value);
        verifyAuth();
    };

    const toggleTheme = () => {
        setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <AppProvider>
            <Router>
                <ThemeProvider theme={selectedTheme}>
                    <Routes>
                        {/* Login Route */}
                        <Route
                            path="/login"
                            element={
                                !authenticated ? (
                                    <div style={{ background: selectedTheme.palette.background.default }}>
                                        <Switch checked={themeMode === 'dark'} onChange={toggleTheme} />
                                        <GoogleOAuthProvider clientId={clientId}>
                                            <GoogleLoginComponent isSuccess={onSuccess} />
                                        </GoogleOAuthProvider>
                                    </div>
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                        {/* Protected Home Route */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute authenticated={authenticated}>
                                    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
                                        {user ? (
                                            <div className="side_bar_div">
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
                                                <Switch checked={themeMode === 'dark'} onChange={toggleTheme} />
                                                <Sidebar
                                                    open={sidebarOpen}
                                                    chatSelectionId={selectedChatId}
                                                    openRechargeOption={openRechargeOption}
                                                    onClose={handleDrawerToggle}
                                                    setSidebarOpen={setSidebarOpen}
                                                    setChatSelectionId={setChatSelectionId}
                                                    setSelectedBot={setSelectedBot}
                                                />
                                            </div>
                                        ) : null}
                                        {user ? (
                                            <ChatModel
                                                chatSelectionId={selectedChatId}
                                                selectedBot={selectedBot}
                                                setOpenRechargeOption={setOpenRechargeOption}
                                                setChatSelectionId={setChatSelectionId}
                                                setRefreshSideBarList={setRefreshSideBarList}
                                            />
                                        ) : null}
                                    </div>
                                </ProtectedRoute>
                            }
                        />
                        {/* Redirect to Login if Route Not Found */}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </ThemeProvider>
            </Router>
        </AppProvider>
    );
}

export default App;
