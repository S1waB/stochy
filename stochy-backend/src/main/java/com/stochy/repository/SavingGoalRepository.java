package com.stochy.repository;

import com.stochy.entity.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, UUID> {

    List<SavingGoal> findByUserId(UUID userId);

    List<SavingGoal> findByUserIdAndIsActiveAndIsCompleted(UUID userId, Boolean isActive, Boolean isCompleted);

    long countByUserIdAndIsActiveTrue(UUID userId);
}
