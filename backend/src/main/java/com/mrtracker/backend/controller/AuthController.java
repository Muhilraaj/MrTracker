package com.mrtracker.backend.controller;

import com.mrtracker.backend.model.User;
import com.mrtracker.backend.repository.UserRepository;
import com.mrtracker.backend.service.JwtUtil;
import lombok.Data;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.http.*;
import jakarta.servlet.http.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil, UserDetailsService userDetailsService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String token = jwtUtil.generateToken(request.getUsername());

        // Set as cookie for browsers
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);  // set true in production (HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge(1800); // 30 minutes
        response.addCookie(cookie);

        // Also return token in response for header-based clients
        return ResponseEntity.ok(Map.of("message", "Login successful", "expiryMinutes", 30));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {

        System.out.println("register");

        // ✅ Check duplicate username
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // ✅ Hash password using Argon2 (very important)
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // ✅ Create user object
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(hashedPassword); // <-- Argon2 stored here
        user.setRole(request.getRole());

        // ✅ Save in MongoDB
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully ✅");
    }
}

@Data
class   AuthRequest {
    private String username;
    private String password;
    private String Role;
    // getters & setters
}
