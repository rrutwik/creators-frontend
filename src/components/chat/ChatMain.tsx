// import "bootstrap/dist/css/bootstrap.min.css";
// import './App.css';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    BasicStorage,
    ChatMessage,
    ChatProvider,
    Conversation,
    ConversationId,
    ConversationRole,
    IStorage,
    MessageContentType,
    Participant,
    Presence,
    TypingUsersList,
    UpdateState,
    User,
    UserStatus
} from "@chatscope/use-chat";
import {ExampleChatService} from "@chatscope/use-chat/dist/examples";
import {Chat} from "./Chat";
import {nanoid} from "nanoid";
import {AutoDraft} from "@chatscope/use-chat/dist/enums/AutoDraft";

// sendMessage and addMessage methods can automagically generate id for messages and groups
// This allows you to omit doing this manually, but you need to provide a message generator
// The message id generator is a function that receives message and returns id for this message
// The group id generator is a function that returns string
const messageIdGenerator = (message: ChatMessage<MessageContentType>) => nanoid();
const groupIdGenerator = () => nanoid();

const currentUserStorage = new BasicStorage({groupIdGenerator, messageIdGenerator});

// Create serviceFactory
const serviceFactory = (storage: IStorage, updateState: UpdateState) => {
    return new ExampleChatService(storage, updateState);
};

const chats = [
    {name: "Akane", storage: currentUserStorage},
];

function createConversation(id: ConversationId, name: string): Conversation {
    return new Conversation({
        id,
        participants: [
            new Participant({
                id: name,
                role: new ConversationRole([])
            })
        ],
        unreadCounter: 0,
        typingUsers: new TypingUsersList({items: []}),
        draft: ""
    });
}


function ChatMain({ user }: {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      email?: string;
    }
  }) {
    const chatUser = new User({
        id: user.id,
        presence: new Presence({status: UserStatus.Available, description: ""}),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        avatar: "",
        bio: ""
    });
    const chats = [{name: user.firstName, storage: currentUserStorage}]
    return (
        <div className="h-100 d-flex flex-column overflow-hidden">
            <ChatProvider serviceFactory={serviceFactory} storage={currentUserStorage} config={{
                typingThrottleTime: 250,
                typingDebounceTime: 900,
                debounceTyping: true,
                autoDraft: AutoDraft.Save | AutoDraft.Restore
            }}>
                <Chat user={chatUser}/>
            </ChatProvider>
        </div>
    );
}

export default ChatMain;