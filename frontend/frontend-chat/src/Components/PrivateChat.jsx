import React, { useState, useEffect, useRef } from 'react';
import { sendPrivateMessage } from '../Services/PrivateMessageService';
import { useChatContext } from '../context/useChatContext';
import { generateSharedSecret, encryptMessage, decryptMessage } from '../Services/EncryptionService';

const PrivateChat = ({ receiver, stompClient, messages, onClose }) => {
    const { currentUser } = useChatContext();
    const [input, setInput] = useState('');
    const chatBoxRef = useRef(null);
    const [decryptedMessages, setDecryptedMessages] = useState([]);
    const sharedSecret = generateSharedSecret(currentUser, receiver.username);

    useEffect(() => {
        const decrypted = messages.map(msg => ({
            ...msg,
            content: decryptMessage(msg.content, sharedSecret)
        }));
        setDecryptedMessages(decrypted);
    }, [messages, sharedSecret]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [decryptedMessages]);

    const handleSendMessage = async () => {
        if (input.trim() && currentUser && receiver) {
            const encryptedContent = encryptMessage(input, sharedSecret);
            const message = {
                sender: currentUser,
                receiver: receiver.username,
                content: encryptedContent,
            };
            sendPrivateMessage(stompClient, message);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chat with {receiver.username}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">&times;</button>
            </div>
            <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
                {decryptedMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`p-3 rounded-lg max-w-xs ${msg.sender === currentUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                            <strong>{msg.sender}:</strong> {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="Type your message..."
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-all duration-200"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default PrivateChat;