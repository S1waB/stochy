package com.stochy.entity;

import com.stochy.enums.Frequency;
import com.stochy.enums.SavingMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saving_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavingMode mode;

    @Column(name = "fixed_amount", precision = 15, scale = 2)
    private BigDecimal fixedAmount;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "apply_to_all_incomes", nullable = false)
    @Builder.Default
    private Boolean applyToAllIncomes = true;

    @Column(name = "specific_income_types", length = 500)
    private String specificIncomeTypes;

    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    @Column(name = "recurrence_day")
    private Integer recurrenceDay;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
