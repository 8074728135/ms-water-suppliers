package com.mswater.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddressRequest {
    private String label = "Home";

    @NotBlank(message = "Address line 1 is required")
    private String addressLine1;

    private String addressLine2;
    private String landmark;
    private String area;
    private String city;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isDefault = false;
}
