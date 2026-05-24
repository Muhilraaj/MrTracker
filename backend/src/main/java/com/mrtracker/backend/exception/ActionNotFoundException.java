package com.mrtracker.backend.exception;

public class ActionNotFoundException extends RuntimeException {
    public ActionNotFoundException(String id) {
        super("Action not found: " + id);
    }
}
