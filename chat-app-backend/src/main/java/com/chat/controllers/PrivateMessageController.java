package com.chat.controllers;

import com.chat.entities.PrivateMessage;
import com.chat.services.PrivateMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class PrivateMessageController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final PrivateMessageService privateMessageService;

    public PrivateMessageController(SimpMessagingTemplate simpMessagingTemplate, PrivateMessageService privateMessageService) {
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.privateMessageService = privateMessageService;
    }

    @MessageMapping("/private")
    public void sendPrivateMessage(@Payload PrivateMessage message) {
        privateMessageService.saveMessage(message);
        simpMessagingTemplate.convertAndSendToUser(message.getReceiver(), "/private", message);
    }

    @GetMapping("/api/v1/messages/{sender}/{receiver}")
    public ResponseEntity<List<PrivateMessage>> getPrivateMessages(@PathVariable String sender, @PathVariable String receiver) {
        return ResponseEntity.ok(privateMessageService.getMessages(sender, receiver));
    }
}