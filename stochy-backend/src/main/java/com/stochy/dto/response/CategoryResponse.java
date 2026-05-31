package com.stochy.dto.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private UUID id;
    private String name;
    private String icon;
    private String color;
    private Boolean isDefault;
    private String transactionType;
}
