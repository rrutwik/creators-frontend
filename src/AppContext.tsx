import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PaletteMode } from '@mui/material';
import { User } from './interfaces';
import { getUserDetails as getUserDetailsAPI, checkAuthentication } from './api/index';

interface AppContextProps {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    authenticated: boolean;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    selectedChatId: string | null;
    setChatSelectionId: React.Dispatch<React.SetStateAction<string | null>>;
    botSelectionId: string | null;
    setBotSelectionId: React.Dispatch<React.SetStateAction<string | null>>;
    themeMode: PaletteMode;
    setThemeMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
    refreshSideBarList: boolean;
    setRefreshSideBarList: React.Dispatch<React.SetStateAction<boolean>>;
    openRechargeOption: boolean;
    setOpenRechargeOption: React.Dispatch<React.SetStateAction<boolean>>;
    getUserDetails: () => Promise<void>;
    loadingUser: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [selectedChatId, setChatSelectionId] = useState<string | null>(null);
    const [botSelectionId, setBotSelectionId] = useState<string | null>(null);
    const [themeMode, setThemeMode] = useState<PaletteMode>('dark');
    const [refreshSideBarList, setRefreshSideBarList] = useState(false);
    const [openRechargeOption, setOpenRechargeOption] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);

    const getUserDetails = async () => {
        setLoadingUser(true);
        try {
            const userDetails = await getUserDetailsAPI();
            setUser({ ...userDetails.data });
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        } finally {
            setLoadingUser(false);
        }
    };

    const verifyAuth = useCallback(async () => {
        const authStatus = await checkAuthentication();
        setAuthenticated(authStatus);
        if (authStatus) {
            await getUserDetails();
        }
    }, []);

    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    return (
        <AppContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                user,
                setUser,
                authenticated,
                setAuthenticated,
                selectedChatId,
                setChatSelectionId,
                botSelectionId,
                setBotSelectionId,
                themeMode,
                setThemeMode,
                refreshSideBarList,
                setRefreshSideBarList,
                openRechargeOption,
                setOpenRechargeOption,
                getUserDetails,
                loadingUser,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
