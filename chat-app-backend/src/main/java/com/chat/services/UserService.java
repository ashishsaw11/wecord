package com.chat.services;

import com.chat.entities.User;

import java.util.List;

public interface UserService {
    User registerUser(User user);
    User loginUser(String username, String password);
    List<User> searchUsers(String query);
}
