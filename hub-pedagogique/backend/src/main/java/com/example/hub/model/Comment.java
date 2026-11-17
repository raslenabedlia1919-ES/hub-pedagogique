package com.example.hub.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    @Indexed
    private String resourceId;

    private String author;
    private String content;
    private Instant createdAt = Instant.now();
}
