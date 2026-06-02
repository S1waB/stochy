package com.stochy;

import com.stochy.entity.*;
import com.stochy.enums.*;
import com.stochy.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final DebtRepository debtRepository;
    private final DebtRepaymentRepository debtRepaymentRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final SavingGoalRepository savingGoalRepository;
    private final GoalContributionRepository goalContributionRepository;

    public DataInitializer(CategoryRepository categoryRepository, UserRepository userRepository,
                           PasswordEncoder passwordEncoder, TransactionRepository transactionRepository,
                           BudgetRepository budgetRepository, DebtRepository debtRepository,
                           DebtRepaymentRepository debtRepaymentRepository, LoanRepository loanRepository,
                           LoanRepaymentRepository loanRepaymentRepository, SavingGoalRepository savingGoalRepository,
                           GoalContributionRepository goalContributionRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.debtRepository = debtRepository;
        this.debtRepaymentRepository = debtRepaymentRepository;
        this.loanRepository = loanRepository;
        this.loanRepaymentRepository = loanRepaymentRepository;
        this.savingGoalRepository = savingGoalRepository;
        this.goalContributionRepository = goalContributionRepository;
    }

    @Override
    public void run(String... args) {
        initCategories();
        initAdminUser();
        initTestUser();
        initClientUser();

        User testUser = userRepository.findByEmail("user@stochy.com").orElse(null);
        if (testUser != null) {
            initTestDataForUser(testUser);
        }

        User clientUser = userRepository.findByEmail("client@stochy.com").orElse(null);
        if (clientUser != null) {
            initTestDataForUser(clientUser);
        }
    }

    private void initCategories() {
        List<Map<String, Object>> expenseCategories = List.of(
                Map.of("name", "Alimentation", "icon", "🛒", "color", "#FF6B6B"),
                Map.of("name", "Logement", "icon", "🏠", "color", "#4ECDC4"),
                Map.of("name", "Transport", "icon", "🚗", "color", "#45B7D1"),
                Map.of("name", "Santé", "icon", "🏥", "color", "#96CEB4"),
                Map.of("name", "Loisirs", "icon", "🎬", "color", "#FFEAA7"),
                Map.of("name", "Éducation", "icon", "📚", "color", "#DDA0DD"),
                Map.of("name", "Vêtements", "icon", "👕", "color", "#98D8C8"),
                Map.of("name", "Abonnements", "icon", "📱", "color", "#F7DC6F"),
                Map.of("name", "Famille", "icon", "👨‍👩‍👧", "color", "#BB8FCE"),
                Map.of("name", "Personnel", "icon", "👤", "color", "#85C1E9"),
                Map.of("name", "Dons", "icon", "🎁", "color", "#F1948A"),
                Map.of("name", "Autres", "icon", "📦", "color", "#AEB6BF")
        );

        List<Map<String, Object>> incomeCategories = List.of(
                Map.of("name", "Salaire", "icon", "💰", "color", "#27AE60"),
                Map.of("name", "Freelance", "icon", "💻", "color", "#2ECC71"),
                Map.of("name", "Business", "icon", "🏢", "color", "#1ABC9C"),
                Map.of("name", "Investissement", "icon", "📈", "color", "#3498DB"),
                Map.of("name", "Aide sociale", "icon", "🤝", "color", "#9B59B6"),
                Map.of("name", "Pension", "icon", "🏦", "color", "#E67E22"),
                Map.of("name", "Autres revenus", "icon", "💵", "color", "#95A5A6")
        );

        int created = 0;
        for (Map<String, Object> cat : expenseCategories) {
            String name = (String) cat.get("name");
            if (!categoryRepository.existsByNameAndUserIsNull(name)) {
                categoryRepository.save(Category.builder()
                        .name(name)
                        .icon((String) cat.get("icon"))
                        .color((String) cat.get("color"))
                        .transactionType(TransactionType.EXPENSE)
                        .isDefault(true)
                        .build());
                created++;
            }
        }

        for (Map<String, Object> cat : incomeCategories) {
            String name = (String) cat.get("name");
            if (!categoryRepository.existsByNameAndUserIsNull(name)) {
                categoryRepository.save(Category.builder()
                        .name(name)
                        .icon((String) cat.get("icon"))
                        .color((String) cat.get("color"))
                        .transactionType(TransactionType.INCOME)
                        .isDefault(true)
                        .build());
                created++;
            }
        }

        if (created > 0) {
            log.info("✅ DataInitializer: {} catégories système créées.", created);
        } else {
            log.info("✅ DataInitializer: Catégories système déjà existantes.");
        }
    }

    private void initAdminUser() {
        if (userRepository.findByEmail("admin@stochy.com").isEmpty()) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("STOCHY")
                    .email("admin@stochy.com")
                    .password(passwordEncoder.encode("Admin@2026!"))
                    .role(Role.ROLE_ADMIN)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(admin);
            log.info("✅ DataInitializer: Admin créé — admin@stochy.com / Admin@2026!");
        }
    }

    private void initTestUser() {
        if (userRepository.findByEmail("user@stochy.com").isEmpty()) {
            User user = User.builder()
                    .firstName("Test")
                    .lastName("User")
                    .email("user@stochy.com")
                    .password(passwordEncoder.encode("User@2026!"))
                    .role(Role.ROLE_USER)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(user);
            log.info("✅ DataInitializer: User test créé — user@stochy.com / User@2026!");
        }
    }

    private void initClientUser() {
        if (userRepository.findByEmail("client@stochy.com").isEmpty()) {
            User client = User.builder()
                    .firstName("Jean")
                    .lastName("Dupont")
                    .email("client@stochy.com")
                    .password(passwordEncoder.encode("Client@2026!"))
                    .role(Role.ROLE_USER)
                    .mustChangePassword(false)
                    .build();
            userRepository.save(client);
            log.info("✅ DataInitializer: Client test créé — client@stochy.com / Client@2026!");
        }
    }

    private void initTestDataForUser(User user) {
        if (transactionRepository.countByUserId(user.getId()) > 0) {
            log.info("✅ DataInitializer: Des données de test existent déjà pour {}", user.getEmail());
            return;
        }

        log.info("⏳ DataInitializer: Initialisation des données de test pour {}...", user.getEmail());

        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        // 1. Récupération des catégories par défaut
        Category catAlim = categoryRepository.findByNameAndUserIsNull("Alimentation").orElseThrow();
        Category catLogement = categoryRepository.findByNameAndUserIsNull("Logement").orElseThrow();
        Category catTransport = categoryRepository.findByNameAndUserIsNull("Transport").orElseThrow();
        Category catLoisirs = categoryRepository.findByNameAndUserIsNull("Loisirs").orElseThrow();
        Category catAbonnement = categoryRepository.findByNameAndUserIsNull("Abonnements").orElseThrow();
        Category catSalaire = categoryRepository.findByNameAndUserIsNull("Salaire").orElseThrow();
        Category catFreelance = categoryRepository.findByNameAndUserIsNull("Freelance").orElseThrow();
        Category catAutresRevenus = categoryRepository.findByNameAndUserIsNull("Autres revenus").orElseThrow();

        // 2. Budgets
        budgetRepository.save(Budget.builder().user(user).category(catLogement).month(month).year(year).amount(BigDecimal.valueOf(1200.00)).build());
        budgetRepository.save(Budget.builder().user(user).category(catAlim).month(month).year(year).amount(BigDecimal.valueOf(600.00)).build());
        budgetRepository.save(Budget.builder().user(user).category(catTransport).month(month).year(year).amount(BigDecimal.valueOf(250.00)).build());
        budgetRepository.save(Budget.builder().user(user).category(catLoisirs).month(month).year(year).amount(BigDecimal.valueOf(200.00)).build());

        // 3. Transactions (Revenus & Dépenses)
        // Salaire ce mois-ci et le mois dernier
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Salaire Mensuel")
                .amount(BigDecimal.valueOf(3500.00))
                .type(TransactionType.INCOME)
                .incomeType(IncomeType.SALARY)
                .category(catSalaire)
                .transactionDate(now.withDayOfMonth(5))
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Salaire Mensuel")
                .amount(BigDecimal.valueOf(3500.00))
                .type(TransactionType.INCOME)
                .incomeType(IncomeType.SALARY)
                .category(catSalaire)
                .transactionDate(now.minusMonths(1).withDayOfMonth(5))
                .build());

        // Freelance
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Projet Site Web")
                .amount(BigDecimal.valueOf(1200.00))
                .type(TransactionType.INCOME)
                .incomeType(IncomeType.FREELANCE)
                .category(catFreelance)
                .transactionDate(now.minusDays(10))
                .build());

        // Dépenses Logement
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Loyer")
                .amount(BigDecimal.valueOf(1000.00))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catLogement)
                .transactionDate(now.withDayOfMonth(1))
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Loyer")
                .amount(BigDecimal.valueOf(1000.00))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catLogement)
                .transactionDate(now.minusMonths(1).withDayOfMonth(1))
                .build());

        // Dépenses Alimentation
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Courses Carrefour")
                .amount(BigDecimal.valueOf(185.50))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catAlim)
                .transactionDate(now.minusDays(3))
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Courses Monoprix")
                .amount(BigDecimal.valueOf(95.00))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catAlim)
                .transactionDate(now.minusDays(15))
                .build());

        // Dépenses Transport
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Plein d'essence")
                .amount(BigDecimal.valueOf(120.00))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catTransport)
                .transactionDate(now.minusDays(7))
                .build());

        // Dépenses Loisirs
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Abonnement Netflix")
                .amount(BigDecimal.valueOf(35.00))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catAbonnement)
                .transactionDate(now.withDayOfMonth(10))
                .build());

        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Dîner Restaurant")
                .amount(BigDecimal.valueOf(140.00))
                .type(TransactionType.EXPENSE)
                .expenseType(ExpenseType.NORMAL)
                .category(catLoisirs)
                .transactionDate(now.minusDays(2))
                .build());

        // 4. Saving Goals
        SavingGoal goalEmergency = SavingGoal.builder()
                .user(user)
                .name("Fonds d'urgence")
                .description("Fonds de secours en cas d'imprévus (santé, voiture, etc.)")
                .targetAmount(BigDecimal.valueOf(10000.00))
                .currentAmount(BigDecimal.valueOf(4000.00))
                .targetDate(now.plusYears(1))
                .fundingMode(GoalFundingMode.MANUAL)
                .build();
        goalEmergency = savingGoalRepository.save(goalEmergency);

        goalContributionRepository.save(GoalContribution.builder()
                .goal(goalEmergency)
                .amount(BigDecimal.valueOf(2500.00))
                .contributionDate(now.minusMonths(1).withDayOfMonth(15))
                .notes("Dépôt initial")
                .build());

        goalContributionRepository.save(GoalContribution.builder()
                .goal(goalEmergency)
                .amount(BigDecimal.valueOf(1500.00))
                .contributionDate(now.withDayOfMonth(15))
                .notes("Économies mensuelles")
                .build());

        SavingGoal goalVacances = SavingGoal.builder()
                .user(user)
                .name("Vacances d'été")
                .description("Voyage en Italie pour l'été")
                .targetAmount(BigDecimal.valueOf(3000.00))
                .currentAmount(BigDecimal.valueOf(1000.00))
                .targetDate(LocalDate.of(year, 8, 1))
                .fundingMode(GoalFundingMode.AUTO)
                .build();
        goalVacances = savingGoalRepository.save(goalVacances);

        goalContributionRepository.save(GoalContribution.builder()
                .goal(goalVacances)
                .amount(BigDecimal.valueOf(1000.00))
                .contributionDate(now.minusDays(5))
                .notes("Épargne automatique")
                .build());

        // 5. Debts (Argent prêté à autrui)
        Debt debtMehdi = Debt.builder()
                .user(user)
                .debtorName("Mehdi")
                .amountLent(BigDecimal.valueOf(1500.00))
                .remainingAmount(BigDecimal.valueOf(1000.00))
                .loanDate(now.minusMonths(2))
                .expectedRepaymentDate(now.plusMonths(2))
                .status(DebtStatus.PARTIALLY_REPAID)
                .notes("Prêt pour son déménagement")
                .build();
        debtMehdi = debtRepository.save(debtMehdi);

        // Repayment Mehdi
        DebtRepayment repaymentMehdi = DebtRepayment.builder()
                .debt(debtMehdi)
                .amount(BigDecimal.valueOf(500.00))
                .repaymentDate(now.minusMonths(1))
                .notes("Premier remboursement")
                .build();
        debtRepaymentRepository.save(repaymentMehdi);

        // Transaction liée au remboursement de Mehdi
        transactionRepository.save(Transaction.builder()
                .user(user)
                .title("Remboursement reçu - Mehdi")
                .amount(BigDecimal.valueOf(500.00))
                .type(TransactionType.INCOME)
                .incomeType(IncomeType.OTHER)
                .category(catAutresRevenus)
                .debt(debtMehdi)
                .transactionDate(now.minusMonths(1))
                .build());

        Debt debtSarah = Debt.builder()
                .user(user)
                .debtorName("Sarah")
                .amountLent(BigDecimal.valueOf(300.00))
                .remainingAmount(BigDecimal.valueOf(300.00))
                .loanDate(now.minusDays(10))
                .expectedRepaymentDate(now.plusDays(20))
                .status(DebtStatus.ONGOING)
                .notes("Avance pour l'achat d'un cadeau commun")
                .build();
        debtRepository.save(debtSarah);

        // 6. Loans (Emprunts)
        Loan loanCar = Loan.builder()
                .user(user)
                .lenderName("Amen Bank")
                .loanType(LoanType.AUTO)
                .initialAmount(BigDecimal.valueOf(25000.00))
                .remainingCapital(BigDecimal.valueOf(21000.00))
                .interestRate(BigDecimal.valueOf(7.50))
                .isFixedRate(true)
                .durationMonths(60)
                .startDate(now.minusMonths(8))
                .monthlyPayment(BigDecimal.valueOf(500.00))
                .alertDaysBefore(7)
                .notes("Crédit auto - Toyota Yaris")
                .isActive(true)
                .build();
        loanCar = loanRepository.save(loanCar);

        // Crée l'échéancier et marque les 8 premières échéances comme payées
        BigDecimal monthlyRate = loanCar.getInterestRate()
                .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        BigDecimal remainingCapital = loanCar.getInitialAmount();
        LocalDate dueDate = loanCar.getStartDate().plusMonths(1);

        for (int i = 1; i <= loanCar.getDurationMonths(); i++) {
            BigDecimal interestAmount = remainingCapital.multiply(monthlyRate)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalAmount = loanCar.getMonthlyPayment().subtract(interestAmount);

            if (i == loanCar.getDurationMonths()) {
                principalAmount = remainingCapital;
            }

            BigDecimal totalAmount = principalAmount.add(interestAmount);
            remainingCapital = remainingCapital.subtract(principalAmount);
            if (remainingCapital.compareTo(BigDecimal.ZERO) < 0) {
                remainingCapital = BigDecimal.ZERO;
            }

            boolean isPaid = (i <= 8);

            LoanRepayment repayment = LoanRepayment.builder()
                    .loan(loanCar)
                    .dueDate(dueDate)
                    .principalAmount(principalAmount)
                    .interestAmount(interestAmount)
                    .totalAmount(totalAmount)
                    .isPaid(isPaid)
                    .paymentDate(isPaid ? dueDate : null)
                    .build();

            loanRepaymentRepository.save(repayment);

            if (isPaid) {
                // Enregistre aussi la transaction de type LOAN
                transactionRepository.save(Transaction.builder()
                        .user(user)
                        .title("Remboursement prêt - Amen Bank")
                        .amount(totalAmount)
                        .type(TransactionType.EXPENSE)
                        .expenseType(ExpenseType.LOAN)
                        .category(catTransport)
                        .loan(loanCar)
                        .transactionDate(dueDate)
                        .build());
            }

            dueDate = dueDate.plusMonths(1);
        }

        log.info("✅ DataInitializer: Données de test créées avec succès pour {}", user.getEmail());
    }
}

