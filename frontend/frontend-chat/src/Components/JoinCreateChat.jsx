import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../Services/RoomService.jsx";
import { loginUserApi, registerUserApi } from "../Services/UserService.js";
import { useChatContext } from "../context/useChatContext.js";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [detail, setDetail] = useState({
    roomId: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const { setCurrentUser, setRoomId, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username can only contain letters, numbers, and underscores!");
      return false;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long!");
      return false;
    }
    return true;
  }

  function validatePassword(password) {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return false;
    }
    return true;
  }

  async function handleLogin() {
    if (detail.username === "" || detail.password === "") {
      toast.error("Username and Password are required!");
      return;
    }

    try {
      await loginUserApi({ username: detail.username, password: detail.password });
      toast.success("Logged in successfully!");
      setCurrentUser(detail.username);
      setIsLoggedIn(true);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Invalid username or password");
      }
    }
  }

  async function handleSignUp() {
    if (detail.username === "" || detail.password === "" || detail.confirmPassword === "") {
      toast.error("All fields are required!");
      return;
    }
    if (!validateUsername(detail.username)) return;
    if (!validatePassword(detail.password)) return;
    if (detail.password !== detail.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await registerUserApi({ username: detail.username, password: detail.password });
      toast.success("Registered successfully! Please login.");
      setIsLogin(true);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Registration failed");
      }
    }
  }

  async function joinChat() {
    if (detail.roomId === "") {
      toast.error("Room ID is required!");
      return;
    }
    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Joined room successfully!");
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in joining room");
      }
    }
  }

  async function createRoom() {
    if (detail.roomId === "") {
      toast.error("Room ID is required!");
      return;
    }
    try {
      const response = await createRoomApi(detail.roomId);
      toast.success("Room Created Successfully !!");
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in creating room");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" alt="Chat Icon" />
        </div>

        {!isLoggedIn && (
          <div className="flex justify-center gap-4">
            <button onClick={() => setIsLogin(true)} className={`px-4 py-2 rounded-full ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>Login</button>
            <button onClick={() => setIsLogin(false)} className={`px-4 py-2 rounded-full ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>Sign Up</button>
          </div>
        )}

        <h1 className="text-2xl font-semibold text-center ">{isLoggedIn ? `Welcome, ${detail.username}` : (isLogin ? "Login" : "Sign Up")}</h1>

        {!isLoggedIn && (
          <>
            {/* Username div */}
            <div className="">
              <label htmlFor="username" className="block font-medium mb-2">
                Your Username
              </label>
              <input
                onChange={handleFormInputChange}
                value={detail.username}
                type="text"
                id="username"
                name="username"
                placeholder="Enter your unique username"
                className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="20"
              />
            </div>

            {/* Password div */}
            <div className="">
              <label htmlFor="password" className="block font-medium mb-2">
                Password
              </label>
              <input
                onChange={handleFormInputChange}
                value={detail.password}
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Confirm Password div - only show when creating */}
            {!isLogin && (
              <div className="">
                <label htmlFor="confirmPassword" className="block font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  onChange={handleFormInputChange}
                  value={detail.confirmPassword}
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {isLogin ? (
              <button onClick={handleLogin} className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-full text-white transition-colors">
                Login
              </button>
            ) : (
              <button onClick={handleSignUp} className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded-full text-white transition-colors">
                Sign Up
              </button>
            )}
          </>
        )}

        {isLoggedIn && (
          <>
            <hr className="my-4" />

            {/* Room ID div */}
            <div className="">
              <label htmlFor="roomId" className="block font-medium mb-2">
                Room ID / New Room ID
              </label>
              <input
                name="roomId"
                onChange={handleFormInputChange}
                value={detail.roomId}
                type="text"
                id="roomId"
                placeholder="Enter the room id"
                className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="20"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={joinChat}
                className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-full text-white transition-colors"
              >
                Join Room
              </button>
              <button
                onClick={createRoom}
                className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded-full text-white transition-colors"
              >
                Create Room
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinCreateChat;