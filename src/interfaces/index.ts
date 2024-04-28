interface Chat {
    id: string;
    title: string;
    updatedAt: Date;
}

interface Bot {
    uuid: string;
    name: string;
    createdAt: Date;
}

interface ChatSelectionModelProps {
    setChatSelection: (chatId: string) => void;
    setBotSelection: (botId: string) => void;
}

interface UserMenuProps {
    username: string;
    credits: number;
    onAddCredits: (amount: number) => void;
}

interface ChatMessage {
    id: string;
    user_id: string;
    role: string;
    message: string;
    timestamp: Date;
}

interface ChatSession {
    uuid: string;
    user_id: string;
    messages: Array<ChatMessage>;
}
export type { Chat, Bot, ChatSelectionModelProps, UserMenuProps, ChatMessage, ChatSession };