package com.stochy.service;

import com.stochy.dto.request.SavingConfigRequest;
import com.stochy.dto.response.SavingConfigResponse;
import com.stochy.entity.SavingConfig;
import com.stochy.entity.Transaction;
import com.stochy.entity.User;
import com.stochy.enums.Frequency;
import com.stochy.enums.SavingMode;
import com.stochy.enums.TransactionType;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.GoalContributionRepository;
import com.stochy.repository.SavingConfigRepository;
import com.stochy.repository.TransactionRepository;
import com.stochy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SavingService {

    private final SavingConfigRepository savingConfigRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final GoalContributionRepository goalContributionRepository;

    public SavingService(SavingConfigRepository savingConfigRepository, UserRepository userRepository,
                         TransactionRepository transactionRepository, GoalContributionRepository goalContributionRepository) {
        this.savingConfigRepository = savingConfigRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.goalContributionRepository = goalContributionRepository;
    }

    @Transactional
    public SavingConfigResponse createConfig(UUID userId, SavingConfigRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        SavingConfig config = SavingConfig.builder()
                .user(user)
                .mode(SavingMode.valueOf(request.getMode()))
                .build();

        if (config.getMode() == SavingMode.FIXED) {
            config.setFixedAmount(request.getFixedAmount());
            if (request.getFrequency() != null) config.setFrequency(Frequency.valueOf(request.getFrequency()));
            config.setRecurrenceDay(request.getRecurrenceDay());
        } else if (config.getMode() == SavingMode.PERCENTAGE) {
            config.setPercentage(request.getPercentage());
            config.setApplyToAllIncomes(request.getApplyToAllIncomes() != null ? request.getApplyToAllIncomes() : true);
            if (request.getSpecificIncomeTypes() != null) {
                config.setSpecificIncomeTypes(String.join(",", request.getSpecificIncomeTypes()));
            }
        }

        config = savingConfigRepository.save(config);
        return mapToResponse(config);
    }

    public List<SavingConfigResponse> getConfigs(UUID userId) {
        return savingConfigRepository.findByUserId(userId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public SavingConfigResponse updateConfig(UUID userId, UUID configId, SavingConfigRequest request) {
        SavingConfig config = savingConfigRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable"));
        if (!config.getUser().getId().equals(userId)) {
            throw new BadRequestException("Accès non autorisé.");
        }

        config.setMode(SavingMode.valueOf(request.getMode()));
        if (config.getMode() == SavingMode.FIXED) {
            config.setFixedAmount(request.getFixedAmount());
            config.setPercentage(null);
            if (request.getFrequency() != null) config.setFrequency(Frequency.valueOf(request.getFrequency()));
            config.setRecurrenceDay(request.getRecurrenceDay());
        } else {
            config.setPercentage(request.getPercentage());
            config.setFixedAmount(null);
            config.setApplyToAllIncomes(request.getApplyToAllIncomes() != null ? request.getApplyToAllIncomes() : true);
            if (request.getSpecificIncomeTypes() != null) {
                config.setSpecificIncomeTypes(String.join(",", request.getSpecificIncomeTypes()));
            }
        }

        config = savingConfigRepository.save(config);
        return mapToResponse(config);
    }

    @Transactional
    public SavingConfigResponse toggleConfig(UUID userId, UUID configId) {
        SavingConfig config = savingConfigRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable"));
        if (!config.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        config.setIsActive(!config.getIsActive());
        config = savingConfigRepository.save(config);
        return mapToResponse(config);
    }

    @Transactional
    public void deleteConfig(UUID userId, UUID configId) {
        SavingConfig config = savingConfigRepository.findById(configId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable"));
        if (!config.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        savingConfigRepository.delete(config);
    }

    public Map<String, BigDecimal> getSavingsBalance(UUID userId) {
        List<Transaction> savingTxs = transactionRepository.findByUserIdAndType(userId, TransactionType.SAVING);
        BigDecimal totalSaved = savingTxs.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal allocatedToGoals = goalContributionRepository.sumAllContributionsByUserId(userId);
        if (allocatedToGoals == null) allocatedToGoals = BigDecimal.ZERO;

        BigDecimal freeBalance = totalSaved.subtract(allocatedToGoals);

        Map<String, BigDecimal> result = new HashMap<>();
        result.put("totalSaved", totalSaved);
        result.put("allocatedToGoals", allocatedToGoals);
        result.put("freeBalance", freeBalance);
        return result;
    }

    private SavingConfigResponse mapToResponse(SavingConfig config) {
        List<String> incomeTypes = config.getSpecificIncomeTypes() != null && !config.getSpecificIncomeTypes().isBlank()
                ? Arrays.asList(config.getSpecificIncomeTypes().split(","))
                : Collections.emptyList();

        return SavingConfigResponse.builder()
                .id(config.getId())
                .mode(config.getMode().name())
                .fixedAmount(config.getFixedAmount())
                .percentage(config.getPercentage())
                .applyToAllIncomes(config.getApplyToAllIncomes())
                .specificIncomeTypes(incomeTypes)
                .frequency(config.getFrequency() != null ? config.getFrequency().name() : null)
                .recurrenceDay(config.getRecurrenceDay())
                .isActive(config.getIsActive())
                .build();
    }
}
