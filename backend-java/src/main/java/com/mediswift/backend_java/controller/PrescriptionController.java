package com.mediswift.backend_java.controller;

import com.mediswift.backend_java.model.PrescriptionAnalysis;
import com.mediswift.backend_java.service.PythonServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/prescription")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PythonServiceClient pythonServiceClient;

    @PostMapping("/analyze")
    public ResponseEntity<PrescriptionAnalysis> analyzePrescription(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        PrescriptionAnalysis result = pythonServiceClient.analyzePrescription(file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = pythonServiceClient.getRecommendations(request);
        return ResponseEntity.ok(result);
    }
}
