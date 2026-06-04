package com.mediswift.backend_java.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_order") // 'order' is a reserved keyword in H2/SQL databases
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userEmail;
    
    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    private Double totalAmount;
    private String status; // CREATED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    private String address;
    private String prescriptionUrl;
    private Double latitude;
    private Double longitude;
    private LocalDateTime orderDate;
}
