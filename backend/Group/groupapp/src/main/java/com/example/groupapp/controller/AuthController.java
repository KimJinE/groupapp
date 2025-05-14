package com.example.groupapp.controller;

import com.example.groupapp.dto.JwtResponse;
import com.example.groupapp.dto.UserLoginRequest;
import com.example.groupapp.dto.UserRegisterRequest;
import com.example.groupapp.entity.User;
import com.example.groupapp.entity.VerificationToken;
import com.example.groupapp.repository.UserRepository;
import com.example.groupapp.repository.VerificationTokenRepository;
import com.example.groupapp.security.JwtUtil;
import com.example.groupapp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @RequestMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Collections.singleton("USER"));
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmailVerified(false);

        userRepository.save(user);
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(token);
        verificationToken.setExpiryDate(LocalDateTime.now().plusDays(1));
        verificationTokenRepository.save(verificationToken);

        String verifyLink = "http://localhost.com:/api/auth/verify?token=" + token;
        String subject = "Verify your email";
        String body = "Welcome, " + user.getUsername() + "!\n\nPlease verify your email by clicking the link below:\n" + verifyLink;

        emailService.sendEmail(user.getEmail(), subject, body);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @PostMapping("/login")
    public JwtResponse login(@RequestBody UserLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

//        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
//
//        if (!user.isEmailVerified()) {
//            throw new RuntimeException("Email not verified");
//        }

        String token = jwtUtil.generateToken(authentication.getName());

        return new JwtResponse(token);
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        VerificationToken vToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (vToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token expired");
        }

        User user = vToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(vToken); // optional
        return ResponseEntity.ok("Email verified successfully");
    }
}
