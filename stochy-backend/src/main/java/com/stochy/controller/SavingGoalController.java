package com.stochy.controller;

import com.stochy.dto.request.GoalContributionRequest;
import com.stochy.dto.request.SavingGoalRequest;
import com.stochy.dto.response.SavingGoalResponse;
import com.stochy.service.AuthService;
import com.stochy.service.SavingGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals")
public class SavingGoalController {

    private final SavingGoalService savingGoalService;
    private final AuthService authService;

    public SavingGoalController(SavingGoalService savingGoalService, AuthService authService) {
        this.savingGoalService = savingGoalService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<SavingGoalResponse> create(@Valid @RequestBody SavingGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savingGoalService.createGoal(authService.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<SavingGoalResponse>> list(@RequestParam(required = false) Boolean isActive,
                                                          @RequestParam(required = false) Boolean isCompleted) {
        return ResponseEntity.ok(savingGoalService.getGoals(authService.getCurrentUserId(), isActive, isCompleted));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingGoalResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(savingGoalService.getGoal(authService.getCurrentUserId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingGoalResponse> update(@PathVariable UUID id, @Valid @RequestBody SavingGoalRequest request) {
        return ResponseEntity.ok(savingGoalService.updateGoal(authService.getCurrentUserId(), id, request));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<SavingGoalResponse> contribute(@PathVariable UUID id,
                                                          @Valid @RequestBody GoalContributionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savingGoalService.contribute(authService.getCurrentUserId(), id, request));
    }

    @PatchMapping("/{id}/funding-mode")
    public ResponseEntity<SavingGoalResponse> changeFundingMode(@PathVariable UUID id,
                                                                 @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(savingGoalService.changeFundingMode(
                authService.getCurrentUserId(), id, body.get("fundingMode")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        savingGoalService.deleteGoal(authService.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
