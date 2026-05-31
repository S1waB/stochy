package com.stochy.controller;

import com.stochy.dto.request.UpdateProfileRequest;
import com.stochy.dto.response.ApiResponse;
import com.stochy.dto.response.UserResponse;
import com.stochy.service.AuthService;
import com.stochy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(userService.getUserProfile(authService.getCurrentUserId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(authService.getCurrentUserId(), request));
    }

    @PatchMapping("/me/currency")
    public ResponseEntity<ApiResponse> updateCurrency(@RequestBody Map<String, String> body) {
        String currency = body.get("currency");
        userService.updateCurrency(authService.getCurrentUserId(), currency);
        ApiResponse response = new ApiResponse("Devise mise à jour.");
        response.setData(Map.of("currency", currency));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/profile-pic")
    public ResponseEntity<Map<String, String>> uploadProfilePic(@RequestParam("file") MultipartFile file) throws IOException {
        String url = userService.uploadProfilePic(authService.getCurrentUserId(), file);
        return ResponseEntity.ok(Map.of("profilePicUrl", url));
    }
}
