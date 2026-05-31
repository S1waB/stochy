package com.stochy.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String icon;
    private String color;

    @NotBlank(message = "Le type de transaction est obligatoire")
    private String transactionType;
}
