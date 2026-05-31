package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Period period;
    private Summary summary;
    private List<CategoryExpense> expensesByCategory;
    private CategoryExpense topExpenseCategory;
    private List<BudgetStatusResponse> budgetStatus;
    private List<GoalProgress> goalsProgress;
    private List<MonthlyComparison> incomeVsExpensesLast6Months;
    private List<UpcomingTransaction> upcomingTransactions;
    private List<NotificationInfo> activeAlerts;
    private SavingsBalanceInfo savingsBalance;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Period {
        private Integer month;
        private Integer year;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Summary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal totalSaving;
        private BigDecimal netBalance;
        private Double savingsRate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryExpense {
        private String categoryName;
        private BigDecimal amount;
        private Double percentage;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GoalProgress {
        private String goalName;
        private Double progressPercent;
        private BigDecimal currentAmount;
        private BigDecimal targetAmount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyComparison {
        private String month;
        private BigDecimal income;
        private BigDecimal expenses;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpcomingTransaction {
        private String title;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String type;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class NotificationInfo {
        private String title;
        private String message;
        private String type;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SavingsBalanceInfo {
        private BigDecimal totalSaved;
        private BigDecimal allocatedToGoals;
        private BigDecimal freeBalance;
    }
}
