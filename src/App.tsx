import { useState, useEffect } from "react";
import "./App.css";
import GoogleLoginComponent from "./components/GoogleLoginComponent";
import { checkAuthentication, getUserDetails } from "./api";
import {
  Button,
  PaletteMode,
  ThemeProvider,
} from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./Sidebar.css"; // Assume new CSS for sidebar
import Sidebar from "./components/Sidebar";
import { createTheme } from '@mui/material/styles';
import ChatMain from "./components/chat/ChatMain";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{id:string, 
    firstName?: string, 
    lastName?: string, 
    username?: string, 
    email?: string
  }>({id: "testing"});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [botSelection, setBotSelection] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const clientId =
    "590138639341-52k54qmlvdhbbr9vsfmm8q4hgu4maln5.apps.googleusercontent.com";
  const [theme, setTheme] = useState('light' as PaletteMode);
  const [selectedTheme, setSelectedTheme] = useState(createTheme({
    palette: {
      mode: theme,
    },
  }));

  useEffect(() => {
    setSelectedTheme(createTheme({
      palette: {
        mode: theme,
      },
    }));
  }, [theme]);

  const verifyAuth = async () => {
    const authStatus = await checkAuthentication();
    setAuthenticated(authStatus);
    if (authStatus) {
      const userDetails = await getUserDetails();
      console.log("User details:", userDetails);
      setUser(userDetails);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const onSuccess = (value: boolean) => {
    console.log("Login success:", value);
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

  return (
      <div style={{ display: "flex"}}>
        <ThemeProvider theme={selectedTheme}>
        <Button className='switch_theme' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          Switch Theme
        </Button>
        {user ? <Sidebar
            open={sidebarOpen}
            onClose={handleDrawerToggle}
            setChatSelection={setSelectedChat}
            setBotSelection={setBotSelection}
          /> : null}
        {user ?  <main style={{ flexGrow: 1, padding: "10px", width: '75%' }}>
            <ChatMain
              user={user}
            />
          </main>
          : null }
        </ThemeProvider>
      </div>
  );
}

export default App;
