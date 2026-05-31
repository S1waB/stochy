package com.stochy.service;

import com.stochy.dto.request.LoginRequest;
import com.stochy.dto.request.RegisterRequest;
import com.stochy.dto.request.ChangePasswordRequest;
import com.stochy.dto.request.ResetPasswordRequest;
import com.stochy.dto.response.AuthResponse;
import com.stochy.entity.Address;
import com.stochy.entity.User;
import com.stochy.enums.*;
import com.stochy.exception.BadRequestException;
import com.stochy.exception.EmailAlreadyExistsException;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.exception.UnauthorizedException;
import com.stochy.repository.UserRepository;
import com.stochy.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider, AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email déjà utilisé: " + request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_USER)
                .build();

        if (request.getGender() != null) {
            user.setGender(Gender.valueOf(request.getGender()));
        }
        if (request.getBirthDate() != null && !request.getBirthDate().isBlank()) {
            user.setBirthDate(LocalDate.parse(request.getBirthDate()));
        }
        if (request.getProfessionalStatus() != null) {
            user.setProfessionalStatus(ProfessionalStatus.valueOf(request.getProfessionalStatus()));
        }
        if (request.getMaritalStatus() != null) {
            user.setMaritalStatus(MaritalStatus.valueOf(request.getMaritalStatus()));
        }

        user = userRepository.save(user);

        if (request.getAddress() != null) {
            Address address = Address.builder()
                    .user(user)
                    .country(request.getAddress().getCountry())
                    .region(request.getAddress().getRegion())
                    .municipality(request.getAddress().getMunicipality())
                    .street(request.getAddress().getStreet())
                    .houseNumber(request.getAddress().getHouseNumber())
                    .build();
            user.setAddress(address);
            userRepository.save(user);
        }

        emailService.sendEmail(user.getEmail(), "Bienvenue sur STOCHY",
                "Bonjour " + user.getFirstName() + ",\n\nVotre compte STOCHY a été créé avec succès !\n\nCordialement,\nL'équipe STOCHY");

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(),
                user.getRole().name(), user.getMustChangePassword());

        return AuthResponse.builder()
                .accessToken(token)
                .mustChangePassword(false)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Votre compte a été désactivé. Contactez l'administrateur.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(),
                user.getRole().name(), user.getMustChangePassword());

        return AuthResponse.builder()
                .accessToken(token)
                .mustChangePassword(user.getMustChangePassword())
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
            emailService.sendEmail(user.getEmail(), "STOCHY — Réinitialisation du mot de passe",
                    "Bonjour " + user.getFirstName() + ",\n\nCliquez sur ce lien pour réinitialiser votre mot de passe:\n"
                            + resetLink + "\n\nCe lien expire dans 1 heure.\n\nCordialement,\nL'équipe STOCHY");
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Token de réinitialisation invalide."));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Le token de réinitialisation a expiré.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("L'ancien mot de passe est incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    public UUID getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
        return user.getId();
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
    }
}
