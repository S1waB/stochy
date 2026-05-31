package com.stochy.controller;

import com.stochy.dto.request.DebtRepaymentRequest;
import com.stochy.dto.request.DebtRequest;
import com.stochy.dto.response.DebtResponse;
import com.stochy.service.AuthService;
import com.stochy.service.DebtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/debts")
public class DebtController {

    private final DebtService debtService;
    private final AuthService authService;

    public DebtController(DebtService debtService, AuthService authService) {
        this.debtService = debtService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<DebtResponse> create(@Valid @RequestBody DebtRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(debtService.createDebt(authService.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<DebtResponse>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(debtService.getDebts(authService.getCurrentUserId(), status));
    }

    @PostMapping("/{id}/repayments")
    public ResponseEntity<DebtResponse> addRepayment(@PathVariable UUID id,
                                                      @Valid @RequestBody DebtRepaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(debtService.addRepayment(authService.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        debtService.deleteDebt(authService.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
