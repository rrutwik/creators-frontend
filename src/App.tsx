import { useState, useEffect } from 'react';
import './App.css';
import GoogleLoginComponent from './components/GoogleLoginComponent';
import { checkAuthentication, getUserDetails } from './api';
import { PaletteMode, ThemeProvider } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './Sidebar.css'; // Assume new CSS for sidebar
import Sidebar from './components/Sidebar';
import { createTheme } from '@mui/material/styles';
import ChatModel from './components/ChatModel';
import { User } from './interfaces';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [selectedChatId, setChatSelectionId] = useState<string | null>(null);
    const [botSelectionId, setBotSelectionId] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const clientId = '590138639341-52k54qmlvdhbbr9vsfmm8q4hgu4maln5.apps.googleusercontent.com';
    const [theme] = useState('light' as PaletteMode);
    const [refreshSideBarList, setRefreshSideBarList] = useState(false);

    const [selectedTheme, setSelectedTheme] = useState(
        createTheme({
            palette: {
                mode: theme,
            },
        })
    );

    useEffect(() => {
        setSelectedTheme(
            createTheme({
                palette: {
                    mode: theme,
                },
            })
        );
    }, [theme]);

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

    if (!authenticated) {
        return (
            <GoogleOAuthProvider clientId={clientId}>
                <GoogleLoginComponent isSuccess={onSuccess} />
            </GoogleOAuthProvider>
        );
    }

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };


    console.log(JSON.stringify({
        selectedChatId,
        refreshSideBarList,
    }));

    return (
        <div style={{ display: 'flex' }}>
            <ThemeProvider theme={selectedTheme}>
                {/* <header>Sathi App</header> */}
                {user ? (
                    <Sidebar
                        user={user}
                        chatSelectionId={selectedChatId}
                        onClose={handleDrawerToggle}
                        setChatSelectionId={setChatSelectionId}
                        setBotSelectionId={setBotSelectionId}
                    />
                ) : null}
                {user ? (
                    <main style={{ flexGrow: 1, padding: '10px', width: '75%' }}>
                        <ChatModel
                            chatSelectionId={selectedChatId}
                            botSelection={botSelectionId}
                            setChatSelectionId={setChatSelectionId}
                            setRefreshSideBarList={setRefreshSideBarList}
                        />
                    </main>
                ) : null}
            </ThemeProvider>
        </div>
    );
}

export default App;
