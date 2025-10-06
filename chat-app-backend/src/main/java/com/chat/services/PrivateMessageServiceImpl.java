package com.chat.services;

import com.chat.entities.PrivateMessage;
import com.chat.repositories.PrivateMessageRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class PrivateMessageServiceImpl implements PrivateMessageService {

    private final PrivateMessageRepository privateMessageRepository;

    public PrivateMessageServiceImpl(PrivateMessageRepository privateMessageRepository) {
        this.privateMessageRepository = privateMessageRepository;
    }

    @Override
    public PrivateMessage saveMessage(PrivateMessage message) {
        message.setTimestamp(new Date());
        return privateMessageRepository.save(message);
    }

    @Override
    public List<PrivateMessage> getMessages(String sender, String receiver) {
        return privateMessageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(sender, receiver, receiver, sender);
    }
}