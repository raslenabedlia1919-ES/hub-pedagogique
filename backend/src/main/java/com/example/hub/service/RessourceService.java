package com.example.hub.service;

import com.example.hub.model.Comment;
import com.example.hub.model.CommentRequest;
import com.example.hub.model.Ressource;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Service
public class RessourceService {

    private final MongoTemplate mongo;
    private final FileStorageService storage;

    public RessourceService(MongoTemplate mongo, FileStorageService storage) {
        this.mongo = mongo;
        this.storage = storage;
    }

    /** Recherche partielle, insensible à la casse, sur titre / description / auteur + filtre catégorie. */
    public List<Ressource> search(String q, String category) {
        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "createdAt"));
        if (q != null && !q.isBlank()) {
            Pattern p = Pattern.compile(Pattern.quote(q.trim()), Pattern.CASE_INSENSITIVE);
            query.addCriteria(new Criteria().orOperator(
                    where("title").regex(p),
                    where("description").regex(p),
                    where("author").regex(p)));
        }
        if (category != null && !category.isBlank()) {
            query.addCriteria(where("category").is(category));
        }
        return mongo.find(query, Ressource.class);
    }

    public List<Ressource> byAuthor(String author) {
        Query query = new Query(where("author").is(author)).with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return mongo.find(query, Ressource.class);
    }

    public Ressource get(String id) {
        Ressource r = mongo.findById(id, Ressource.class);
        if (r == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ressource introuvable");
        }
        return r;
    }

    public Ressource create(String title, String description, String category, String author,
                            MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier vide");
        }
        Ressource r = new Ressource();
        r.setTitle(title.trim());
        r.setDescription(description.trim());
        r.setCategory(category);
        r.setAuthor(author.trim());
        r.setFileName(file.getOriginalFilename());
        r.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        r.setFileSize(file.getSize());
        r.setStoredName(storage.store(file));
        return mongo.save(r);
    }

    public void delete(String id, String author) {
        Ressource r = get(id);
        if (!r.getAuthor().equals(author)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez supprimer que vos publications");
        }
        storage.delete(r.getStoredName());
        mongo.remove(new Query(where("resourceId").is(id)), Comment.class);
        mongo.remove(r);
    }

    public List<Comment> comments(String id) {
        Query q = new Query(where("resourceId").is(id)).with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return mongo.find(q, Comment.class);
    }

    public Comment addComment(String id, CommentRequest req) {
        get(id); // vérifie l'existence
        Comment c = new Comment();
        c.setResourceId(id);
        c.setAuthor(req.author().trim());
        c.setContent(req.content().trim());
        return mongo.save(c);
    }
}
