package com.stochy.controller;

import com.stochy.dto.request.CreateAdminRequest;
import com.stochy.dto.response.AdminDashboardResponse;
import com.stochy.dto.response.UserResponse;
import com.stochy.enums.Gender;
import com.stochy.enums.ProfessionalStatus;
import com.stochy.enums.Role;
import com.stochy.service.AdminService;
import com.stochy.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String professionalStatus,
            @RequestParam(required = false) String gender,
            @PageableDefault(size = 20) Pageable pageable) {

        Role r = role != null ? Role.valueOf(role) : null;
        ProfessionalStatus ps = professionalStatus != null ? ProfessionalStatus.valueOf(professionalStatus) : null;
        Gender g = gender != null ? Gender.valueOf(gender) : null;

        return ResponseEntity.ok(adminService.getUsers(search, r, isActive, ps, g, pageable));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<UserResponse> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id, authService.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAdmin(request));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }
}
