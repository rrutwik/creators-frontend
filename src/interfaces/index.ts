interface Chat {
    uuid: string;
    name: string;
    updatedAt: Date;
}

interface Bot {
    uuid: string;
    name: string;
    createdAt: Date;
}

interface ChatSelectionModelProps {
    setChatSelectionId: (chatId: string) => void;
    setBotSelectionId: (botId: string) => void;
    chatSelectionId?: string | null;
}

interface UserMenuProps {
    username: string;
    credits: number;
    onAddCredits: (amount: number) => void;
}

interface ChatMessage {
    id: string;
    user_id: string;
    role: number;
    text: string;
    timestamp: Date;
}

interface ChatSession {
    uuid: string;
    user_id: string;
    messages: Array<ChatMessage>;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    credits: number
}

export type { User, Chat, Bot, ChatSelectionModelProps, UserMenuProps, ChatMessage, ChatSession };
