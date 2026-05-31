package com.stochy.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavingConfigRequest {

    @NotBlank(message = "Le mode est obligatoire")
    private String mode;

    private BigDecimal fixedAmount;
    private BigDecimal percentage;
    private Boolean applyToAllIncomes;
    private List<String> specificIncomeTypes;
    private String frequency;
    private Integer recurrenceDay;
}
