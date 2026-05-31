package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DebtRepaymentRequest {

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotBlank(message = "La date de remboursement est obligatoire")
    private String repaymentDate;

    private String notes;
}
