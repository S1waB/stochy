package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashFlowForecastResponse {
    private List<ForecastMonth> forecastMonths;
    private List<String> suggestions;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ForecastMonth {
        private String month;
        private BigDecimal expectedIncome;
        private BigDecimal expectedExpenses;
        private BigDecimal plannedSaving;
        private BigDecimal loanPayments;
        private BigDecimal projectedBalance;
        private Boolean isDeficit;
        private List<String> alerts;
    }
}
