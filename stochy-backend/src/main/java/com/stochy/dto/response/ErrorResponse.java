package com.stochy.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
    private String path;
    private List<FieldError> errors;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FieldError {
        private String field;
        private String message;
    }
}
