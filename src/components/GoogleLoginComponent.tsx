import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { loginWithGoogle } from '../api';
import { useState } from 'react';
import { useTheme } from '@mui/material';

const GoogleLoginComponent = ({ isSuccess }: { isSuccess: (value: boolean) => void }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    const handleLoginSuccess = async (response: any) => {
        setLoading(true);
        try {
            const { data } = await loginWithGoogle(response);
            Cookies.set('session_token', data.sessionToken, { expires: 1 });
            Cookies.set('refresh_token', data.refreshToken, { expires: 1 });
            isSuccess(true);
            setLoading(false);
        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed, please try again.');
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems:'center',
                backgroundColor: theme.palette.background.default,
                justifyContent: 'center',
                minHeight: '100vh'
            }}
        >
            <Typography variant='h4' gutterBottom sx={{
                color: theme.palette.text.primary
            }}>
                Sign in with Google
            </Typography>
            {error && <Alert severity='error'>{error}</Alert>}
            <GoogleLogin
                useOneTap
                onSuccess={handleLoginSuccess}
                onError={() => {
                    console.error('Login Failed');
                    setError('Login Failed');
                }}
            />
            {loading && <CircularProgress />}
        </Box>
    );
};

export default GoogleLoginComponent;
