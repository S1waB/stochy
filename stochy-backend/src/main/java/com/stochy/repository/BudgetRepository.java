package com.stochy.repository;

import com.stochy.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);

    Optional<Budget> findByUserIdAndCategoryIdAndMonthAndYear(UUID userId, UUID categoryId, Integer month, Integer year);

    Optional<Budget> findByUserIdAndCategoryIsNullAndMonthAndYear(UUID userId, Integer month, Integer year);

    List<Budget> findByUserId(UUID userId);
}
