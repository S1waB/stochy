package com.stochy.repository;

import com.stochy.entity.SavingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingConfigRepository extends JpaRepository<SavingConfig, UUID> {

    List<SavingConfig> findByUserId(UUID userId);

    List<SavingConfig> findByUserIdAndIsActiveTrue(UUID userId);
}
