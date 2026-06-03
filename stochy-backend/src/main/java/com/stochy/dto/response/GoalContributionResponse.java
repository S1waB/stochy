package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalContributionResponse {
    private UUID id;
    private BigDecimal amount;
    private LocalDate contributionDate;
    private Boolean isAutomatic;
    private String notes;
    private LocalDateTime createdAt;
}
