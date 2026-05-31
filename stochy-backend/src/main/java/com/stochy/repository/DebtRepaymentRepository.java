package com.stochy.repository;

import com.stochy.entity.DebtRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DebtRepaymentRepository extends JpaRepository<DebtRepayment, UUID> {

    List<DebtRepayment> findByDebtIdOrderByRepaymentDateDesc(UUID debtId);
}
