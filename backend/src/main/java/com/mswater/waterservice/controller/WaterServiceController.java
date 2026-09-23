package com.mswater.waterservice.controller;

import com.mswater.common.response.ApiResponse;
import com.mswater.waterservice.entity.WaterService;
import com.mswater.waterservice.repository.WaterServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class WaterServiceController {

    private final WaterServiceRepository waterServiceRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WaterService>>> getActiveServices() {
        List<WaterService> services = waterServiceRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('OWNER')")
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WaterService>> updateService(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        WaterService service = waterServiceRepository.findById(id)
                .orElseThrow(() -> new com.mswater.common.exception.ResourceNotFoundException("WaterService", "id", id));

        if (body.containsKey("price")) {
            service.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        }
        if (body.containsKey("isActive")) {
            service.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
        }
        if (body.containsKey("displayName")) {
            service.setDisplayName(body.get("displayName").toString());
        }

        service = waterServiceRepository.save(service);
        return ResponseEntity.ok(ApiResponse.success("Service updated", service));
    }
}
