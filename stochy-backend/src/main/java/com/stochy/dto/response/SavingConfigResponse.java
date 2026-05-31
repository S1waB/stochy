package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingConfigResponse {
    private UUID id;
    private String mode;
    private BigDecimal fixedAmount;
    private BigDecimal percentage;
    private Boolean applyToAllIncomes;
    private List<String> specificIncomeTypes;
    private String frequency;
    private Integer recurrenceDay;
    private Boolean isActive;
}
