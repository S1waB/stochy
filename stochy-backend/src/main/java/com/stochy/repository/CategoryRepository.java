package com.stochy.repository;

import com.stochy.entity.Category;
import com.stochy.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT c FROM Category c WHERE (c.user IS NULL OR c.user.id = :userId) " +
            "AND (:type IS NULL OR c.transactionType = :type OR c.transactionType = 'BOTH')")
    List<Category> findByUserIdOrSystemAndType(@Param("userId") UUID userId,
                                                @Param("type") TransactionType type);

    @Query("SELECT c FROM Category c WHERE c.user IS NULL OR c.user.id = :userId")
    List<Category> findByUserIdOrSystem(@Param("userId") UUID userId);

    List<Category> findByUserIsNull();

    Optional<Category> findByNameAndUserIsNull(String name);

    Optional<Category> findByNameAndUserId(String name, UUID userId);

    boolean existsByNameAndUserIsNull(String name);
}
