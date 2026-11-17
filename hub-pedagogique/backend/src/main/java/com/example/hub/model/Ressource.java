package com.example.hub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "resources")
public class Ressource {

    @Id
    private String id;

    @TextIndexed(weight = 2)
    private String title;

    @TextIndexed
    private String description;

    /** COURS | TP | PROJET */
    private String category;

    private String author;

    private String fileName;      // nom d'origine
    @JsonIgnore
    private String storedName;    // nom sur disque (UUID)
    private String contentType;
    private long fileSize;

    private Instant createdAt = Instant.now();
}
