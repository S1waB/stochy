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
public class LoanAmortizationResponse {
    private UUID loanId;
    private List<Installment> schedule;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Installment {
        private Integer installmentNumber;
        private LocalDate dueDate;
        private BigDecimal principalAmount;
        private BigDecimal interestAmount;
        private BigDecimal totalAmount;
        private BigDecimal remainingCapital;
        private Boolean isPaid;
        private LocalDate paymentDate;
    }
}
