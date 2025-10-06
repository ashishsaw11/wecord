import React, { useState } from 'react';
import { searchUsers } from '../Services/UserService';
import PrivateChat from './PrivateChat';

const UserSearch = ({ onSelectUser, stompClient, privateMessages, selectedUser, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }
        try {
            const users = await searchUsers(query);
            setResults(users);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    if (selectedUser) {
        return <PrivateChat receiver={selectedUser} stompClient={stompClient} messages={privateMessages} onClose={onClose}/>;
    }

    return (
        <div className="flex flex-col h-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Search Users</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">&times;</button>
            </div>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for users..."
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-all duration-200"
                >
                    Search
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {results.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className="cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                        <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSearch;