package com.stochy.service;

import com.stochy.dto.response.BudgetStatusResponse;
import com.stochy.dto.response.DashboardResponse;
import com.stochy.entity.Notification;
import com.stochy.entity.Transaction;
import com.stochy.enums.TransactionType;
import com.stochy.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;
    private final SavingGoalRepository savingGoalRepository;
    private final NotificationRepository notificationRepository;
    private final SavingService savingService;

    public DashboardService(TransactionRepository transactionRepository, BudgetService budgetService,
                            SavingGoalRepository savingGoalRepository, NotificationRepository notificationRepository,
                            SavingService savingService) {
        this.transactionRepository = transactionRepository;
        this.budgetService = budgetService;
        this.savingGoalRepository = savingGoalRepository;
        this.notificationRepository = notificationRepository;
        this.savingService = savingService;
    }

    public DashboardResponse getDashboard(UUID userId, int month, int year) {
        // Summary
        BigDecimal totalIncome = transactionRepository.sumByUserAndTypeAndMonth(userId, TransactionType.INCOME, month, year);
        BigDecimal totalExpenses = transactionRepository.sumByUserAndTypeAndMonth(userId, TransactionType.EXPENSE, month, year);
        BigDecimal totalSaving = transactionRepository.sumByUserAndTypeAndMonth(userId, TransactionType.SAVING, month, year);
        BigDecimal netBalance = totalIncome.subtract(totalExpenses).subtract(totalSaving);
        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? totalSaving.doubleValue() / totalIncome.doubleValue() * 100 : 0;

        // Expenses by category
        List<Object[]> expenseData = transactionRepository.sumExpensesByCategoryAndMonth(userId, month, year);
        List<DashboardResponse.CategoryExpense> expensesByCategory = new ArrayList<>();
        DashboardResponse.CategoryExpense topCategory = null;

        for (Object[] row : expenseData) {
            String catName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            double pct = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                    ? amount.doubleValue() / totalExpenses.doubleValue() * 100 : 0;

            DashboardResponse.CategoryExpense ce = DashboardResponse.CategoryExpense.builder()
                    .categoryName(catName).amount(amount).percentage(pct).build();
            expensesByCategory.add(ce);
            if (topCategory == null || amount.compareTo(topCategory.getAmount()) > 0) {
                topCategory = ce;
            }
        }

        // Budget status
        List<BudgetStatusResponse> budgetStatus = budgetService.getBudgetStatus(userId, month, year);

        // Goals progress
        List<DashboardResponse.GoalProgress> goalsProgress = savingGoalRepository.findByUserIdAndIsActiveAndIsCompleted(userId, true, false)
                .stream().map(g -> DashboardResponse.GoalProgress.builder()
                        .goalName(g.getName())
                        .currentAmount(g.getCurrentAmount())
                        .targetAmount(g.getTargetAmount())
                        .progressPercent(g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                                ? g.getCurrentAmount().doubleValue() / g.getTargetAmount().doubleValue() * 100 : 0)
                        .build())
                .collect(Collectors.toList());

        // Income vs Expenses last 6 months
        List<DashboardResponse.MonthlyComparison> last6Months = new ArrayList<>();
        YearMonth current = YearMonth.of(year, month);
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            BigDecimal inc = transactionRepository.sumByUserAndTypeAndMonth(userId, TransactionType.INCOME, ym.getMonthValue(), ym.getYear());
            BigDecimal exp = transactionRepository.sumByUserAndTypeAndMonth(userId, TransactionType.EXPENSE, ym.getMonthValue(), ym.getYear());
            last6Months.add(DashboardResponse.MonthlyComparison.builder()
                    .month(ym.toString()).income(inc).expenses(exp).build());
        }

        // Upcoming recurring
        List<Transaction> recurring = transactionRepository.findUpcomingRecurring(userId);
        List<DashboardResponse.UpcomingTransaction> upcoming = recurring.stream().limit(5)
                .map(t -> DashboardResponse.UpcomingTransaction.builder()
                        .title(t.getTitle()).amount(t.getAmount())
                        .dueDate(t.getTransactionDate()).type(t.getType().name()).build())
                .collect(Collectors.toList());

        // Active alerts
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        List<DashboardResponse.NotificationInfo> alerts = unread.stream().limit(5)
                .map(n -> DashboardResponse.NotificationInfo.builder()
                        .title(n.getTitle()).message(n.getMessage()).type(n.getType()).build())
                .collect(Collectors.toList());

        // Savings balance
        var balanceMap = savingService.getSavingsBalance(userId);
        DashboardResponse.SavingsBalanceInfo savingsBalance = DashboardResponse.SavingsBalanceInfo.builder()
                .totalSaved(balanceMap.get("totalSaved"))
                .allocatedToGoals(balanceMap.get("allocatedToGoals"))
                .freeBalance(balanceMap.get("freeBalance"))
                .build();

        return DashboardResponse.builder()
                .period(DashboardResponse.Period.builder().month(month).year(year).build())
                .summary(DashboardResponse.Summary.builder()
                        .totalIncome(totalIncome).totalExpenses(totalExpenses)
                        .totalSaving(totalSaving).netBalance(netBalance).savingsRate(savingsRate).build())
                .expensesByCategory(expensesByCategory)
                .topExpenseCategory(topCategory)
                .budgetStatus(budgetStatus)
                .goalsProgress(goalsProgress)
                .incomeVsExpensesLast6Months(last6Months)
                .upcomingTransactions(upcoming)
                .activeAlerts(alerts)
                .savingsBalance(savingsBalance)
                .build();
    }
}
