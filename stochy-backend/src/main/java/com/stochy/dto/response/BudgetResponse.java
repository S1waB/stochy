package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private Integer month;
    private Integer year;
    private BigDecimal amount;
    private Integer alertThresholdPct;
}
