package com.stochy.service;

import com.stochy.dto.response.CashFlowForecastResponse;
import com.stochy.entity.Transaction;
import com.stochy.enums.TransactionType;
import com.stochy.repository.LoanRepository;
import com.stochy.repository.SavingConfigRepository;
import com.stochy.repository.TransactionRepository;
import com.stochy.entity.SavingConfig;
import com.stochy.enums.SavingMode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ForecastService {

    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final SavingConfigRepository savingConfigRepository;

    public ForecastService(TransactionRepository transactionRepository, LoanRepository loanRepository,
                           SavingConfigRepository savingConfigRepository) {
        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
        this.savingConfigRepository = savingConfigRepository;
    }

    public CashFlowForecastResponse getForecast(UUID userId, int months) {
        List<Transaction> recurringIncome = transactionRepository.findByUserIdAndIsRecurringTrueAndType(userId, TransactionType.INCOME);
        List<Transaction> recurringExpense = transactionRepository.findByUserIdAndIsRecurringTrueAndType(userId, TransactionType.EXPENSE);

        BigDecimal monthlyIncome = recurringIncome.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal monthlyExpense = recurringExpense.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal loanPayments = loanRepository.sumMonthlyPaymentsByUserId(userId);

        BigDecimal plannedSaving = BigDecimal.ZERO;
        List<SavingConfig> activeConfigs = savingConfigRepository.findByUserIdAndIsActiveTrue(userId);
        for (SavingConfig config : activeConfigs) {
            if (config.getMode() == SavingMode.FIXED && config.getFixedAmount() != null) {
                plannedSaving = plannedSaving.add(config.getFixedAmount());
            } else if (config.getMode() == SavingMode.PERCENTAGE && config.getPercentage() != null) {
                plannedSaving = plannedSaving.add(monthlyIncome.multiply(config.getPercentage()).divide(BigDecimal.valueOf(100)));
            }
        }

        List<CashFlowForecastResponse.ForecastMonth> forecastMonths = new ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = 1; i <= months; i++) {
            YearMonth ym = current.plusMonths(i);
            BigDecimal projectedBalance = monthlyIncome.subtract(monthlyExpense).subtract(plannedSaving).subtract(loanPayments);
            boolean isDeficit = projectedBalance.compareTo(BigDecimal.ZERO) < 0;

            List<String> alerts = new ArrayList<>();
            if (isDeficit) {
                alerts.add("⚠️ Déficit prévu de " + projectedBalance.abs() + " pour " + ym);
            }

            forecastMonths.add(CashFlowForecastResponse.ForecastMonth.builder()
                    .month(ym.toString())
                    .expectedIncome(monthlyIncome)
                    .expectedExpenses(monthlyExpense)
                    .plannedSaving(plannedSaving)
                    .loanPayments(loanPayments)
                    .projectedBalance(projectedBalance)
                    .isDeficit(isDeficit)
                    .alerts(alerts)
                    .build());
        }

        List<String> suggestions = new ArrayList<>();
        if (monthlyExpense.compareTo(BigDecimal.ZERO) > 0 && monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            double expenseRatio = monthlyExpense.doubleValue() / monthlyIncome.doubleValue() * 100;
            if (expenseRatio > 80) {
                suggestions.add("Vos dépenses récurrentes représentent " + Math.round(expenseRatio) + "% de vos revenus. Pensez à réduire certaines dépenses.");
            }
        }
        if (plannedSaving.compareTo(BigDecimal.ZERO) == 0) {
            suggestions.add("Vous n'avez aucune épargne automatique configurée. Pensez à mettre en place une épargne régulière.");
        }
        if (loanPayments.compareTo(BigDecimal.ZERO) > 0) {
            suggestions.add("Vos mensualités de prêts s'élèvent à " + loanPayments + " par mois.");
        }

        return CashFlowForecastResponse.builder()
                .forecastMonths(forecastMonths)
                .suggestions(suggestions)
                .build();
    }
}
