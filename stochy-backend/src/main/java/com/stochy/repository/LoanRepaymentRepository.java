package com.stochy.repository;

import com.stochy.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, UUID> {

    List<LoanRepayment> findByLoanIdOrderByDueDateAsc(UUID loanId);

    @Query("SELECT COALESCE(SUM(lr.totalAmount),0) FROM LoanRepayment lr WHERE lr.loan.id = :loanId AND lr.isPaid = true")
    BigDecimal sumPaidByLoanId(@Param("loanId") UUID loanId);

    @Query("SELECT COALESCE(SUM(lr.interestAmount),0) FROM LoanRepayment lr WHERE lr.loan.id = :loanId AND lr.isPaid = true")
    BigDecimal sumInterestPaidByLoanId(@Param("loanId") UUID loanId);

    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loan.id = :loanId AND lr.isPaid = false ORDER BY lr.dueDate ASC")
    List<LoanRepayment> findNextUnpaidByLoanId(@Param("loanId") UUID loanId);
}
