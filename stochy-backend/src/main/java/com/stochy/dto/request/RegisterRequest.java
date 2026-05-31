package com.stochy.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;

    private String phone;
    private String gender;
    private String birthDate;
    private String professionalStatus;
    private String maritalStatus;

    @Valid
    private AddressRequest address;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressRequest {
        private String country;
        private String region;
        private String municipality;
        private String street;
        private String houseNumber;
    }
}
