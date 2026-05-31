package com.stochy.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate birthDate;
    private String profilePicUrl;
    private String professionalStatus;
    private String maritalStatus;
    private String currency;
    private String role;
    private Boolean isActive;
    private AddressResponse address;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressResponse {
        private String country;
        private String region;
        private String municipality;
        private String street;
        private String houseNumber;
    }
}
