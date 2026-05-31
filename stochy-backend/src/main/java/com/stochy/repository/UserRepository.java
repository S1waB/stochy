package com.stochy.repository;

import com.stochy.entity.User;
import com.stochy.enums.Gender;
import com.stochy.enums.ProfessionalStatus;
import com.stochy.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    @Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) " +
            "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%'))) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:isActive IS NULL OR u.isActive = :isActive) " +
            "AND (:professionalStatus IS NULL OR u.professionalStatus = :professionalStatus) " +
            "AND (:gender IS NULL OR u.gender = :gender)")
    Page<User> findAllWithFilters(
            @Param("search") String search,
            @Param("role") Role role,
            @Param("isActive") Boolean isActive,
            @Param("professionalStatus") ProfessionalStatus professionalStatus,
            @Param("gender") Gender gender,
            Pageable pageable);

    long countByIsActiveTrue();

    long countByIsActiveFalse();

    long countByCreatedAtAfter(LocalDateTime date);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :start AND u.createdAt < :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<User> findByRole(Role role);

    long countByProfessionalStatus(ProfessionalStatus status);

    long countByGender(Gender gender);

    long countByMaritalStatus(com.stochy.enums.MaritalStatus status);
}
