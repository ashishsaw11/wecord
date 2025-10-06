package com.chat.repositories;

import com.chat.entities.PrivateMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PrivateMessageRepository extends MongoRepository<PrivateMessage, String> {
    List<PrivateMessage> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(String sender, String receiver, String sender2, String receiver2);
}