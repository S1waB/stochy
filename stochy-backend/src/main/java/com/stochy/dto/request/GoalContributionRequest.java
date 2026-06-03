package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoalContributionRequest {

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    private String contributionDate;
    private String notes;
    private String source; // "MANUAL" or "FROM_SAVINGS"
}
