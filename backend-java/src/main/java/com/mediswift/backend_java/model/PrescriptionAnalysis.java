package com.mediswift.backend_java.model;

import java.util.List;
import lombok.Data;

@Data
public class PrescriptionAnalysis {
    private String patientName;
    private String date;
    private List<MedicineDetail> medicines;
    private String doctorName;
    private String hospitalName;
    private Double confidence;

    @Data
    public static class MedicineDetail {
        private String name;
        private String dosage;
        private String frequency;
        private String duration;
    }
}
