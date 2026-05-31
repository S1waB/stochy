package com.stochy.service;

import com.opencsv.CSVReader;
import com.stochy.entity.Category;
import com.stochy.entity.Transaction;
import com.stochy.entity.User;
import com.stochy.enums.TransactionType;
import com.stochy.repository.CategoryRepository;
import com.stochy.repository.TransactionRepository;
import com.stochy.repository.UserRepository;
import com.stochy.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class CsvImportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CsvImportService(TransactionRepository transactionRepository,
                            CategoryRepository categoryRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> importCsv(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        int imported = 0;
        int failed = 0;
        List<Map<String, Object>> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext(); // skip header
            String[] line;
            int lineNumber = 1;

            while ((line = reader.readNext()) != null) {
                lineNumber++;
                try {
                    if (line.length < 4) {
                        throw new RuntimeException("Nombre de colonnes insuffisant");
                    }

                    String title = line[0].trim();
                    BigDecimal amount = new BigDecimal(line[1].trim());
                    TransactionType type = TransactionType.valueOf(line[2].trim().toUpperCase());
                    String categoryName = line[3].trim();

                    LocalDate txDate = LocalDate.now();
                    if (line.length > 4 && !line[4].trim().isEmpty()) {
                        txDate = LocalDate.parse(line[4].trim());
                    }

                    String notes = line.length > 5 ? line[5].trim() : null;
                    boolean isRecurring = line.length > 6 && Boolean.parseBoolean(line[6].trim());

                    // Find or create category
                    Category category = categoryRepository.findByNameAndUserId(categoryName, userId)
                            .orElseGet(() -> categoryRepository.findByNameAndUserIsNull(categoryName)
                                    .orElseGet(() -> {
                                        Category newCat = Category.builder()
                                                .user(user)
                                                .name(categoryName)
                                                .transactionType(type == TransactionType.SAVING ? TransactionType.EXPENSE : type)
                                                .build();
                                        return categoryRepository.save(newCat);
                                    }));

                    Transaction transaction = Transaction.builder()
                            .user(user)
                            .title(title)
                            .amount(amount)
                            .type(type)
                            .category(category)
                            .transactionDate(txDate)
                            .notes(notes)
                            .isRecurring(isRecurring)
                            .build();

                    transactionRepository.save(transaction);
                    imported++;
                } catch (Exception e) {
                    failed++;
                    Map<String, Object> error = new HashMap<>();
                    error.put("line", lineNumber);
                    error.put("reason", e.getMessage());
                    errors.add(error);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier CSV: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("imported", imported);
        result.put("failed", failed);
        result.put("errors", errors);
        return result;
    }
}
