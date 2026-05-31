package com.stochy.repository;

import com.stochy.entity.Debt;
import com.stochy.enums.DebtStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DebtRepository extends JpaRepository<Debt, UUID> {

    List<Debt> findByUserId(UUID userId);

    List<Debt> findByUserIdAndStatus(UUID userId, DebtStatus status);
}
