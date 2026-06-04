package com.mediswift.backend_java.service;

import com.mediswift.backend_java.model.Order;
import com.mediswift.backend_java.model.OrderItem;
import com.mediswift.backend_java.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MedicineService medicineService;

    public Order createOrder(Order order) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("CREATED");
        
        // Subtract stock for each item in the order
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                medicineService.updateStock(item.getMedicineId(), item.getQuantity());
            }
        }
        
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserEmail(String email) {
        return orderRepository.findByUserEmailOrderByOrderDateDesc(email);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order updateOrderStatus(Long id, String status) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found with id: " + id);
    }
}
