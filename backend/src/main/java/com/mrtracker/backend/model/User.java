package com.mrtracker.backend.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    private String username;
    private String password;
    private String role;
}
