package com.uchk.university.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class DocumentStorageException extends RuntimeException {
    public DocumentStorageException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public DocumentStorageException(String message) {
        super(message);
    }
}