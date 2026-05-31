package com.stochy;

import com.stochy.entity.Category;
import com.stochy.entity.User;
import com.stochy.enums.Role;
import com.stochy.enums.TransactionType;
import com.stochy.repository.CategoryRepository;
import com.stochy.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository, UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initCategories();
        initAdminUser();
        initTestUser();
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
}
