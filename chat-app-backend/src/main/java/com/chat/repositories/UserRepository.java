package com.chat.repositories;

import com.chat.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {

    User findByUsername(String username);

    List<User> findByUsernameContainingIgnoreCase(String username);
}
