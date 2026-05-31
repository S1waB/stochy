package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DebtRequest {

    @NotBlank(message = "Le nom du débiteur est obligatoire")
    private String debtorName;

    @NotNull(message = "Le montant prêté est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal amountLent;

    @NotBlank(message = "La date de prêt est obligatoire")
    private String loanDate;

    private String expectedRepaymentDate;
    private String notes;
}
