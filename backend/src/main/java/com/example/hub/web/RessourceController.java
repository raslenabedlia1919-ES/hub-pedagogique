package com.example.hub.web;

import com.example.hub.model.Comment;
import com.example.hub.model.CommentRequest;
import com.example.hub.model.Ressource;
import com.example.hub.service.FileStorageService;
import com.example.hub.service.RessourceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@Validated
public class RessourceController {

    private final RessourceService service;
    private final FileStorageService storage;

    public RessourceController(RessourceService service, FileStorageService storage) {
        this.service = service;
        this.storage = storage;
    }

    @GetMapping
    public List<Ressource> list(@RequestParam(required = false) String q,
                                @RequestParam(required = false) String category) {
        return service.search(q, category);
    }

    @GetMapping("/mine")
    public List<Ressource> mine(@RequestParam String author) {
        return service.byAuthor(author);
    }

    @GetMapping("/{id}")
    public Ressource get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Ressource create(@RequestParam @NotBlank @Size(min = 3, max = 100) String title,
                            @RequestParam @NotBlank @Size(min = 10, max = 1000) String description,
                            @RequestParam @Pattern(regexp = "COURS|TP|PROJET") String category,
                            @RequestParam @NotBlank @Size(min = 2, max = 40) String author,
                            @RequestParam("file") MultipartFile file) throws IOException {
        return service.create(title, description, category, author, file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable String id,
                                             @RequestParam(defaultValue = "false") boolean inline) throws IOException {
        Ressource r = service.get(id);
        Resource file = storage.load(r.getStoredName());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        ContentDisposition cd = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                .filename(r.getFileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, cd.toString())
                .contentType(MediaType.parseMediaType(r.getContentType()))
                .body(file);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id, @RequestParam String author) {
        service.delete(id, author);
    }

    @GetMapping("/{id}/comments")
    public List<Comment> comments(@PathVariable String id) {
        return service.comments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment addComment(@PathVariable String id, @Valid @RequestBody CommentRequest req) {
        return service.addComment(id, req);
    }
}
