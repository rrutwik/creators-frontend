interface Chat {
    uuid: string;
    name: string;
    chatbot_id?: {
        name: string
    },
    updatedAt: Date;
}

interface ChatSelectionModelProps {
    setChatSelectionId: (chatId: string) => void;
    setSelectedBot: (bot: Bot) => void;
    chatSelectionId?: string | null;
    setSidebarOpen: (close: boolean) => void
}

interface UserMenuProps {
    username: string;
    credits: number;
    onAddCredits: (amount: number) => void;
}

export enum MessageRole {
    USER = 1,
    ASSISTANT = 2,
    SYSTEM = 3
}

interface ChatMessage {
    _id: string;
    role: MessageRole,
    text: string,
    isSpeaking: boolean,
    timestamp: Date;
}

interface ChatSession {
    uuid: string;
    user_id: string;
    chatbot_id: Bot,
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

interface Bot {
    _id: string,
    name: string
}

export type { User, Chat, Bot, ChatSelectionModelProps, UserMenuProps, ChatMessage, ChatSession };
