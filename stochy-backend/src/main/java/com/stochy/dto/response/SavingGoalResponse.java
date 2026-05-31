package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingGoalResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private Double progressPercent;
    private LocalDate targetDate;
    private BigDecimal monthlyRecommended;
    private LocalDate estimatedCompletionDate;
    private String fundingMode;
    private Boolean isActive;
    private Boolean isCompleted;
}
