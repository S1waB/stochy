package com.stochy.controller;

import com.stochy.service.AuthService;
import com.stochy.service.CsvImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/csv")
public class CsvController {

    private final CsvImportService csvImportService;
    private final AuthService authService;

    public CsvController(CsvImportService csvImportService, AuthService authService) {
        this.csvImportService = csvImportService;
        this.authService = authService;
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(csvImportService.importCsv(authService.getCurrentUserId(), file));
    }
}
