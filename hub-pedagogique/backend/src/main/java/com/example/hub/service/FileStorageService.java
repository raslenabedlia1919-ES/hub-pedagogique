package com.example.hub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${app.upload-dir}") String dir) throws IOException {
        this.root = Path.of(dir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    /** Enregistre le fichier avec un nom unique et retourne ce nom. */
    public String store(MultipartFile file) throws IOException {
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String safeExt = (ext == null) ? "" : "." + ext.replaceAll("[^A-Za-z0-9]", "");
        String stored = UUID.randomUUID() + safeExt;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(stored));
        }
        return stored;
    }

    public Resource load(String storedName) throws MalformedURLException {
        Path file = root.resolve(storedName).normalize();
        if (!file.startsWith(root)) {
            throw new IllegalArgumentException("Chemin invalide");
        }
        return new UrlResource(file.toUri());
    }

    public void delete(String storedName) {
        try {
            Files.deleteIfExists(root.resolve(storedName).normalize());
        } catch (IOException ignored) {
            // on ne bloque pas la suppression en base
        }
    }
}
