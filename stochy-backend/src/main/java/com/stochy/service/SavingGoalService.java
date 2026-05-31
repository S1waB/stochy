package com.stochy.service;

import com.stochy.dto.request.GoalContributionRequest;
import com.stochy.dto.request.SavingGoalRequest;
import com.stochy.dto.response.SavingGoalResponse;
import com.stochy.entity.GoalContribution;
import com.stochy.entity.SavingGoal;
import com.stochy.entity.User;
import com.stochy.enums.GoalFundingMode;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.GoalContributionRepository;
import com.stochy.repository.SavingGoalRepository;
import com.stochy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;
    private final GoalContributionRepository goalContributionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SavingGoalService(SavingGoalRepository savingGoalRepository,
                             GoalContributionRepository goalContributionRepository,
                             UserRepository userRepository, NotificationService notificationService) {
        this.savingGoalRepository = savingGoalRepository;
        this.goalContributionRepository = goalContributionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public SavingGoalResponse createGoal(UUID userId, SavingGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        SavingGoal goal = SavingGoal.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .targetAmount(request.getTargetAmount())
                .fundingMode(GoalFundingMode.valueOf(request.getFundingMode()))
                .build();

        if (request.getTargetDate() != null && !request.getTargetDate().isBlank()) {
            goal.setTargetDate(LocalDate.parse(request.getTargetDate()));
        }

        goal = savingGoalRepository.save(goal);
        return mapToResponse(goal);
    }

    public List<SavingGoalResponse> getGoals(UUID userId, Boolean isActive, Boolean isCompleted) {
        List<SavingGoal> goals;
        if (isActive != null && isCompleted != null) {
            goals = savingGoalRepository.findByUserIdAndIsActiveAndIsCompleted(userId, isActive, isCompleted);
        } else {
            goals = savingGoalRepository.findByUserId(userId);
        }
        return goals.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public SavingGoalResponse getGoal(UUID userId, UUID goalId) {
        SavingGoal goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable avec l'ID: " + goalId));
        if (!goal.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        return mapToResponse(goal);
    }

    @Transactional
    public SavingGoalResponse updateGoal(UUID userId, UUID goalId, SavingGoalRequest request) {
        SavingGoal goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        if (!goal.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");

        goal.setName(request.getName());
        if (request.getDescription() != null) goal.setDescription(request.getDescription());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setFundingMode(GoalFundingMode.valueOf(request.getFundingMode()));
        if (request.getTargetDate() != null && !request.getTargetDate().isBlank()) {
            goal.setTargetDate(LocalDate.parse(request.getTargetDate()));
        }

        goal = savingGoalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public SavingGoalResponse contribute(UUID userId, UUID goalId, GoalContributionRequest request) {
        SavingGoal goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        if (!goal.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");

        GoalContribution contribution = GoalContribution.builder()
                .goal(goal)
                .amount(request.getAmount())
                .contributionDate(request.getContributionDate() != null && !request.getContributionDate().isBlank()
                        ? LocalDate.parse(request.getContributionDate()) : LocalDate.now())
                .isAutomatic(false)
                .notes(request.getNotes())
                .build();

        goalContributionRepository.save(contribution);

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setIsCompleted(true);
            User user = userRepository.findById(userId).orElseThrow();
            notificationService.createNotification(user, "Objectif atteint ! 🎉",
                    "Félicitations ! Vous avez atteint votre objectif \"" + goal.getName() + "\" !",
                    "GOAL_ACHIEVED", goal.getId(), "GOAL");
        }
        goal = savingGoalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public SavingGoalResponse changeFundingMode(UUID userId, UUID goalId, String fundingMode) {
        SavingGoal goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        if (!goal.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        goal.setFundingMode(GoalFundingMode.valueOf(fundingMode));
        goal = savingGoalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public void deleteGoal(UUID userId, UUID goalId) {
        SavingGoal goal = savingGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        if (!goal.getUser().getId().equals(userId)) throw new BadRequestException("Accès non autorisé.");
        savingGoalRepository.delete(goal);
    }

    private SavingGoalResponse mapToResponse(SavingGoal goal) {
        double progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentAmount().doubleValue() / goal.getTargetAmount().doubleValue() * 100 : 0;

        BigDecimal monthlyRecommended = null;
        LocalDate estimatedCompletion = null;
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());

        if (goal.getTargetDate() != null && remaining.compareTo(BigDecimal.ZERO) > 0) {
            long monthsLeft = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
            if (monthsLeft > 0) {
                monthlyRecommended = remaining.divide(BigDecimal.valueOf(monthsLeft), 2, RoundingMode.CEILING);
            }
        }

        return SavingGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .progressPercent(Math.min(progress, 100))
                .targetDate(goal.getTargetDate())
                .monthlyRecommended(monthlyRecommended)
                .estimatedCompletionDate(estimatedCompletion)
                .fundingMode(goal.getFundingMode().name())
                .isActive(goal.getIsActive())
                .isCompleted(goal.getIsCompleted())
                .build();
    }
}
