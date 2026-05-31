package com.stochy.service;

import com.stochy.dto.request.LoanRepaymentRequest;
import com.stochy.dto.request.LoanRequest;
import com.stochy.dto.response.LoanAmortizationResponse;
import com.stochy.dto.response.LoanResponse;
import com.stochy.entity.*;
import com.stochy.enums.*;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public LoanService(LoanRepository loanRepository, LoanRepaymentRepository loanRepaymentRepository,
                       UserRepository userRepository, TransactionRepository transactionRepository) {
        this.loanRepository = loanRepository;
        this.loanRepaymentRepository = loanRepaymentRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public LoanResponse createLoan(UUID userId, LoanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Loan loan = Loan.builder()
                .user(user)
                .lenderName(request.getLenderName())
                .loanType(LoanType.valueOf(request.getLoanType()))
                .initialAmount(request.getInitialAmount())
                .remainingCapital(request.getInitialAmount())
                .interestRate(request.getInterestRate())
                .isFixedRate(request.getIsFixedRate() != null ? request.getIsFixedRate() : true)
                .durationMonths(request.getDurationMonths())
                .startDate(LocalDate.parse(request.getStartDate()))
                .monthlyPayment(request.getMonthlyPayment())
                .alertDaysBefore(request.getAlertDaysBefore() != null ? request.getAlertDaysBefore() : 7)
                .notes(request.getNotes())
                .build();

        loan = loanRepository.save(loan);
        generateAmortizationSchedule(loan);
        return mapToResponse(loan);
    }

    private void generateAmortizationSchedule(Loan loan) {
        BigDecimal monthlyRate = loan.getInterestRate()
                .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        BigDecimal remainingCapital = loan.getInitialAmount();
        LocalDate dueDate = loan.getStartDate().plusMonths(1);

        for (int i = 1; i <= loan.getDurationMonths(); i++) {
            BigDecimal interestAmount = remainingCapital.multiply(monthlyRate)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalAmount = loan.getMonthlyPayment().subtract(interestAmount);

            if (i == loan.getDurationMonths()) {
                principalAmount = remainingCapital;
            }

            BigDecimal totalAmount = principalAmount.add(interestAmount);
            remainingCapital = remainingCapital.subtract(principalAmount);
            if (remainingCapital.compareTo(BigDecimal.ZERO) < 0) {
                remainingCapital = BigDecimal.ZERO;
            }

            LoanRepayment repayment = LoanRepayment.builder()
                    .loan(loan)
                    .dueDate(dueDate)
                    .principalAmount(principalAmount)
                    .interestAmount(interestAmount)
                    .totalAmount(totalAmount)
                    .build();

            loanRepaymentRepository.save(repayment);
            dueDate = dueDate.plusMonths(1);
        }
    }

    public List<LoanResponse> getLoans(UUID userId) {
        return loanRepository.findByUserIdAndIsActiveTrue(userId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public LoanResponse getLoan(UUID userId, UUID loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Prêt introuvable avec l'ID: " + loanId));
        if (!loan.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        return mapToResponse(loan);
    }

    public LoanAmortizationResponse getAmortization(UUID userId, UUID loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Prêt introuvable"));
        if (!loan.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");

        List<LoanRepayment> repayments = loanRepaymentRepository.findByLoanIdOrderByDueDateAsc(loanId);
        BigDecimal runningCapital = loan.getInitialAmount();
        List<LoanAmortizationResponse.Installment> schedule = new ArrayList<>();

        for (int i = 0; i < repayments.size(); i++) {
            LoanRepayment r = repayments.get(i);
            runningCapital = runningCapital.subtract(r.getPrincipalAmount());
            schedule.add(LoanAmortizationResponse.Installment.builder()
                    .installmentNumber(i + 1)
                    .dueDate(r.getDueDate())
                    .principalAmount(r.getPrincipalAmount())
                    .interestAmount(r.getInterestAmount())
                    .totalAmount(r.getTotalAmount())
                    .remainingCapital(runningCapital.max(BigDecimal.ZERO))
                    .isPaid(r.getIsPaid())
                    .paymentDate(r.getPaymentDate())
                    .build());
        }

        return LoanAmortizationResponse.builder().loanId(loanId).schedule(schedule).build();
    }

    @Transactional
    public void markRepaymentPaid(UUID userId, UUID loanId, LoanRepaymentRequest request) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Prêt introuvable"));
        if (!loan.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");

        LoanRepayment repayment = loanRepaymentRepository.findById(request.getRepaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Remboursement introuvable"));

        repayment.setIsPaid(true);
        repayment.setPaymentDate(request.getPaymentDate() != null ? LocalDate.parse(request.getPaymentDate()) : LocalDate.now());
        if (request.getNotes() != null) repayment.setNotes(request.getNotes());
        loanRepaymentRepository.save(repayment);

        loan.setRemainingCapital(loan.getRemainingCapital().subtract(repayment.getPrincipalAmount()));
        if (loan.getRemainingCapital().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setRemainingCapital(BigDecimal.ZERO);
            loan.setIsActive(false);
        }
        loanRepository.save(loan);

        // Create EXPENSE transaction for loan repayment
        User user = userRepository.findById(userId).orElseThrow();
        Transaction tx = Transaction.builder()
                .user(user)
                .title("Remboursement prêt - " + loan.getLenderName())
                .amount(repayment.getTotalAmount())
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.LOAN)
                .loan(loan)
                .transactionDate(repayment.getPaymentDate())
                .build();
        transactionRepository.save(tx);
    }

    @Transactional
    public void deleteLoan(UUID userId, UUID loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Prêt introuvable"));
        if (!loan.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        loan.setIsActive(false);
        loanRepository.save(loan);
    }

    private LoanResponse mapToResponse(Loan loan) {
        BigDecimal totalPaid = loanRepaymentRepository.sumPaidByLoanId(loan.getId());
        BigDecimal totalInterest = loanRepaymentRepository.sumInterestPaidByLoanId(loan.getId());
        List<LoanRepayment> nextUnpaid = loanRepaymentRepository.findNextUnpaidByLoanId(loan.getId());
        LocalDate nextDueDate = nextUnpaid.isEmpty() ? null : nextUnpaid.get(0).getDueDate();

        double progress = loan.getInitialAmount().compareTo(BigDecimal.ZERO) > 0
                ? (loan.getInitialAmount().subtract(loan.getRemainingCapital())).doubleValue()
                / loan.getInitialAmount().doubleValue() * 100 : 0;

        return LoanResponse.builder()
                .id(loan.getId())
                .lenderName(loan.getLenderName())
                .loanType(loan.getLoanType().name())
                .initialAmount(loan.getInitialAmount())
                .remainingCapital(loan.getRemainingCapital())
                .interestRate(loan.getInterestRate())
                .isFixedRate(loan.getIsFixedRate())
                .durationMonths(loan.getDurationMonths())
                .startDate(loan.getStartDate())
                .monthlyPayment(loan.getMonthlyPayment())
                .alertDaysBefore(loan.getAlertDaysBefore())
                .notes(loan.getNotes())
                .isActive(loan.getIsActive())
                .nextDueDate(nextDueDate)
                .totalPaid(totalPaid)
                .totalInterestPaid(totalInterest)
                .progressPercent(progress)
                .build();
    }
}
