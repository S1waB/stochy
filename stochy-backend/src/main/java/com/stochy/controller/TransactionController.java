package com.stochy.controller;

import com.stochy.dto.request.TransactionRequest;
import com.stochy.dto.response.TransactionResponse;
import com.stochy.enums.Scope;
import com.stochy.enums.TransactionType;
import com.stochy.service.AuthService;
import com.stochy.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AuthService authService;

    public TransactionController(TransactionService transactionService, AuthService authService) {
        this.transactionService = transactionService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(authService.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) Boolean isRecurring,
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) Integer minPriority,
            @RequestParam(required = false) Integer maxPriority,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {

        TransactionType txType = type != null ? TransactionType.valueOf(type) : null;
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
        Scope txScope = scope != null ? Scope.valueOf(scope) : null;

        return ResponseEntity.ok(transactionService.getTransactions(authService.getCurrentUserId(),
                txType, categoryId, start, end, minAmount, maxAmount, isRecurring, txScope,
                minPriority, maxPriority, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getTransaction(authService.getCurrentUserId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(@PathVariable UUID id, @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(authService.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        transactionService.deleteTransaction(authService.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
