package com.stochy.service;

import com.stochy.dto.request.TransactionRequest;
import com.stochy.dto.response.TransactionResponse;
import com.stochy.entity.*;
import com.stochy.enums.*;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LoanRepository loanRepository;
    private final DebtRepository debtRepository;
    private final SavingConfigRepository savingConfigRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository,
                              CategoryRepository categoryRepository, LoanRepository loanRepository,
                              DebtRepository debtRepository, SavingConfigRepository savingConfigRepository,
                              BudgetRepository budgetRepository, NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.loanRepository = loanRepository;
        this.debtRepository = debtRepository;
        this.savingConfigRepository = savingConfigRepository;
        this.budgetRepository = budgetRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public TransactionResponse createTransaction(UUID userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .title(request.getTitle())
                .amount(request.getAmount())
                .type(TransactionType.valueOf(request.getType()))
                .isRecurring(request.getIsRecurring() != null && request.getIsRecurring())
                .build();

        if (request.getTransactionDate() != null && !request.getTransactionDate().isBlank()) {
            transaction.setTransactionDate(LocalDate.parse(request.getTransactionDate()));
        } else {
            transaction.setTransactionDate(LocalDate.now());
        }

        if (request.getExpenseType() != null) transaction.setExpenseType(ExpenseType.valueOf(request.getExpenseType()));
        if (request.getIncomeType() != null) transaction.setIncomeType(IncomeType.valueOf(request.getIncomeType()));
        if (request.getSavingMode() != null) transaction.setSavingMode(SavingMode.valueOf(request.getSavingMode()));
        if (request.getScope() != null) transaction.setScope(Scope.valueOf(request.getScope()));
        if (request.getFrequency() != null) transaction.setFrequency(Frequency.valueOf(request.getFrequency()));
        transaction.setRecurrenceDay(request.getRecurrenceDay());
        transaction.setPriority(request.getPriority());
        transaction.setNotes(request.getNotes());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
            transaction.setCategory(category);
        }

        if (request.getLoanId() != null) {
            Loan loan = loanRepository.findById(request.getLoanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prêt introuvable"));
            transaction.setLoan(loan);
        }

        if (request.getDebtId() != null) {
            Debt debt = debtRepository.findById(request.getDebtId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dette introuvable"));
            transaction.setDebt(debt);
        }

        transaction = transactionRepository.save(transaction);

        // INCOME: auto-saving percentage
        if (transaction.getType() == TransactionType.INCOME) {
            applyAutoSaving(user, transaction);
        }

        // EXPENSE: check budget
        if (transaction.getType() == TransactionType.EXPENSE && transaction.getCategory() != null) {
            checkBudgetAlerts(user, transaction);
        }

        return mapToResponse(transaction);
    }

    private void applyAutoSaving(User user, Transaction incomeTransaction) {
        List<SavingConfig> activeConfigs = savingConfigRepository.findByUserIdAndIsActiveTrue(user.getId());
        for (SavingConfig config : activeConfigs) {
            if (config.getMode() == SavingMode.PERCENTAGE && config.getPercentage() != null) {
                boolean shouldApply = config.getApplyToAllIncomes();
                if (!shouldApply && config.getSpecificIncomeTypes() != null && incomeTransaction.getIncomeType() != null) {
                    shouldApply = config.getSpecificIncomeTypes().contains(incomeTransaction.getIncomeType().name());
                }
                if (shouldApply) {
                    BigDecimal savingAmount = incomeTransaction.getAmount()
                            .multiply(config.getPercentage())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    Transaction savingTx = Transaction.builder()
                            .user(user)
                            .title("Épargne auto - " + config.getPercentage() + "% de " + incomeTransaction.getTitle())
                            .amount(savingAmount)
                            .type(TransactionType.SAVING)
                            .savingMode(SavingMode.PERCENTAGE)
                            .savingConfig(config)
                            .transactionDate(LocalDate.now())
                            .build();
                    transactionRepository.save(savingTx);

                    notificationService.createNotification(user, "Épargne automatique appliquée",
                            "Un montant de " + savingAmount + " " + user.getCurrency() + " a été épargné automatiquement.",
                            "SAVING_APPLIED", savingTx.getId(), "TRANSACTION");
                }
            }
        }
    }

    private void checkBudgetAlerts(User user, Transaction expenseTransaction) {
        LocalDate txDate = expenseTransaction.getTransactionDate();
        int month = txDate.getMonthValue();
        int year = txDate.getYear();

        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), expenseTransaction.getCategory().getId(), month, year
        ).ifPresent(budget -> {
            BigDecimal spent = transactionRepository.sumByUserAndTypeAndCategoryAndMonth(
                    user.getId(), TransactionType.EXPENSE, expenseTransaction.getCategory().getId(), month, year);
            double usage = spent.doubleValue() / budget.getAmount().doubleValue() * 100;

            if (usage >= 100) {
                notificationService.createNotification(user, "Budget dépassé !",
                        "Vous avez dépassé votre budget pour la catégorie " + expenseTransaction.getCategory().getName() + ".",
                        "BUDGET_EXCEEDED", budget.getId(), "BUDGET");
            } else if (usage >= budget.getAlertThresholdPct()) {
                notificationService.createNotification(user, "Alerte budget",
                        "Vous avez atteint " + Math.round(usage) + "% de votre budget pour " + expenseTransaction.getCategory().getName() + ".",
                        "BUDGET_WARNING", budget.getId(), "BUDGET");
            }
        });
    }

    public Page<TransactionResponse> getTransactions(UUID userId, TransactionType type, UUID categoryId,
                                                      LocalDate startDate, LocalDate endDate,
                                                      BigDecimal minAmount, BigDecimal maxAmount,
                                                      Boolean isRecurring, Scope scope,
                                                      Integer minPriority, Integer maxPriority,
                                                      String search, Pageable pageable) {
        return transactionRepository.findAllWithFilters(userId, type, categoryId, startDate, endDate,
                minAmount, maxAmount, isRecurring, scope, minPriority, maxPriority, search, pageable)
                .map(this::mapToResponse);
    }

    public TransactionResponse getTransaction(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable avec l'ID: " + transactionId));
        if (!transaction.getUser().getId().equals(userId)) {
            throw new BadRequestException("Accès non autorisé à cette transaction.");
        }
        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(UUID userId, UUID transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable avec l'ID: " + transactionId));
        if (!transaction.getUser().getId().equals(userId)) {
            throw new BadRequestException("Accès non autorisé.");
        }

        transaction.setTitle(request.getTitle());
        transaction.setAmount(request.getAmount());
        transaction.setType(TransactionType.valueOf(request.getType()));
        if (request.getExpenseType() != null) transaction.setExpenseType(ExpenseType.valueOf(request.getExpenseType()));
        if (request.getIncomeType() != null) transaction.setIncomeType(IncomeType.valueOf(request.getIncomeType()));
        if (request.getSavingMode() != null) transaction.setSavingMode(SavingMode.valueOf(request.getSavingMode()));
        if (request.getScope() != null) transaction.setScope(Scope.valueOf(request.getScope()));
        if (request.getFrequency() != null) transaction.setFrequency(Frequency.valueOf(request.getFrequency()));
        transaction.setRecurrenceDay(request.getRecurrenceDay());
        transaction.setPriority(request.getPriority());
        transaction.setNotes(request.getNotes());
        transaction.setIsRecurring(request.getIsRecurring() != null && request.getIsRecurring());

        if (request.getTransactionDate() != null && !request.getTransactionDate().isBlank()) {
            transaction.setTransactionDate(LocalDate.parse(request.getTransactionDate()));
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);
        return mapToResponse(transaction);
    }

    @Transactional
    public void deleteTransaction(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction introuvable avec l'ID: " + transactionId));
        if (!transaction.getUser().getId().equals(userId)) {
            throw new BadRequestException("Accès non autorisé.");
        }
        transactionRepository.delete(transaction);
    }

    public TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .amount(t.getAmount())
                .type(t.getType().name())
                .expenseType(t.getExpenseType() != null ? t.getExpenseType().name() : null)
                .incomeType(t.getIncomeType() != null ? t.getIncomeType().name() : null)
                .savingMode(t.getSavingMode() != null ? t.getSavingMode().name() : null)
                .categoryId(t.getCategory() != null ? t.getCategory().getId() : null)
                .categoryName(t.getCategory() != null ? t.getCategory().getName() : null)
                .categoryColor(t.getCategory() != null ? t.getCategory().getColor() : null)
                .scope(t.getScope() != null ? t.getScope().name() : null)
                .priority(t.getPriority())
                .isRecurring(t.getIsRecurring())
                .frequency(t.getFrequency() != null ? t.getFrequency().name() : null)
                .recurrenceDay(t.getRecurrenceDay())
                .transactionDate(t.getTransactionDate())
                .attachmentUrl(t.getAttachmentUrl())
                .notes(t.getNotes())
                .loanId(t.getLoan() != null ? t.getLoan().getId() : null)
                .debtId(t.getDebt() != null ? t.getDebt().getId() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
