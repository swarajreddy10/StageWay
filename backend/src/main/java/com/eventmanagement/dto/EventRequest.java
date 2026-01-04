package com.eventmanagement.dto;

import com.eventmanagement.dto.validation.OnCreate;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.List;

public class EventRequest {
    @NotBlank(groups = OnCreate.class, message = "Event name is required.")
    @Size(max = 200, message = "Event name must be at most 200 characters.")
    private String name;
    @Size(max = 2000, message = "Description must be at most 2000 characters.")
    private String description;
    @Size(max = 120, message = "Category must be at most 120 characters.")
    private String category;
    private String startDate;
    private String endDate;
    @Size(max = 500, message = "Location must be at most 500 characters.")
    private String location;
    @Size(max = 200, message = "Venue name must be at most 200 characters.")
    private String venueName;
    @Min(value = 1, message = "Capacity must be at least 1.")
    @Max(value = 1000000, message = "Capacity is too large.")
    private Integer capacity;
    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative.")
    @DecimalMax(value = "1000000.0", message = "Price is too large.")
    private Double price;
    @Size(max = 3, message = "Currency must be a 3-letter code.")
    private String currency;
    @Size(max = 500, message = "Banner URL must be at most 500 characters.")
    private String bannerUrl;
    private List<String> tags;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    @Size(max = 20, message = "Status must be at most 20 characters.")
    private String status;
    private Long organizationId;
    @Size(max = 300, message = "Venue address must be at most 300 characters.")
    private String venueAddress;
    @Size(max = 120, message = "City must be at most 120 characters.")
    private String city;
    @Size(max = 500, message = "Banner image URL must be at most 500 characters.")
    private String bannerImageUrl;
    @Size(max = 120, message = "Price range must be at most 120 characters.")
    private String priceRange;
    @Size(max = 200, message = "Organizer name must be at most 200 characters.")
    private String organizerName;

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
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public String getStartDate() {
        return startDate;
    }
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
    public String getEndDate() {
        return endDate;
    }
    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public String getVenueName() {
        return venueName;
    }
    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }
    public Integer getCapacity() {
        return capacity;
    }
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }
    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public String getBannerUrl() {
        return bannerUrl;
    }
    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }
    public List<String> getTags() {
        return tags;
    }
    public void setTags(List<String> tags) {
        this.tags = tags;
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
    public Long getOrganizationId() {
        return organizationId;
    }
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
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
    public String getOrganizerName() {
        return organizerName;
    }
    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }
}
