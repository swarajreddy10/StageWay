package com.eventmanagement.service;

import com.eventmanagement.dto.FileAsset;
import com.eventmanagement.model.FileUpload;
import com.eventmanagement.repository.FileUploadRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileStorageService {
    private final AuthService authService;
    private final FileUploadRepository fileUploadRepository;
    private final Path uploadRoot;
    private final RestTemplate restTemplate;
    private final String supabaseUrl;
    private final String supabaseServiceRoleKey;
    private final String supabaseStorageBucket;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        ".jpg",
        ".jpeg",
        ".png",
        ".heic",
        ".heif"
    );
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/heic",
        "image/heif",
        "image/heic-sequence",
        "image/heif-sequence"
    );

    public FileStorageService(
        AuthService authService,
        FileUploadRepository fileUploadRepository,
        RestTemplate restTemplate,
        @Value("${supabase.url:}") String supabaseUrl,
        @Value("${supabase.service-role-key:}") String supabaseServiceRoleKey,
        @Value("${supabase.storage.bucket:}") String supabaseStorageBucket
    ) {
        this.authService = authService;
        this.fileUploadRepository = fileUploadRepository;
        this.restTemplate = restTemplate;
        this.supabaseUrl = supabaseUrl;
        this.supabaseServiceRoleKey = supabaseServiceRoleKey;
        this.supabaseStorageBucket = supabaseStorageBucket;
        this.uploadRoot = Paths.get("uploads");
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to create upload directory.", ex);
        }
    }

    public FileAsset uploadFile(MultipartFile file, String authHeader) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required.");
        }
        Long userId = authService.validateAuth(authHeader);
        String originalFilename = file.getOriginalFilename();
        String extension = resolveExtension(originalFilename);
        validateImageFile(file, extension);
        String id = UUID.randomUUID().toString();
        String storedFilename = id + extension;
        String storagePath = resolveStoragePath(storedFilename);

        if (isSupabaseStorageEnabled()) {
            uploadToSupabase(file, storagePath);
        } else {
            Path targetPath = uploadRoot.resolve(storedFilename);
            try {
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed.");
            }
        }

        FileUpload upload = new FileUpload();
        upload.setId(id);
        upload.setOriginalFilename(originalFilename != null ? originalFilename : "upload");
        upload.setStoredFilename(storagePath);
        upload.setContentType(file.getContentType() != null
            ? file.getContentType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE);
        upload.setSizeBytes(file.getSize());
        upload.setOwnerId(userId);
        upload.setPublic(true);
        FileUpload saved = fileUploadRepository.save(upload);

        return new FileAsset(
            saved.getId(),
            saved.getOriginalFilename(),
            saved.getContentType(),
            saved.getSizeBytes(),
            saved.getOwnerId() != null ? saved.getOwnerId() : 0,
            saved.getCreatedAt() != null ? saved.getCreatedAt() : OffsetDateTime.now(ZoneOffset.UTC)
        );
    }

    public ResponseEntity<byte[]> downloadFile(String id, String authHeader) {
        if (id == null || id.isBlank() || id.contains("..") || id.contains("/") || id.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file id.");
        }
        FileUpload upload = fileUploadRepository.findById(id).orElse(null);
        enforceDownloadAccess(upload, authHeader);
        if (upload != null && isSupabaseStorageEnabled()) {
            String publicUrl = buildSupabasePublicUrl(upload.getStoredFilename());
            return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, publicUrl)
                .build();
        }
        Path path = resolveFilePath(id, upload);
        if (path == null || !Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found.");
        }
        try {
            byte[] bytes = Files.readAllBytes(path);
            String contentType = upload != null ? upload.getContentType() : Files.probeContentType(path);
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read file.");
        }
    }

    private void enforceDownloadAccess(FileUpload upload, String authHeader) {
        if (upload == null || upload.isPublic()) {
            return;
        }
        Long userId = authService.validateOptionalAuth(authHeader);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        if (upload.getOwnerId() != null && upload.getOwnerId().equals(userId)) {
            return;
        }
        if (authService.isAdmin(userId)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
    }

    private String resolveExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int index = filename.lastIndexOf('.');
        if (index <= 0 || index == filename.length() - 1) {
            return "";
        }
        return filename.substring(index).toLowerCase();
    }

    private void validateImageFile(MultipartFile file, String extension) {
        String contentType = file.getContentType();
        boolean contentTypeAllowed = contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType);
        boolean extensionAllowed = extension != null && ALLOWED_EXTENSIONS.contains(extension);

        if (!contentTypeAllowed && !extensionAllowed) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only JPG, PNG, and HEIC images are allowed."
            );
        }
    }

    private Path resolveFilePath(String id, FileUpload upload) {
        if (upload != null && upload.getStoredFilename() != null) {
            String stored = upload.getStoredFilename();
            if (!stored.contains("/")) {
                return uploadRoot.resolve(stored);
            }
        }
        try (var stream = Files.list(uploadRoot)) {
            return stream
                .filter(candidate -> candidate.getFileName().toString().startsWith(id))
                .findFirst()
                .orElse(null);
        } catch (IOException ex) {
            return null;
        }
    }

    private boolean isSupabaseStorageEnabled() {
        return supabaseUrl != null && !supabaseUrl.isBlank()
            && supabaseServiceRoleKey != null && !supabaseServiceRoleKey.isBlank()
            && supabaseStorageBucket != null && !supabaseStorageBucket.isBlank();
    }

    private String resolveStoragePath(String storedFilename) {
        if (isSupabaseStorageEnabled()) {
            return "uploads/" + storedFilename;
        }
        return storedFilename;
    }

    private void uploadToSupabase(MultipartFile file, String storagePath) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
            headers.set("apikey", supabaseServiceRoleKey);
            if (file.getContentType() != null && !file.getContentType().isBlank()) {
                headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            }
            headers.add("x-upsert", "true");
            byte[] payload = file.getBytes();
            String url = normalizeSupabaseUrl()
                + "/storage/v1/object/"
                + supabaseStorageBucket
                + "/"
                + storagePath;
            restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), String.class);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed.");
        }
    }

    private String buildSupabasePublicUrl(String storagePath) {
        return normalizeSupabaseUrl()
            + "/storage/v1/object/public/"
            + supabaseStorageBucket
            + "/"
            + storagePath;
    }

    private String normalizeSupabaseUrl() {
        if (supabaseUrl == null) {
            return "";
        }
        return supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
    }
}
