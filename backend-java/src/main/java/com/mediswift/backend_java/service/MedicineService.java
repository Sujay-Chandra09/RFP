package com.mediswift.backend_java.service;

import com.mediswift.backend_java.model.Medicine;
import com.mediswift.backend_java.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }

    public List<Medicine> getMedicinesByCategory(String category) {
        return medicineRepository.findByCategory(category);
    }

    public List<Medicine> searchMedicines(String query) {
        return medicineRepository.findByNameContainingIgnoreCaseOrBrandContainingIgnoreCaseOrGenericNameContainingIgnoreCase(
                query, query, query);
    }

    public Medicine saveMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    public boolean updateStock(Long id, int quantity) {
        Optional<Medicine> medOpt = medicineRepository.findById(id);
        if (medOpt.isPresent()) {
            Medicine med = medOpt.get();
            if (med.getStock() >= quantity) {
                med.setStock(med.getStock() - quantity);
                medicineRepository.save(med);
                return true;
            }
        }
        return false;
    }
}
