package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanRequest {

    @NotBlank(message = "Le nom du prêteur est obligatoire")
    private String lenderName;

    @NotBlank(message = "Le type de prêt est obligatoire")
    private String loanType;

    @NotNull(message = "Le montant initial est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal initialAmount;

    @NotNull(message = "Le taux d'intérêt est obligatoire")
    private BigDecimal interestRate;

    private Boolean isFixedRate;

    @NotNull(message = "La durée est obligatoire")
    @Min(1)
    private Integer durationMonths;

    @NotBlank(message = "La date de début est obligatoire")
    private String startDate;

    @NotNull(message = "La mensualité est obligatoire")
    @DecimalMin(value = "0.01")
    private BigDecimal monthlyPayment;

    private Integer alertDaysBefore;
    private String notes;
}
