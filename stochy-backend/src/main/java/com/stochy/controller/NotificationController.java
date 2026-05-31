package com.stochy.controller;

import com.stochy.dto.response.ApiResponse;
import com.stochy.entity.Notification;
import com.stochy.service.AuthService;
import com.stochy.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<Page<Notification>> list(@RequestParam(required = false) Boolean isRead,
                                                    @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotifications(authService.getCurrentUserId(), isRead, pageable));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse("Notification marquée comme lue."));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead() {
        notificationService.markAllAsRead(authService.getCurrentUserId());
        return ResponseEntity.ok(new ApiResponse("Toutes les notifications marquées comme lues."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
