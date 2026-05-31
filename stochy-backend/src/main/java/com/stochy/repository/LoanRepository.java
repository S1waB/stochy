package com.stochy.repository;

import com.stochy.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {

    List<Loan> findByUserIdAndIsActiveTrue(UUID userId);

    List<Loan> findByUserId(UUID userId);

    long countByUserIdAndIsActiveTrue(UUID userId);

    @Query("SELECT COALESCE(AVG(l.initialAmount),0) FROM Loan l WHERE l.isActive = true")
    BigDecimal averageLoanAmount();

    @Query("SELECT COUNT(DISTINCT l.user.id) FROM Loan l WHERE l.isActive = true")
    long countUsersWithActiveLoans();

    @Query("SELECT COALESCE(SUM(l.monthlyPayment),0) FROM Loan l WHERE l.user.id = :userId AND l.isActive = true")
    BigDecimal sumMonthlyPaymentsByUserId(@Param("userId") UUID userId);
}
