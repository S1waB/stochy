package com.stochy.service;

import com.stochy.dto.request.UpdateProfileRequest;
import com.stochy.dto.response.UserResponse;
import com.stochy.entity.Address;
import com.stochy.entity.User;
import com.stochy.enums.*;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Value("${stochy.upload.dir}")
    private String uploadDir;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + userId));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(Gender.valueOf(request.getGender()));
        if (request.getBirthDate() != null && !request.getBirthDate().isBlank()) {
            user.setBirthDate(LocalDate.parse(request.getBirthDate()));
        }
        if (request.getProfessionalStatus() != null) {
            user.setProfessionalStatus(ProfessionalStatus.valueOf(request.getProfessionalStatus()));
        }
        if (request.getMaritalStatus() != null) {
            user.setMaritalStatus(MaritalStatus.valueOf(request.getMaritalStatus()));
        }

        if (request.getAddress() != null) {
            Address address = user.getAddress();
            if (address == null) {
                address = new Address();
                address.setUser(user);
            }
            address.setCountry(request.getAddress().getCountry());
            address.setRegion(request.getAddress().getRegion());
            address.setMunicipality(request.getAddress().getMunicipality());
            address.setStreet(request.getAddress().getStreet());
            address.setHouseNumber(request.getAddress().getHouseNumber());
            user.setAddress(address);
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void updateCurrency(UUID userId, String currency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        user.setCurrency(currency);
        userRepository.save(user);
    }

    @Transactional
    public String uploadProfilePic(UUID userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || (!originalFilename.toLowerCase().endsWith(".jpg")
                && !originalFilename.toLowerCase().endsWith(".jpeg")
                && !originalFilename.toLowerCase().endsWith(".png"))) {
            throw new RuntimeException("Format non supporté. Utilisez JPG ou PNG.");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("Le fichier dépasse 2 Mo.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID() + extension;
        Path uploadPath = Paths.get(uploadDir, "profile-pics");
        Files.createDirectories(uploadPath);
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        String profilePicUrl = "/uploads/profile-pics/" + filename;
        user.setProfilePicUrl(profilePicUrl);
        userRepository.save(user);

        return profilePicUrl;
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse.AddressResponse addressResponse = null;
        if (user.getAddress() != null) {
            addressResponse = UserResponse.AddressResponse.builder()
                    .country(user.getAddress().getCountry())
                    .region(user.getAddress().getRegion())
                    .municipality(user.getAddress().getMunicipality())
                    .street(user.getAddress().getStreet())
                    .houseNumber(user.getAddress().getHouseNumber())
                    .build();
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .birthDate(user.getBirthDate())
                .profilePicUrl(user.getProfilePicUrl())
                .professionalStatus(user.getProfessionalStatus() != null ? user.getProfessionalStatus().name() : null)
                .maritalStatus(user.getMaritalStatus() != null ? user.getMaritalStatus().name() : null)
                .currency(user.getCurrency())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .address(addressResponse)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
