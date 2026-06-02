package com.stochy.repository;

import com.stochy.entity.Transaction;
import com.stochy.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
            "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
            "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
            "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
            "AND (:maxAmount IS NULL OR t.amount <= :maxAmount) " +
            "AND (:isRecurring IS NULL OR t.isRecurring = :isRecurring) " +
            "AND (:scope IS NULL OR t.scope = :scope) " +
            "AND (:minPriority IS NULL OR t.priority >= :minPriority) " +
            "AND (:maxPriority IS NULL OR t.priority <= :maxPriority) " +
            "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Transaction> findAllWithFilters(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("categoryId") UUID categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("isRecurring") Boolean isRecurring,
            @Param("scope") com.stochy.enums.Scope scope,
            @Param("minPriority") Integer minPriority,
            @Param("maxPriority") Integer maxPriority,
            @Param("search") String search,
            Pageable pageable);

    List<Transaction> findByUserIdAndType(UUID userId, TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
            "AND MONTH(t.transactionDate) = :month AND YEAR(t.transactionDate) = :year")
    BigDecimal sumByUserAndTypeAndMonth(@Param("userId") UUID userId, @Param("type") TransactionType type,
                                        @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.category.id = :categoryId AND MONTH(t.transactionDate) = :month AND YEAR(t.transactionDate) = :year")
    BigDecimal sumByUserAndTypeAndCategoryAndMonth(@Param("userId") UUID userId, @Param("type") TransactionType type,
                                                    @Param("categoryId") UUID categoryId,
                                                    @Param("month") int month, @Param("year") int year);

    @Query("SELECT t.category.name, COALESCE(SUM(t.amount),0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
            "AND MONTH(t.transactionDate) = :month AND YEAR(t.transactionDate) = :year " +
            "AND t.category IS NOT NULL GROUP BY t.category.name ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumExpensesByCategoryAndMonth(@Param("userId") UUID userId,
                                                 @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumByUserAndTypeAndDateRange(@Param("userId") UUID userId, @Param("type") TransactionType type,
                                            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<Transaction> findByUserIdAndIsRecurringTrueAndType(UUID userId, TransactionType type);

    List<Transaction> findByIsRecurringTrueAndAutoProcessTrue();

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.isRecurring = true " +
            "ORDER BY t.recurrenceDay ASC")
    List<Transaction> findUpcomingRecurring(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM Transaction t WHERE t.type = :type " +
            "AND MONTH(t.transactionDate) = :month AND YEAR(t.transactionDate) = :year")
    BigDecimal sumAllByTypeAndMonth(@Param("type") TransactionType type,
                                    @Param("month") int month, @Param("year") int year);

    long countByUserId(UUID userId);
}
