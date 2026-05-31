package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {

    private UUID categoryId;

    @NotNull(message = "Le mois est obligatoire")
    @Min(1) @Max(12)
    private Integer month;

    @NotNull(message = "L'année est obligatoire")
    private Integer year;

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    private Integer alertThresholdPct;
}
