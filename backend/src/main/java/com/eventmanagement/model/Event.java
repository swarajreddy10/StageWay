package com.eventmanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200)
    private String name;
    @Column(length = 2000)
    private String description;
    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;
    @Column(name = "ends_at", nullable = false)
    private OffsetDateTime endsAt;
    @Column(nullable = false, length = 20)
    private String status;
    private Integer capacity;
    @Column(name = "organization_id")
    private Long organizationId;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    @Column(name = "venue_name", length = 200)
    private String venueName;
    @Column(name = "venue_address", length = 300)
    private String venueAddress;
    @Column(length = 120)
    private String city;
    @Column(length = 120)
    private String category;
    @Column(length = 500)
    private String tags;
    @Column(name = "banner_image_url", length = 500)
    private String bannerImageUrl;
    @Column(name = "price_range", length = 120)
    private String priceRange;
    @Column(name = "price_amount")
    private Double priceAmount;
    @Column(name = "price_currency", length = 3)
    private String priceCurrency;
    @Column(name = "organizer_name", length = 200)
    private String organizerName;

    public Event() {}

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public OffsetDateTime getStartsAt() {
        return startsAt;
    }
    public void setStartsAt(OffsetDateTime startsAt) {
        this.startsAt = startsAt;
    }
    public OffsetDateTime getEndsAt() {
        return endsAt;
    }
    public void setEndsAt(OffsetDateTime endsAt) {
        this.endsAt = endsAt;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public Integer getCapacity() {
        return capacity;
    }
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    public Long getOrganizationId() {
        return organizationId;
    }
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    public String getVenueName() {
        return venueName;
    }
    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }
    public String getVenueAddress() {
        return venueAddress;
    }
    public void setVenueAddress(String venueAddress) {
        this.venueAddress = venueAddress;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public String getTags() {
        return tags;
    }
    public void setTags(String tags) {
        this.tags = tags;
    }
    public String getBannerImageUrl() {
        return bannerImageUrl;
    }
    public void setBannerImageUrl(String bannerImageUrl) {
        this.bannerImageUrl = bannerImageUrl;
    }
    public String getPriceRange() {
        return priceRange;
    }
    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }
    public Double getPriceAmount() {
        return priceAmount;
    }
    public void setPriceAmount(Double priceAmount) {
        this.priceAmount = priceAmount;
    }
    public String getPriceCurrency() {
        return priceCurrency;
    }
    public void setPriceCurrency(String priceCurrency) {
        this.priceCurrency = priceCurrency;
    }
    public String getOrganizerName() {
        return organizerName;
    }
    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
