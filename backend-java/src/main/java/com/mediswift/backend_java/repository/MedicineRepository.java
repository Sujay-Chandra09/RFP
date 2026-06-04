package com.mediswift.backend_java.repository;

import com.mediswift.backend_java.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByCategory(String category);
    List<Medicine> findByNameContainingIgnoreCaseOrBrandContainingIgnoreCaseOrGenericNameContainingIgnoreCase(
            String name, String brand, String genericName);
}
