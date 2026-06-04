package com.mediswift.backend_java.repository;

import com.mediswift.backend_java.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmailOrderByOrderDateDesc(String userEmail);
}
