package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtResponse {
    private UUID id;
    private String debtorName;
    private BigDecimal amountLent;
    private BigDecimal remainingAmount;
    private String status;
    private LocalDate loanDate;
    private LocalDate expectedRepaymentDate;
    private String notes;
    private List<RepaymentInfo> repayments;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepaymentInfo {
        private UUID id;
        private BigDecimal amount;
        private LocalDate repaymentDate;
        private String notes;
    }
}
