import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../Config/AxiosHelper.js";
import { getMessages } from "../Services/RoomService.jsx";
import { timeAgo } from "../Config/helper.js";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  // console.log(roomId);
  // console.log(currentUser);
  // console.log(connected);

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  //page init:
  //messages ko load karne honge

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        // console.log(messages);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  //scroll down

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //stompClient ko init karne honge
  //subscribe

  useEffect(() => {
    const connectWebSocket = () => {
      ///SockJS
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

          //rest of the work after success receiving the message
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    //stomp client
  }, [roomId]);

  //send message handle

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);

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

    //
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
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  return (
    <div className="">
  {/* this is a header */}
  <header className="fixed w-full py-5 shadow flex justify-around items-center bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white">
    {/* room name container */}
    <div>
      <h1 className="text-xl font-semibold">
        Room : <span>{roomId}</span>
      </h1>
    </div>
    {/* username container */}
    <div>
      <h1 className="text-xl font-semibold">
        User : <span>{currentUser}</span>
      </h1>
    </div>
    {/* button: leave room */}
    <div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 px-3 py-2 rounded-full text-white font-semibold shadow"
      >
        Leave Room
      </button>
    </div>
  </header>

  <main
    ref={chatBoxRef}
    className="py-20 px-10 w-2/3 mx-auto h-screen overflow-auto bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg"
  >
    {messages.map((message, index) => {
      // Assign unique color based on sender
      const userColors = [
        "bg-blue-400 text-white",
        "bg-green-400 text-white",
        "bg-yellow-400 text-gray-900",
        "bg-purple-400 text-white",
        "bg-pink-400 text-white",
      ];
      const colorClass = userColors[
        message.sender.charCodeAt(0) % userColors.length
      ];

      return (
        <div
          key={index}
          className={`flex ${
            message.sender === currentUser ? "justify-end" : "justify-start"
          }`}
        >
          <div className={`my-2 p-2 max-w-xs rounded-lg ${colorClass} shadow-md`}>
            <div className="flex flex-row gap-2">
              <img
                className="h-10 w-10 rounded-full border-2 border-white"
                src={`https://avatar.iran.liara.run/public/boy?username=${message.sender}`}
                alt=""
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">{message.sender}</p>
                {message.messageType === "IMAGE" ? (
                  <img src={`${baseURL}${message.content}`} alt="attachment" className="max-w-xs rounded-lg" />
                ) : message.messageType === "AUDIO" ? (
                  <audio controls src={`${baseURL}${message.content}`} />
                ) : (
                  <p>{message.content}</p>
                )}
                <p className="text-xs text-gray-600 italic">
                  {timeAgo(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </main>

  {/* input message container */}
  <div className="fixed bottom-4 w-full h-16">
    <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 shadow-lg">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        type="text"
        placeholder="Type your message here..."
        className="w-full bg-white dark:bg-gray-800 px-5 py-2 rounded-full h-full focus:outline-none text-gray-900 dark:text-white shadow-inner"
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="flex gap-1">
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full text-white hover:bg-purple-800 shadow"
        >
          <MdAttachFile size={20} />
        </button>
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          className={`h-10 w-10 flex justify-center items-center rounded-full text-white shadow ${isRecording ? 'bg-red-600 hover:bg-red-800' : 'bg-blue-600 hover:bg-blue-800'}`}>
          <FaMicrophone size={20} />
        </button>
        <button
          onClick={sendMessage}
          className="bg-green-600 h-10 w-10 flex justify-center items-center rounded-full text-white hover:bg-green-800 shadow"
        >
          <MdSend size={20} />
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default ChatPage;