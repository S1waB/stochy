package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatusResponse {
    private BudgetResponse budget;
    private String categoryName;
    private BigDecimal budgetedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double usagePercent;
    private String status; // GREEN, ORANGE, RED
}
