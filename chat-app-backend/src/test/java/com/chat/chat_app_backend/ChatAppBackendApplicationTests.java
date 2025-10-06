package com.chat.chat_app_backend;

import com.chat.repositories.PrivateMessageRepository;
import com.chat.repositories.RoomRepository;
import com.chat.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class ChatAppBackendApplicationTests {

	@MockBean
	private UserRepository userRepository;

	@MockBean
	private RoomRepository roomRepository;

	@MockBean
	private PrivateMessageRepository privateMessageRepository;

	@Test
	void contextLoads() {
	}

}