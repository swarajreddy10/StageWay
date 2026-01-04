package com.eventmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CheckInRequest {
    @NotBlank(message = "QR code is required.")
    @Size(max = 2048, message = "QR code payload is too long.")
    private String code;

    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
}
