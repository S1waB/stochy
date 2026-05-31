package com.stochy.service;

import com.stochy.dto.request.CreateAdminRequest;
import com.stochy.dto.response.AdminDashboardResponse;
import com.stochy.dto.response.UserResponse;
import com.stochy.entity.User;
import com.stochy.enums.*;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.EmailAlreadyExistsException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final SavingGoalRepository savingGoalRepository;

    public AdminService(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder,
                        EmailService emailService, TransactionRepository transactionRepository,
                        LoanRepository loanRepository, SavingGoalRepository savingGoalRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
        this.savingGoalRepository = savingGoalRepository;
    }

    public Page<UserResponse> getUsers(String search, Role role, Boolean isActive,
                                       ProfessionalStatus professionalStatus, Gender gender, Pageable pageable) {
        return userRepository.findAllWithFilters(search, role, isActive, professionalStatus, gender, pageable)
                .map(userService::mapToUserResponse);
    }

    public UserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'ID: " + userId));
        return userService.mapToUserResponse(user);
    }

    @Transactional
    public UserResponse toggleUserActive(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);
        return userService.mapToUserResponse(user);
    }

    @Transactional
    public void deleteUser(UUID userId, UUID adminId) {
        if (userId.equals(adminId)) {
            throw new BadRequestException("Vous ne pouvez pas supprimer votre propre compte.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse createAdmin(CreateAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email déjà utilisé: " + request.getEmail());
        }

        String tempPassword = generateSecurePassword();

        User admin = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.ROLE_ADMIN)
                .mustChangePassword(true)
                .build();

        admin = userRepository.save(admin);

        emailService.sendEmail(admin.getEmail(), "STOCHY — Compte administrateur créé",
                "Bonjour " + admin.getFirstName() + ",\n\n"
                        + "Un compte administrateur a été créé pour vous sur STOCHY.\n\n"
                        + "Email: " + admin.getEmail() + "\n"
                        + "Mot de passe temporaire: " + tempPassword + "\n\n"
                        + "Veuillez changer votre mot de passe lors de votre première connexion.\n\n"
                        + "Cordialement,\nL'équipe STOCHY");

        return userService.mapToUserResponse(admin);
    }

    public AdminDashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long inactiveUsers = userRepository.countByIsActiveFalse();
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = YearMonth.now().plusMonths(1).atDay(1).atStartOfDay();
        long newUsersThisMonth = userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);

        // Registration trend (last 6 months)
        List<AdminDashboardResponse.MonthlyCount> trend = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
            long count = userRepository.countByCreatedAtBetween(start, end);
            trend.add(AdminDashboardResponse.MonthlyCount.builder().month(ym.toString()).count(count).build());
        }

        // Demographics
        List<AdminDashboardResponse.StatusCount> byProfessional = new ArrayList<>();
        for (ProfessionalStatus ps : ProfessionalStatus.values()) {
            long count = userRepository.countByProfessionalStatus(ps);
            byProfessional.add(AdminDashboardResponse.StatusCount.builder()
                    .status(ps.name()).count(count).percentage(totalUsers > 0 ? (double) count / totalUsers * 100 : 0).build());
        }

        List<AdminDashboardResponse.StatusCount> byGender = new ArrayList<>();
        for (Gender g : Gender.values()) {
            long count = userRepository.countByGender(g);
            byGender.add(AdminDashboardResponse.StatusCount.builder()
                    .status(g.name()).count(count).percentage(totalUsers > 0 ? (double) count / totalUsers * 100 : 0).build());
        }

        List<AdminDashboardResponse.StatusCount> byMarital = new ArrayList<>();
        for (MaritalStatus ms : MaritalStatus.values()) {
            long count = userRepository.countByMaritalStatus(ms);
            byMarital.add(AdminDashboardResponse.StatusCount.builder().status(ms.name()).count(count).build());
        }

        // Financial stats
        int month = current.getMonthValue();
        int year = current.getYear();
        long usersWithLoans = loanRepository.countUsersWithActiveLoans();
        BigDecimal avgLoanAmount = loanRepository.averageLoanAmount();

        long usersWithGoals = 0;
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (savingGoalRepository.countByUserIdAndIsActiveTrue(u.getId()) > 0) usersWithGoals++;
        }

        return AdminDashboardResponse.builder()
                .usersStats(AdminDashboardResponse.UsersStats.builder()
                        .totalUsers(totalUsers).activeUsers(activeUsers).inactiveUsers(inactiveUsers)
                        .newUsersThisMonth(newUsersThisMonth).registrationTrend(trend).build())
                .demographicsStats(AdminDashboardResponse.DemographicsStats.builder()
                        .byProfessionalStatus(byProfessional).byGender(byGender).byMaritalStatus(byMarital).build())
                .financialStats(AdminDashboardResponse.FinancialStats.builder()
                        .averageMonthlyIncome(BigDecimal.ZERO).averageMonthlyExpenses(BigDecimal.ZERO)
                        .averageSavingsRate(0.0)
                        .topExpenseCategories(new ArrayList<>())
                        .usersWithActiveLoans(usersWithLoans)
                        .usersWithActiveGoals(usersWithGoals)
                        .averageLoanAmount(avgLoanAmount)
                        .incomeByProfessionalStatus(new ArrayList<>())
                        .build())
                .build();
    }

    private String generateSecurePassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String symbols = "!@#$%&*";
        String all = upper + lower + digits + symbols;
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(symbols.charAt(random.nextInt(symbols.length())));
        for (int i = 4; i < 12; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }
        return sb.toString();
    }
}
