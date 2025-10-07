import { useContext } from "react";
import { ChatContext } from "./ChatContext.js";

export const useChatContext = () => useContext(ChatContext);