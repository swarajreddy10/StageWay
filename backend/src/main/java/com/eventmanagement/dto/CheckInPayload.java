package com.eventmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CheckInPayload {
    @NotBlank(message = "QR data is required.")
    @Size(max = 2048, message = "QR data is too long.")
    private String qrData;

    public String getQrData() {
        return qrData;
    }
    public void setQrData(String qrData) {
        this.qrData = qrData;
    }
}
