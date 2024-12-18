import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { PlayCircle, StopCircle } from '@mui/icons-material';
import { ChatMessage } from '../../interfaces';

interface MessageProps {
    message: ChatMessage;
    currentMessageId: string | null;
    onPlay: (text: string, id: string, botName?: string) => void;
    onStop: () => void;
    chatBotName?: string;
}

const Message = ({ message, currentMessageId, onPlay, onStop, chatBotName }: MessageProps) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
                alignSelf: message.role === 1 ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor:
                    message.role === 1
                        ? theme.palette.primary.light
                        : theme.palette.background.paper,
                padding: '10px',
                borderRadius: '10px',
                color:
                    message.role === 1
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
            }}
        >
            <Typography sx={{
                flex: message.role === 1 ? '0 1 100%' : '0 1 90%',
            }}>{message.text}</Typography>
            {message.role === 2 && (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: '0 1 10%',
                            alignItems: 'center',
                            color: theme.palette.error.main,
                            cursor: 'pointer',
                            '&:hover': {
                                color: theme.palette.error.dark,
                            },
                        }}
                    >
                        {currentMessageId === message._id ? (
                            <IconButton
                                sx={{
                                    height: 'fit-content'
                                }}
                                onClick={onStop}
                            >
                                <StopCircle />
                            </IconButton>
                        ) : (
                            <IconButton
                                onClick={() => onPlay(message.text, message._id, chatBotName)}
                                sx={{
                                    height: 'fit-content'
                                }}
                            >
                                <PlayCircle />
                            </IconButton>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default Message;
