package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponse {
    private UUID id;
    private String lenderName;
    private String loanType;
    private BigDecimal initialAmount;
    private BigDecimal remainingCapital;
    private BigDecimal interestRate;
    private Boolean isFixedRate;
    private Integer durationMonths;
    private LocalDate startDate;
    private BigDecimal monthlyPayment;
    private Integer alertDaysBefore;
    private String notes;
    private Boolean isActive;
    private LocalDate nextDueDate;
    private BigDecimal totalPaid;
    private BigDecimal totalInterestPaid;
    private Double progressPercent;
}
