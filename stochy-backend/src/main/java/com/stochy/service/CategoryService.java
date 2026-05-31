package com.stochy.service;

import com.stochy.dto.request.CategoryRequest;
import com.stochy.dto.response.CategoryResponse;
import com.stochy.entity.Category;
import com.stochy.entity.User;
import com.stochy.enums.TransactionType;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.CategoryRepository;
import com.stochy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryResponse> getCategories(UUID userId, String type) {
        List<Category> categories;
        if (type != null && !type.isBlank()) {
            TransactionType txType = TransactionType.valueOf(type);
            categories = categoryRepository.findByUserIdOrSystemAndType(userId, txType);
        } else {
            categories = categoryRepository.findByUserIdOrSystem(userId);
        }
        return categories.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(UUID userId, CategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .transactionType(TransactionType.valueOf(request.getTransactionType()))
                .isDefault(false)
                .build();

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID userId, UUID categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID: " + categoryId));

        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new BadRequestException("Vous ne pouvez modifier que vos propres catégories.");
        }

        category.setName(request.getName());
        if (request.getIcon() != null) category.setIcon(request.getIcon());
        if (request.getColor() != null) category.setColor(request.getColor());
        category.setTransactionType(TransactionType.valueOf(request.getTransactionType()));

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID userId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'ID: " + categoryId));

        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new BadRequestException("Vous ne pouvez supprimer que vos propres catégories.");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .transactionType(category.getTransactionType().name())
                .build();
    }
}
