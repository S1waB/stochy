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
public class TransactionResponse {
    private UUID id;
    private String title;
    private BigDecimal amount;
    private String type;
    private String expenseType;
    private String incomeType;
    private String savingMode;
    private UUID categoryId;
    private String categoryName;
    private String categoryColor;
    private String scope;
    private Integer priority;
    private Boolean isRecurring;
    private String frequency;
    private Integer recurrenceDay;
    private Boolean autoProcess;
    private LocalDate lastProcessedDate;
    private LocalDate transactionDate;
    private String attachmentUrl;
    private String notes;
    private UUID loanId;
    private UUID debtId;
    private LocalDateTime createdAt;
}
