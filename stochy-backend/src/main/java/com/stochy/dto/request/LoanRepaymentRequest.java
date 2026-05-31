package com.stochy.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepaymentRequest {

    @NotBlank(message = "L'ID du remboursement est obligatoire")
    private UUID repaymentId;

    private String paymentDate;
    private String notes;
}
