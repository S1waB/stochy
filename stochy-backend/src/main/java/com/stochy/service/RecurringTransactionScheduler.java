package com.stochy.service;

import com.stochy.entity.Transaction;
import com.stochy.enums.Frequency;
import com.stochy.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class RecurringTransactionScheduler {

    private final TransactionRepository transactionRepository;

    public RecurringTransactionScheduler(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<Transaction> recurringTemplates = transactionRepository.findByIsRecurringTrueAndAutoProcessTrue();
        for (Transaction template : recurringTemplates) {
            processRecurringTemplate(template, today);
        }
    }

    @Transactional
    public void processRecurringTemplate(Transaction template) {
        processRecurringTemplate(template, LocalDate.now());
    }

    private void processRecurringTemplate(Transaction template, LocalDate today) {
        if (template.getTransactionDate() == null) {
            return;
        }

        LocalDate dueDate = template.getTransactionDate();
        while (!dueDate.isAfter(today)) {
            if (template.getLastProcessedDate() != null && !template.getLastProcessedDate().isBefore(dueDate)) {
                break;
            }

            Transaction occurrence = Transaction.builder()
                    .user(template.getUser())
                    .title(template.getTitle())
                    .amount(template.getAmount())
                    .type(template.getType())
                    .expenseType(template.getExpenseType())
                    .incomeType(template.getIncomeType())
                    .savingMode(template.getSavingMode())
                    .category(template.getCategory())
                    .scope(template.getScope())
                    .priority(template.getPriority())
                    .transactionDate(dueDate)
                    .attachmentUrl(template.getAttachmentUrl())
                    .notes(template.getNotes())
                    .loan(template.getLoan())
                    .debt(template.getDebt())
                    .savingConfig(template.getSavingConfig())
                    .isRecurring(false)
                    .autoProcess(false)
                    .build();
            transactionRepository.save(occurrence);

            template.setLastProcessedDate(dueDate);
            dueDate = nextRecurrenceDate(dueDate, template.getFrequency(), template.getRecurrenceDay());
        }

        if (!dueDate.equals(template.getTransactionDate())) {
            template.setTransactionDate(dueDate);
            transactionRepository.save(template);
        }
    }

    private LocalDate nextRecurrenceDate(LocalDate current, Frequency frequency, Integer recurrenceDay) {
        if (frequency == null) {
            frequency = Frequency.MONTHLY;
        }

        switch (frequency) {
            case DAILY:
                return current.plusDays(1);
            case WEEKLY:
                return current.plusWeeks(1);
            case MONTHLY:
                return adjustDay(current.plusMonths(1), recurrenceDay != null ? recurrenceDay : current.getDayOfMonth());
            case QUARTERLY:
                return adjustDay(current.plusMonths(3), recurrenceDay != null ? recurrenceDay : current.getDayOfMonth());
            case ANNUALLY:
                return adjustDay(current.plusYears(1), recurrenceDay != null ? recurrenceDay : current.getDayOfMonth());
            default:
                return adjustDay(current.plusMonths(1), recurrenceDay != null ? recurrenceDay : current.getDayOfMonth());
        }
    }

    private LocalDate adjustDay(LocalDate date, int day) {
        YearMonth yearMonth = YearMonth.from(date);
        int maxDay = yearMonth.lengthOfMonth();
        return date.withDayOfMonth(Math.min(day, maxDay));
    }
}
