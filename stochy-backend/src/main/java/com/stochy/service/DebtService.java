package com.stochy.service;

import com.stochy.dto.request.DebtRepaymentRequest;
import com.stochy.dto.request.DebtRequest;
import com.stochy.dto.response.DebtResponse;
import com.stochy.entity.*;
import com.stochy.enums.DebtStatus;
import com.stochy.enums.IncomeType;
import com.stochy.enums.TransactionType;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DebtService {

    private final DebtRepository debtRepository;
    private final DebtRepaymentRepository debtRepaymentRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public DebtService(DebtRepository debtRepository, DebtRepaymentRepository debtRepaymentRepository,
                       UserRepository userRepository, TransactionRepository transactionRepository) {
        this.debtRepository = debtRepository;
        this.debtRepaymentRepository = debtRepaymentRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public DebtResponse createDebt(UUID userId, DebtRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Debt debt = Debt.builder()
                .user(user)
                .debtorName(request.getDebtorName())
                .amountLent(request.getAmountLent())
                .remainingAmount(request.getAmountLent())
                .loanDate(LocalDate.parse(request.getLoanDate()))
                .notes(request.getNotes())
                .build();

        if (request.getExpectedRepaymentDate() != null && !request.getExpectedRepaymentDate().isBlank()) {
            debt.setExpectedRepaymentDate(LocalDate.parse(request.getExpectedRepaymentDate()));
        }

        debt = debtRepository.save(debt);
        return mapToResponse(debt);
    }

    public List<DebtResponse> getDebts(UUID userId, String status) {
        List<Debt> debts;
        if (status != null && !status.isBlank()) {
            debts = debtRepository.findByUserIdAndStatus(userId, DebtStatus.valueOf(status));
        } else {
            debts = debtRepository.findByUserId(userId);
        }
        return debts.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public DebtResponse addRepayment(UUID userId, UUID debtId, DebtRepaymentRequest request) {
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new ResourceNotFoundException("Dette introuvable avec l'ID: " + debtId));
        if (!debt.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");

        DebtRepayment repayment = DebtRepayment.builder()
                .debt(debt)
                .amount(request.getAmount())
                .repaymentDate(LocalDate.parse(request.getRepaymentDate()))
                .notes(request.getNotes())
                .build();
        debtRepaymentRepository.save(repayment);

        debt.setRemainingAmount(debt.getRemainingAmount().subtract(request.getAmount()));
        if (debt.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            debt.setRemainingAmount(BigDecimal.ZERO);
            debt.setStatus(DebtStatus.SETTLED);
        } else {
            debt.setStatus(DebtStatus.PARTIALLY_REPAID);
        }
        debt = debtRepository.save(debt);

        // Create INCOME transaction
        User user = userRepository.findById(userId).orElseThrow();
        Transaction tx = Transaction.builder()
                .user(user)
                .title("Remboursement reçu - " + debt.getDebtorName())
                .amount(request.getAmount())
                .type(TransactionType.INCOME)
                .incomeType(IncomeType.OTHER)
                .debt(debt)
                .transactionDate(LocalDate.parse(request.getRepaymentDate()))
                .build();
        transactionRepository.save(tx);

        return mapToResponse(debt);
    }

    @Transactional
    public void deleteDebt(UUID userId, UUID debtId) {
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new ResourceNotFoundException("Dette introuvable"));
        if (!debt.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        debtRepository.delete(debt);
    }

    private DebtResponse mapToResponse(Debt debt) {
        List<DebtRepayment> repayments = debtRepaymentRepository.findByDebtIdOrderByRepaymentDateDesc(debt.getId());
        List<DebtResponse.RepaymentInfo> repaymentInfos = repayments.stream()
                .map(r -> DebtResponse.RepaymentInfo.builder()
                        .id(r.getId()).amount(r.getAmount())
                        .repaymentDate(r.getRepaymentDate()).notes(r.getNotes()).build())
                .collect(Collectors.toList());

        return DebtResponse.builder()
                .id(debt.getId())
                .debtorName(debt.getDebtorName())
                .amountLent(debt.getAmountLent())
                .remainingAmount(debt.getRemainingAmount())
                .status(debt.getStatus().name())
                .loanDate(debt.getLoanDate())
                .expectedRepaymentDate(debt.getExpectedRepaymentDate())
                .notes(debt.getNotes())
                .repayments(repaymentInfos)
                .build();
    }
}
