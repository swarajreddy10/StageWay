package com.eventmanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "file_uploads")
public class FileUpload {
    @Id
    @Column(length = 36)
    private String id;
    @Column(name = "original_filename", length = 255, nullable = false)
    private String originalFilename;
    @Column(name = "stored_filename", length = 255, nullable = false)
    private String storedFilename;
    @Column(name = "content_type", length = 120, nullable = false)
    private String contentType;
    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;
    @Column(name = "owner_id")
    private Long ownerId;
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public FileUpload() {}

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getOriginalFilename() {
        return originalFilename;
    }
    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }
    public String getStoredFilename() {
        return storedFilename;
    }
    public void setStoredFilename(String storedFilename) {
        this.storedFilename = storedFilename;
    }
    public String getContentType() {
        return contentType;
    }
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    public Long getSizeBytes() {
        return sizeBytes;
    }
    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
    public Long getOwnerId() {
        return ownerId;
    }
    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
    public boolean isPublic() {
        return isPublic;
    }
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
