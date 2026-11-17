package com.example.hub.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank @Size(min = 2, max = 40) String author,
        @NotBlank @Size(min = 2, max = 500) String content) {
}
