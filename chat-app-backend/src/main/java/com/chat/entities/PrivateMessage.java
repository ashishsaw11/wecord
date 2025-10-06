package com.chat.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "private_messages")
public class PrivateMessage {

    @Id
    private String id;
    private String sender;
    private String receiver;
    private String content;
    private Date timestamp;
}