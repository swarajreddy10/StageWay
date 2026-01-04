package com.eventmanagement.controller;

import com.eventmanagement.dto.FileAsset;
import com.eventmanagement.service.FileStorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class FileController {
    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/files", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public FileAsset uploadFile(
        @RequestPart("file") MultipartFile file,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return fileStorageService.uploadFile(file, authHeader);
    }

    @GetMapping("/files/{id}")
    public ResponseEntity<byte[]> downloadFile(
        @PathVariable String id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return fileStorageService.downloadFile(id, authHeader);
    }
}
