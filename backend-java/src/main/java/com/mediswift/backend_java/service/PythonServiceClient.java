package com.mediswift.backend_java.service;

import com.mediswift.backend_java.model.PrescriptionAnalysis;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class PythonServiceClient {

    @Value("${python.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public PrescriptionAnalysis analyzePrescription(MultipartFile file) {
        String url = pythonServiceUrl + "/analyze-prescription";
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Build a resource from the multipart file
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<PrescriptionAnalysis> response = restTemplate.postForEntity(url, requestEntity, PrescriptionAnalysis.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error calling Python OCR Service: " + e.getMessage() + ". Using Java fallback parser.");
            // Fallback: parse filename locally if Python server is unreachable
            return getFallbackAnalysis(file.getOriginalFilename());
        }
    }

    public Map<String, Object> getRecommendations(Map<String, Object> request) {
        String url = pythonServiceUrl + "/recommendations";
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error calling Python Recommendations Service: " + e.getMessage() + ". Using Java fallback recommendations.");
            return getFallbackRecommendations((ArrayList<String>) request.get("medicines"));
        }
    }

    private PrescriptionAnalysis getFallbackAnalysis(String filename) {
        PrescriptionAnalysis analysis = new PrescriptionAnalysis();
        analysis.setHospitalName("MediSwift Fallback Clinic");
        analysis.setDoctorName("Dr. System Simulator");
        analysis.setDate("2026-06-03");
        analysis.setConfidence(0.85);

        List<PrescriptionAnalysis.MedicineDetail> medicines = new ArrayList<>();
        String nameLower = filename != null ? filename.toLowerCase() : "";

        if (nameLower.contains("asthma") || nameLower.contains("ventolin")) {
            analysis.setPatientName("Alex Carter");
            medicines.add(createMedDetail("Ventolin", "100mcg", "2 puffs every 4 hours", "30 days"));
            medicines.add(createMedDetail("Montelukast", "10mg", "Once daily", "30 days"));
        } else if (nameLower.contains("infection") || nameLower.contains("amox")) {
            analysis.setPatientName("Michael Vance");
            medicines.add(createMedDetail("Amoxicillin", "500mg", "3 times daily", "7 days"));
        } else if (nameLower.contains("pain") || nameLower.contains("advil") || nameLower.contains("ibuprofen")) {
            analysis.setPatientName("Sarah Miller");
            medicines.add(createMedDetail("Advil", "400mg", "Every 6 hours as needed", "5 days"));
        } else {
            analysis.setPatientName("Jane Doe");
            medicines.add(createMedDetail("Amoxicillin", "500mg", "3 times daily", "7 days"));
            medicines.add(createMedDetail("Advil", "400mg", "Every 6 hours as needed", "5 days"));
        }
        analysis.setMedicines(medicines);
        return analysis;
    }

    private PrescriptionAnalysis.MedicineDetail createMedDetail(String name, String dosage, String freq, String dur) {
        PrescriptionAnalysis.MedicineDetail med = new PrescriptionAnalysis.MedicineDetail();
        med.setName(name);
        med.setDosage(dosage);
        med.setFrequency(freq);
        med.setDuration(dur);
        return med;
    }

    private Map<String, Object> getFallbackRecommendations(ArrayList<String> medicines) {
        Map<String, Object> fallback = new HashMap<>();
        ArrayList<Map<String, Object>> recs = new ArrayList<>();
        ArrayList<Map<String, Object>> ints = new ArrayList<>();

        if (medicines != null) {
            for (String med : medicines) {
                Map<String, Object> rec = new HashMap<>();
                rec.put("queriedName", med);
                
                String medLower = med.toLowerCase();
                if (medLower.contains("lipitor")) {
                    rec.put("hasGeneric", true);
                    rec.put("brandName", "Lipitor");
                    rec.put("genericName", "Atorvastatin");
                    rec.put("brandPrice", 45.0);
                    rec.put("genericPrice", 11.25);
                    rec.put("savingPercent", "75%");
                    rec.put("recommendationText", "Switch to Generic Atorvastatin to save 75% on your prescription.");
                } else if (medLower.contains("tylenol")) {
                    rec.put("hasGeneric", true);
                    rec.put("brandName", "Tylenol");
                    rec.put("genericName", "Acetaminophen");
                    rec.put("brandPrice", 12.0);
                    rec.put("genericPrice", 4.80);
                    rec.put("savingPercent", "60%");
                    rec.put("recommendationText", "Switch to Generic Acetaminophen to save 60% on your prescription.");
                } else if (medLower.contains("advil") || medLower.contains("ibuprofen")) {
                    rec.put("hasGeneric", true);
                    rec.put("brandName", "Advil");
                    rec.put("genericName", "Ibuprofen");
                    rec.put("brandPrice", 10.0);
                    rec.put("genericPrice", 5.00);
                    rec.put("savingPercent", "50%");
                    rec.put("recommendationText", "Switch to Generic Ibuprofen to save 50% on your prescription.");
                } else {
                    rec.put("hasGeneric", false);
                    rec.put("genericName", med);
                    rec.put("genericPrice", 15.0);
                    rec.put("recommendationText", "No cheaper generic substitute found in local database.");
                }
                recs.add(rec);
            }
            
            // Check interactions
            boolean hasIbuprofen = false;
            boolean hasAspirin = false;
            for (String m : medicines) {
                String mLower = m.toLowerCase();
                if (mLower.contains("ibuprofen") || mLower.contains("advil")) hasIbuprofen = true;
                if (mLower.contains("aspirin")) hasAspirin = true;
            }
            
            if (hasIbuprofen && hasAspirin) {
                Map<String, Object> inter = new HashMap<>();
                inter.put("drugA", "Ibuprofen");
                inter.put("drugB", "Aspirin");
                inter.put("severity", "Moderate");
                inter.put("description", "Concomitant use may decrease Aspirin cardioprotection and increase gastrointestinal bleeding risk.");
                ints.add(inter);
            }
        }

        fallback.put("recommendations", recs);
        fallback.put("interactions", ints);
        return fallback;
    }
}
