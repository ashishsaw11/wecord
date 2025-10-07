import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import { BsPersonPlus } from "react-icons/bs";
import { useChatContext } from "../context/useChatContext.js";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../Config/AxiosHelper.js";
import { getMessages } from "../Services/RoomService.jsx";
import { timeAgo } from "../Config/helper.js";
import UserSearch from "./UserSearch.jsx";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();

  // Check connection and persist on page refresh
  useEffect(() => {
    // Try to restore session from localStorage if available
    const savedRoomId = localStorage.getItem('chatRoomId');
    const savedUser = localStorage.getItem('chatUsername');

    if (!connected && savedRoomId && savedUser) {
      // Restore session
      setRoomId(savedRoomId);
      setCurrentUser(savedUser);
      setConnected(true);
    } else if (!connected && (!roomId || !currentUser)) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate, setConnected, setRoomId, setCurrentUser]);

  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState(new Map());
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load messages and persist login state
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        setMessages(messages);

        // Save session to localStorage on successful connection
        if (roomId && currentUser) {
          localStorage.setItem('chatRoomId', roomId);
          localStorage.setItem('chatUsername', currentUser);
        }
      } catch {
        toast.error("Failed to load messages.");
      }
    }
    if (connected && roomId && currentUser) {
      loadMessages();
    }
  }, [connected, roomId, currentUser]);

  //scroll down
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const onPrivateMessageReceived = useCallback((message) => {
    const fromUser = message.sender === currentUser ? message.receiver : message.sender;

    setPrivateMessages(prevMessages => {
        const newMessages = new Map(prevMessages);
        const userMessages = newMessages.get(fromUser) || [];
        newMessages.set(fromUser, [...userMessages, message]);
        return newMessages;
    });

    if (selectedUser?.username !== fromUser) {
        toast(`New private message from ${message.sender}`);
    }
  }, [currentUser, selectedUser]);

  //stompClient ko init karne honge
  //subscribe
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });

        if (currentUser) {
            client.subscribe(`/user/${currentUser}/private`, (message) => {
                onPrivateMessageReceived(JSON.parse(message.body));
            });
        }
      });
    };

    if (connected && roomId) {
      connectWebSocket();
    }

    return () => {
        if (stompClient) {
            stompClient.disconnect();
        }
    }
  }, [roomId, connected, currentUser, onPrivateMessageReceived, stompClient]);

  //send message handle
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
        messageType: "TEXT",
        messageTime: new Date(),
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${baseURL}/api/v1/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const fileUrl = await response.text();
        let messageType = "TEXT";
        if (file.type.startsWith("image/")) {
          messageType = "IMAGE";
        } else if (file.type.startsWith("audio/")) {
          messageType = "AUDIO";
        }

        const message = {
          sender: currentUser,
          content: fileUrl,
          roomId: roomId,
          messageType: messageType,
          messageTime: new Date(),
        };

        stompClient.send(
          `/app/sendMessage/${roomId}`,
          {},
          JSON.stringify(message)
        );
      } else {
        toast.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("File upload failed");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadFile(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        uploadFile(audioFile);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped.");
    }
  };

  function handleLogout() {
    if (stompClient) {
      stompClient.disconnect();
    }
    setConnected(false);
    setRoomId("");
    setCurrentUser("");

    localStorage.removeItem('chatRoomId');
    localStorage.removeItem('chatUsername');

    navigate("/");
  }

  const handleSelectUser = (user) => {
      setSelectedUser(user);
      setShowUserSearch(false);
  }

  return (
    <div className="relative h-screen">
      {/* Header - Enhanced Responsive */}
      <header className="fixed w-full top-0 left-0 right-0 py-3 sm:py-4 md:py-5 shadow-lg bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between sm:justify-around items-center space-y-2 sm:space-y-0">
          {/* Room name container */}
          <div className="text-center sm:text-left">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold">
              Room : <span className="font-bold text-yellow-300">{roomId}</span>
            </h1>
          </div>
          {/* Username container */}
          <div className="text-center sm:text-left">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold">
              User : <span className="font-bold text-yellow-300">{currentUser}</span>
            </h1>
          </div>
          {/* Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                  setShowUserSearch(!showUserSearch);
                  setSelectedUser(null);
              }}
              title="Search Users"
              className="bg-blue-500 hover:bg-blue-600 p-2 sm:p-3 rounded-full text-white font-semibold shadow-lg transition-all duration-200 text-sm sm:text-base"
            >
              <BsPersonPlus size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white font-semibold shadow-lg transition-all duration-200 text-sm sm:text-base"
            >
              Leave Room
            </button>
          </div>
        </div>
      </header>

      {/* Overlay for User Search and Private Chat */}
      {(showUserSearch || selectedUser) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md h-3/4">
                  <UserSearch
                      onSelectUser={handleSelectUser}
                      stompClient={stompClient}
                      privateMessages={privateMessages.get(selectedUser?.username) || []}
                      selectedUser={selectedUser}
                      onClose={() => {
                          setShowUserSearch(false);
                          setSelectedUser(null);
                      }}
                  />
              </div>
          </div>
      )}


      {/* Chat Messages - Enhanced Responsive */}
      <main
        ref={chatBoxRef}
        className="pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 px-2 sm:px-4 md:px-6 lg:px-10 w-full sm:w-5/6 md:w-4/5 lg:w-2/3 mx-auto h-screen overflow-auto bg-gray-50 dark:bg-gray-900 rounded-none sm:rounded-lg shadow-none sm:shadow-lg"
      >
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message, index) => {
            const userColors = [
              "bg-blue-500 text-white",
              "bg-green-500 text-white",
              "bg-yellow-500 text-gray-900",
              "bg-purple-500 text-white",
              "bg-pink-500 text-white",
              "bg-indigo-500 text-white",
              "bg-red-500 text-white",
              "bg-teal-500 text-white",
              "bg-orange-500 text-white",
              "bg-cyan-500 text-white",
            ];
            const colorClass = userColors[
              message.sender.charCodeAt(0) % userColors.length
            ];

            const isCurrentUser = message.sender === currentUser;

            return (
              <div
                key={index}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} px-2 sm:px-0`}
              >
                <div className={`p-3 sm:p-4 max-w-[85%] xs:max-w-[80%] sm:max-w-[70%] md:max-w-xs lg:max-w-md rounded-2xl ${colorClass} shadow-lg`}>
                  <div className="flex flex-row gap-2 sm:gap-3">
                    <img
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
                      src={`https://avatar.iran.liara.run/public/boy?username=${message.sender}`}
                      alt=""
                    />
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold truncate">{message.sender}</p>
                      <div className="text-sm sm:text-base">
                        {message.messageType === "IMAGE" ? (
                          <img
                            src={`${baseURL}${message.content}`}
                            alt="attachment"
                            className="max-w-32 sm:max-w-40 md:max-w-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(`${baseURL}${message.content}`, '_blank')}
                          />
                        ) : message.messageType === "AUDIO" ? (
                          <audio
                            controls
                            src={`${baseURL}${message.content}`}
                            className="w-32 sm:w-40 md:w-48"
                          />
                        ) : (
                          <p className="break-words">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs opacity-75 italic">
                        {timeAgo(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Input Container - Enhanced Responsive */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="container mx-auto px-2 sm:px-4 pb-2 sm:pb-4">
          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 mx-auto">
            <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl shadow-2xl p-2 sm:p-3 md:p-4">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 dark:text-white shadow-inner text-sm sm:text-base"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-purple-600 hover:bg-purple-700 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex justify-center items-center rounded-full text-white shadow-lg transition-all duration-200"
                  >
                    <MdAttachFile size={16} className="sm:hidden" />
                    <MdAttachFile size={18} className="hidden sm:block md:hidden" />
                    <MdAttachFile size={20} className="hidden md:block" />
                  </button>
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex justify-center items-center rounded-full text-white shadow-lg transition-all duration-200 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <FaMicrophone size={14} className="sm:hidden" />
                    <FaMicrophone size={16} className="hidden sm:block md:hidden" />
                    <FaMicrophone size={18} className="hidden md:block" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex justify-center items-center rounded-full text-white shadow-lg transition-all duration-200"
                  >
                    <MdSend size={16} className="sm:hidden" />
                    <MdSend size={18} className="hidden sm:block md:hidden" />
                    <MdSend size={20} className="hidden md:block" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;