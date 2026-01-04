package com.eventmanagement.util;

import com.eventmanagement.dto.PriceInfo;

public final class PriceParser {
    private PriceParser() {}

    public static PriceInfo fromRange(String priceRange) {
        if (priceRange == null || priceRange.isBlank()) {
            return new PriceInfo(0, "USD");
        }
        String trimmed = priceRange.trim();
        if (trimmed.equalsIgnoreCase("FREE")) {
            return new PriceInfo(0, "USD");
        }
        String[] parts = trimmed.split("\\s+");
        String currency = parts.length > 1 ? parts[0].toUpperCase() : "USD";
        String numberPart = parts.length > 1 ? parts[1] : parts[0];
        if (numberPart.contains("-")) {
            numberPart = numberPart.split("-")[0];
        }
        numberPart = numberPart.replaceAll("[^0-9.]", "");
        double price = 0;
        try {
            if (!numberPart.isBlank()) {
                price = Double.parseDouble(numberPart);
            }
        } catch (NumberFormatException ignored) {
            price = 0;
        }
        return new PriceInfo(price, currency);
    }
}
