package com.stochy.controller;

import com.stochy.dto.request.LoanRepaymentRequest;
import com.stochy.dto.request.LoanRequest;
import com.stochy.dto.response.LoanAmortizationResponse;
import com.stochy.dto.response.LoanResponse;
import com.stochy.service.AuthService;
import com.stochy.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {

    private final LoanService loanService;
    private final AuthService authService;

    public LoanController(LoanService loanService, AuthService authService) {
        this.loanService = loanService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<LoanResponse> create(@Valid @RequestBody LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(loanService.createLoan(authService.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<LoanResponse>> list() {
        return ResponseEntity.ok(loanService.getLoans(authService.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(loanService.getLoan(authService.getCurrentUserId(), id));
    }

    @GetMapping("/{id}/amortization")
    public ResponseEntity<LoanAmortizationResponse> getAmortization(@PathVariable UUID id) {
        return ResponseEntity.ok(loanService.getAmortization(authService.getCurrentUserId(), id));
    }

    @PostMapping("/{id}/repayments")
    public ResponseEntity<Void> markPaid(@PathVariable UUID id, @RequestBody LoanRepaymentRequest request) {
        loanService.markRepaymentPaid(authService.getCurrentUserId(), id, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        loanService.deleteLoan(authService.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
