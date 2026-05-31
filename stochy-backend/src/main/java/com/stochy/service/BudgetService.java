package com.stochy.service;

import com.stochy.dto.request.BudgetRequest;
import com.stochy.dto.response.BudgetResponse;
import com.stochy.dto.response.BudgetStatusResponse;
import com.stochy.entity.Budget;
import com.stochy.entity.Category;
import com.stochy.entity.User;
import com.stochy.enums.TransactionType;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.BudgetRepository;
import com.stochy.repository.CategoryRepository;
import com.stochy.repository.TransactionRepository;
import com.stochy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository,
                         CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public BudgetResponse createOrUpdateBudget(UUID userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Budget budget;
        if (request.getCategoryId() != null) {
            budget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                    userId, request.getCategoryId(), request.getMonth(), request.getYear()
            ).orElse(null);
        } else {
            budget = budgetRepository.findByUserIdAndCategoryIsNullAndMonthAndYear(
                    userId, request.getMonth(), request.getYear()
            ).orElse(null);
        }

        if (budget == null) {
            budget = new Budget();
            budget.setUser(user);
            budget.setMonth(request.getMonth());
            budget.setYear(request.getYear());

            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
                budget.setCategory(category);
            }
        }

        budget.setAmount(request.getAmount());
        if (request.getAlertThresholdPct() != null) {
            budget.setAlertThresholdPct(request.getAlertThresholdPct());
        }

        budget = budgetRepository.save(budget);
        return mapToResponse(budget);
    }

    public List<BudgetResponse> getBudgets(UUID userId, Integer month, Integer year) {
        List<Budget> budgets;
        if (month != null && year != null) {
            budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        } else {
            budgets = budgetRepository.findByUserId(userId);
        }
        return budgets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BudgetStatusResponse> getBudgetStatus(UUID userId, int month, int year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        List<BudgetStatusResponse> statuses = new ArrayList<>();

        for (Budget budget : budgets) {
            BigDecimal spent;
            String categoryName;

            if (budget.getCategory() != null) {
                spent = transactionRepository.sumByUserAndTypeAndCategoryAndMonth(
                        userId, TransactionType.EXPENSE, budget.getCategory().getId(), month, year);
                categoryName = budget.getCategory().getName();
            } else {
                spent = transactionRepository.sumByUserAndTypeAndMonth(userId, TransactionType.EXPENSE, month, year);
                categoryName = "Global";
            }

            BigDecimal remaining = budget.getAmount().subtract(spent);
            double usage = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                    ? spent.doubleValue() / budget.getAmount().doubleValue() * 100 : 0;

            String status;
            if (usage >= 100) status = "RED";
            else if (usage >= budget.getAlertThresholdPct()) status = "ORANGE";
            else status = "GREEN";

            statuses.add(BudgetStatusResponse.builder()
                    .budget(mapToResponse(budget))
                    .categoryName(categoryName)
                    .budgetedAmount(budget.getAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .usagePercent(usage)
                    .status(status)
                    .build());
        }

        return statuses;
    }

    @Transactional
    public int duplicateBudgets(UUID userId, int sourceMonth, int sourceYear, int targetMonth, int targetYear) {
        List<Budget> sourceBudgets = budgetRepository.findByUserIdAndMonthAndYear(userId, sourceMonth, sourceYear);
        int count = 0;
        for (Budget source : sourceBudgets) {
            UUID catId = source.getCategory() != null ? source.getCategory().getId() : null;
            boolean exists;
            if (catId != null) {
                exists = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, catId, targetMonth, targetYear).isPresent();
            } else {
                exists = budgetRepository.findByUserIdAndCategoryIsNullAndMonthAndYear(userId, targetMonth, targetYear).isPresent();
            }
            if (!exists) {
                Budget newBudget = Budget.builder()
                        .user(source.getUser())
                        .category(source.getCategory())
                        .month(targetMonth)
                        .year(targetYear)
                        .amount(source.getAmount())
                        .alertThresholdPct(source.getAlertThresholdPct())
                        .build();
                budgetRepository.save(newBudget);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public void deleteBudget(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget introuvable avec l'ID: " + budgetId));
        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Accès non autorisé.");
        }
        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : "Global")
                .month(budget.getMonth())
                .year(budget.getYear())
                .amount(budget.getAmount())
                .alertThresholdPct(budget.getAlertThresholdPct())
                .build();
    }
}
