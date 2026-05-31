package com.stochy.controller;

import com.stochy.dto.request.SavingConfigRequest;
import com.stochy.dto.response.SavingConfigResponse;
import com.stochy.service.AuthService;
import com.stochy.service.SavingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/savings")
public class SavingController {

    private final SavingService savingService;
    private final AuthService authService;

    public SavingController(SavingService savingService, AuthService authService) {
        this.savingService = savingService;
        this.authService = authService;
    }

    @PostMapping("/configs")
    public ResponseEntity<SavingConfigResponse> createConfig(@Valid @RequestBody SavingConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savingService.createConfig(authService.getCurrentUserId(), request));
    }

    @GetMapping("/configs")
    public ResponseEntity<List<SavingConfigResponse>> getConfigs() {
        return ResponseEntity.ok(savingService.getConfigs(authService.getCurrentUserId()));
    }

    @PutMapping("/configs/{id}")
    public ResponseEntity<SavingConfigResponse> updateConfig(@PathVariable UUID id,
                                                              @Valid @RequestBody SavingConfigRequest request) {
        return ResponseEntity.ok(savingService.updateConfig(authService.getCurrentUserId(), id, request));
    }

    @PatchMapping("/configs/{id}/toggle")
    public ResponseEntity<SavingConfigResponse> toggleConfig(@PathVariable UUID id) {
        return ResponseEntity.ok(savingService.toggleConfig(authService.getCurrentUserId(), id));
    }

    @DeleteMapping("/configs/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable UUID id) {
        savingService.deleteConfig(authService.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> getBalance() {
        return ResponseEntity.ok(savingService.getSavingsBalance(authService.getCurrentUserId()));
    }
}
