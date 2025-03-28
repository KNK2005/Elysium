import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
// import './ChatPage.css'; // Make sure to create and import CSS

// Helper to get current user ID (replace with your actual method - Context API is better)
const getCurrentUserId = () => {
    return localStorage.getItem('userId'); // Example: retrieve from local storage
};

const ChatPage = () => {
    const [recentChats, setRecentChats] = useState([]); // List of users for the sidebar
    const [selectedUserId, setSelectedUserId] = useState(null); // ID of the user being chatted with
    const [selectedUserName, setSelectedUserName] = useState(''); // Name of the selected user
    const [currentConversationMessages, setCurrentConversationMessages] = useState([]); // Messages for the selected chat
    const [newMessageContent, setNewMessageContent] = useState(''); // Input field content
    const [manualUserIdInput, setManualUserIdInput] = useState(''); // State for the manual ID input box

    // Loading and Error States
    const [loadingRecentChats, setLoadingRecentChats] = useState(false);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false); // State for loading user info for manual input
    const [errorRecentChats, setErrorRecentChats] = useState('');
    const [errorConversation, setErrorConversation] = useState('');
    const [errorSending, setErrorSending] = useState('');
    const [errorManualInput, setErrorManualInput] = useState(''); // Error specific to manual ID input
    const [isSending, setIsSending] = useState(false);

    const currentUserId = getCurrentUserId(); // Get the logged-in user's ID
    const messagesEndRef = useRef(null); // Ref for scrolling to bottom

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch Recent Chats (Sidebar)
    const fetchRecentChats = async () => {
        setLoadingRecentChats(true);
        setErrorRecentChats('');
        try {
            const { data } = await apiClient.get('/chats');
            setRecentChats(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch Recent Chats Error:", error);
            setErrorRecentChats(error.response?.data?.message || 'Failed to fetch recent chats');
            setRecentChats([]);
        } finally {
            setLoadingRecentChats(false);
        }
    };

    // Fetch Messages for Selected Conversation
    const fetchConversationMessages = async (otherUserId) => {
        if (!otherUserId) return;
        setLoadingConversation(true);
        setErrorConversation('');
        setCurrentConversationMessages([]);
        try {
            const { data } = await apiClient.get(`/chats/${otherUserId}`);
            setCurrentConversationMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(`Fetch Conversation Error (User ${otherUserId}):`, error);
            setErrorConversation(error.response?.data?.message || 'Failed to load conversation');
            setCurrentConversationMessages([]);
        } finally {
            setLoadingConversation(false);
        }
    };

    // Fetch User Info (Optional but good for getting name from ID)
    // NOTE: Requires a backend endpoint like GET /api/users/:userId
    const fetchUserInfo = async (userId) => {
        setLoadingUserInfo(true);
        setErrorManualInput(''); // Clear previous manual input errors
        try {
            // *** Replace with your actual user details endpoint ***
             const { data } = await apiClient.get(`/users/${userId}`); // Example endpoint
            return data.name || 'User'; // Return name or a default
        } catch (error) {
             console.error(`Fetch User Info Error (User ${userId}):`, error);
             setErrorManualInput(error.response?.data?.message || 'User not found or error fetching details');
             return null; // Indicate failure
        } finally {
            setLoadingUserInfo(false);
        }
    };


    // Effect to fetch recent chats on mount
    useEffect(() => {
        fetchRecentChats();
    }, []);

    // Effect to fetch conversation when selectedUserId changes
    useEffect(() => {
        if (selectedUserId) {
            fetchConversationMessages(selectedUserId);
        } else {
            setCurrentConversationMessages([]);
        }
    }, [selectedUserId]);

    // Effect to scroll to bottom when messages change
     useEffect(() => {
        scrollToBottom();
    }, [currentConversationMessages]);

    // Handle selecting a user from the sidebar LIST
    const handleSelectChat = (userId, userName) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setErrorConversation('');
        setErrorSending('');
        setErrorManualInput(''); // Clear manual input error as well
        setManualUserIdInput(''); // Clear the manual input box
    };

    // Handle starting chat via MANUAL ID INPUT
    const handleStartChatWithManualId = async (e) => {
        e.preventDefault(); // Prevent default form submission if wrapped in form
        const targetUserId = manualUserIdInput.trim();

        if (!targetUserId || targetUserId === currentUserId) {
            setErrorManualInput(targetUserId === currentUserId ? "You cannot chat with yourself." : "Please enter a valid User ID.");
            return;
        }

        setErrorManualInput(''); // Clear previous error

        // Optional: Fetch user name for the entered ID
        const userName = await fetchUserInfo(targetUserId);

        if (userName) { // Only proceed if user info was fetched successfully
            setSelectedUserId(targetUserId);
            setSelectedUserName(userName); // Set the fetched name
            setErrorConversation(''); // Clear conversation errors
            setErrorSending(''); // Clear sending errors
            setManualUserIdInput(''); // Clear input box on success
        }
        // If fetchUserInfo failed, the error is already set by it
    };


    // Handle sending a message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedUserId || newMessageContent.trim() === '') return;

        setErrorSending('');
        setIsSending(true);
        try {
            await apiClient.post('/chats', {
                receiverId: selectedUserId,
                content: newMessageContent.trim(),
            });
            setNewMessageContent('');
            fetchConversationMessages(selectedUserId); // Refresh messages
            // Optional: Refresh recent chats to update sidebar if this was a new chat
            // fetchRecentChats();
        } catch (error) {
            console.error("Send Message Error:", error);
            setErrorSending(error.response?.data?.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="chat-page-container">
            <div className="chat-sidebar">
                {/* Manual User ID Input Box */}
                <div className="manual-chat-start">
                    <h5>Start New Chat</h5>
                    <form onSubmit={handleStartChatWithManualId}>
                        <input
                            type="text"
                            value={manualUserIdInput}
                            onChange={(e) => {
                                setManualUserIdInput(e.target.value);
                                if(errorManualInput) setErrorManualInput(''); // Clear error on type
                            }}
                            placeholder="Enter User ID"
                            disabled={loadingUserInfo}
                            required
                        />
                        <button type="submit" disabled={loadingUserInfo || !manualUserIdInput.trim()}>
                            {loadingUserInfo ? 'Checking...' : 'Chat'}
                        </button>
                        {errorManualInput && <p className="error small-error">{errorManualInput}</p>}
                    </form>
                </div>

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* Recent Chats List */}
                <h3>Recent Chats</h3>
                {loadingRecentChats && <p>Loading chats...</p>}
                {errorRecentChats && <p className="error">{errorRecentChats}</p>}
                {!loadingRecentChats && recentChats.length === 0 && !errorRecentChats && (
                    <p>No recent chats.</p>
                )}
                <ul>
                    {recentChats.map((chat) => (
                        <li
                            key={chat.userId}
                            onClick={() => handleSelectChat(chat.userId, chat.name)}
                            className={selectedUserId === chat.userId ? 'selected-chat' : ''}
                        >
                            <span className="chat-user-name">{chat.name}</span>
                            {chat.lastMessage?.content && (
                                <p className="last-message-preview">
                                   {chat.lastMessage.sender === currentUserId ? "You: " : ""}
                                   {chat.lastMessage.content.substring(0, 30)}
                                   {chat.lastMessage.content.length > 30 ? "..." : ""}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-main">
                {selectedUserId ? (
                    <>
                        <div className="chat-header">
                            <h3>Chat with {selectedUserName || 'User'} {selectedUserId ? `(${selectedUserId})` : ''}</h3>
                        </div>
                        <div className="messages-window">
                            {loadingConversation && <p>Loading messages...</p>}
                            {errorConversation && <p className="error">{errorConversation}</p>}
                            {!loadingConversation && currentConversationMessages.length === 0 && !errorConversation &&(
                                <p>No messages in this conversation yet. Say hello!</p>
                            )}
                            <ul>
                                {currentConversationMessages.map((message) => (
                                    <li
                                        key={message._id}
                                        className={message.sender === currentUserId ? 'message-sent' : 'message-received'}
                                    >
                                        <div className="message-content">
                                            {message.content}
                                        </div>
                                    </li>
                                ))}
                                <div ref={messagesEndRef} />
                            </ul>
                        </div>
                        <form onSubmit={handleSendMessage} className="message-input-form">
                            <textarea
                                value={newMessageContent}
                                onChange={(e) => setNewMessageContent(e.target.value)}
                                placeholder={`Message ${selectedUserName || 'User'}...`}
                                required
                                disabled={isSending}
                                rows="2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <button type="submit" disabled={isSending || newMessageContent.trim() === ''}>
                                {isSending ? 'Sending...' : 'Send'}
                            </button>
                            {errorSending && <p className="error small-error">{errorSending}</p>}
                        </form>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <p>Select a chat from the left or enter a User ID above to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;