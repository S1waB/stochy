package com.stochy.repository;

import com.stochy.entity.GoalContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface GoalContributionRepository extends JpaRepository<GoalContribution, UUID> {

    List<GoalContribution> findByGoalIdOrderByContributionDateDesc(UUID goalId);

    @Query("SELECT COALESCE(SUM(gc.amount),0) FROM GoalContribution gc WHERE gc.goal.user.id = :userId")
    BigDecimal sumAllContributionsByUserId(@Param("userId") UUID userId);
}
