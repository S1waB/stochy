package com.stochy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal amount;

    @NotBlank(message = "Le type est obligatoire")
    private String type;

    private String expenseType;
    private String incomeType;
    private String savingMode;
    private UUID categoryId;
    private String scope;
    private Integer priority;
    private Boolean isRecurring;
    private String frequency;
    private Integer recurrenceDay;
    private Boolean autoProcess;
    private String transactionDate;
    private String notes;
    private UUID loanId;
    private UUID debtId;
    private UUID savingConfigId;
}
