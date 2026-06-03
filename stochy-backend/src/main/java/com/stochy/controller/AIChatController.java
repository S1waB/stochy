package com.stochy.controller;

import com.stochy.dto.request.AIChatRequest;
import com.stochy.dto.response.AIChatResponse;
import com.stochy.service.AIChatService;
import com.stochy.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AIChatController {

    private final AIChatService aiChatService;
    private final AuthService authService;

    public AIChatController(AIChatService aiChatService, AuthService authService) {
        this.aiChatService = aiChatService;
        this.authService = authService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@Valid @RequestBody AIChatRequest request) {
        return ResponseEntity.ok(aiChatService.getChatResponse(authService.getCurrentUserId(), request));
    }
}
