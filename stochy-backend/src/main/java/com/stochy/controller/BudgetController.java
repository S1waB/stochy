package com.stochy.controller;

import com.stochy.dto.request.BudgetRequest;
import com.stochy.dto.response.ApiResponse;
import com.stochy.dto.response.BudgetResponse;
import com.stochy.dto.response.BudgetStatusResponse;
import com.stochy.service.AuthService;
import com.stochy.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthService authService;

    public BudgetController(BudgetService budgetService, AuthService authService) {
        this.budgetService = budgetService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createOrUpdate(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createOrUpdateBudget(authService.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> list(@RequestParam(required = false) Integer month,
                                                      @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(budgetService.getBudgets(authService.getCurrentUserId(), month, year));
    }

    @GetMapping("/status")
    public ResponseEntity<List<BudgetStatusResponse>> status(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(budgetService.getBudgetStatus(authService.getCurrentUserId(), month, year));
    }

    @PostMapping("/duplicate")
    public ResponseEntity<ApiResponse> duplicate(@RequestBody Map<String, Integer> body) {
        int count = budgetService.duplicateBudgets(authService.getCurrentUserId(),
                body.get("sourceMonth"), body.get("sourceYear"),
                body.get("targetMonth"), body.get("targetYear"));
        return ResponseEntity.ok(new ApiResponse(count + " budgets dupliqués."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetService.deleteBudget(authService.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
