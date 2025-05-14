package com.example.groupapp.controller;

import com.example.groupapp.dto.UpdateUserRequest;
import com.example.groupapp.dto.UserInfoResponse;
import com.example.groupapp.entity.User;
import com.example.groupapp.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;
//import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<UserInfoResponse> getUserInfo(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayname(),
                user.getTimezone(),
                user.getLastSeenAt()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateUser(@Valid @RequestBody UpdateUserRequest request, Authentication authentication) {
        String username = authentication.getName();
        boolean passwordChanged = false;
        User user = userRepository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("User not found"));

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayname(request.getDisplayName());
        }
        System.out.println("reach here");

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            System.out.println("password changing");
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            passwordChanged=true;
        }

        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            user.setTimezone(request.getTimezone());
        }

        if (request.getLocalTime() != null && !request.getLocalTime().isBlank()) {
            user.setLastSeenAt(ZonedDateTime.parse(request.getLocalTime()));
        }

        userRepository.save(user);

        if (passwordChanged) {
            return ResponseEntity.ok(Map.of("message", "Password updated. Please log in again."));
        }

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayname(),
                user.getTimezone(),
                user.getLastSeenAt()
        );
        return ResponseEntity.ok(response);
    }
}
