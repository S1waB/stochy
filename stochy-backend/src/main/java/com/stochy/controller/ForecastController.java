package com.stochy.controller;

import com.stochy.dto.response.CashFlowForecastResponse;
import com.stochy.service.AuthService;
import com.stochy.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/forecast")
public class ForecastController {

    private final ForecastService forecastService;
    private final AuthService authService;

    public ForecastController(ForecastService forecastService, AuthService authService) {
        this.forecastService = forecastService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<CashFlowForecastResponse> getForecast(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(forecastService.getForecast(authService.getCurrentUserId(), months));
    }
}
