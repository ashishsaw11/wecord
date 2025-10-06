package com.chat.services;

import com.chat.entities.PrivateMessage;

import java.util.List;

public interface PrivateMessageService {
    PrivateMessage saveMessage(PrivateMessage message);
    List<PrivateMessage> getMessages(String sender, String receiver);
}