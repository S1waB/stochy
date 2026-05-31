package com.stochy.dto.request;

import jakarta.validation.Valid;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private String birthDate;
    private String professionalStatus;
    private String maritalStatus;

    @Valid
    private RegisterRequest.AddressRequest address;
}
