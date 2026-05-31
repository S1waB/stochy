package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavingGoalRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "Le montant cible est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal targetAmount;

    private String targetDate;

    @NotBlank(message = "Le mode de financement est obligatoire")
    private String fundingMode;
}
