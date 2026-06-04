// app.js - MediSwift Frontend Application Logic

// API Base URL (Java REST API)
const API_BASE = window.location.origin;

// State Variables
let currentUser = null;
let cart = [];
let selectedMedicine = null;
let activeOrder = null;
let activeSection = 'catalog';

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromStorage();
    setupAuthListeners();
    setupEventListeners();
    setupMapCanvas();
    
    // Initial fetch of medicines
    fetchMedicines();
});

// Load cart from local storage
function loadCartFromStorage() {
    const stored = localStorage.getItem("mediswift_cart");
    if (stored) {
        cart = JSON.parse(stored);
        updateCartUI();
    }
}

// Save cart to local storage
function saveCartToStorage() {
    localStorage.setItem("mediswift_cart", JSON.stringify(cart));
    updateCartUI();
}

// Switch between views
function showSection(sectionId) {
    activeSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
        sec.style.display = "none";
    });
    
    // Show target section
    const target = document.getElementById(`${sectionId}-section`);
    if (target) {
        target.classList.add("active");
        target.style.display = "block";
    }
    
    // Update active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("data-target") === sectionId) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Specific section initialization
    if (sectionId === 'catalog') {
        fetchMedicines();
    } else if (sectionId === 'orders') {
        fetchOrderHistory();
    } else if (sectionId === 'delivery') {
        loadCourierDashboard();
    }
}

// Authentication Setup
function setupAuthListeners() {
    window.firebaseAuth.onAuthStateChanged(user => {
        currentUser = user;
        const navAuthBtn = document.getElementById("nav-auth-btn");
        const navUserProfile = document.getElementById("nav-user-profile");
        const userDisplayName = document.getElementById("user-display-name");
        const cartBtn = document.getElementById("cart-btn");
        const navLinksContainer = document.getElementById("nav-links-container");

        if (user) {
            // User logged in
            navAuthBtn.style.display = "none";
            navUserProfile.style.display = "flex";
            userDisplayName.textContent = `${user.email.split('@')[0]} (${user.role === 'courier' ? 'Courier' : 'Customer'})`;
            
            if (user.role === 'courier') {
                // Adjust Nav links for Courier Partner
                cartBtn.style.display = "none";
                navLinksContainer.innerHTML = `
                    <li><span class="nav-link active" data-target="delivery" id="link-delivery">Delivery Console</span></li>
                `;
                // Force switch to delivery view
                showSection('delivery');
            } else {
                // Adjust Nav links for Customer
                cartBtn.style.display = "block";
                navLinksContainer.innerHTML = `
                    <li><span class="nav-link active" data-target="catalog" id="link-catalog">Browse Catalog</span></li>
                    <li><span class="nav-link" data-target="orders" id="link-orders">Order History</span></li>
                `;
                // Rebind event listeners for dynamically added links
                setupDynamicNavListeners();
                
                if (activeSection === 'auth' || activeSection === 'delivery') {
                    showSection('catalog');
                }
            }
        } else {
            // User logged out
            navAuthBtn.style.display = "block";
            navUserProfile.style.display = "none";
            cartBtn.style.display = "block";
            
            navLinksContainer.innerHTML = `
                <li><span class="nav-link active" data-target="catalog" id="link-catalog">Browse Catalog</span></li>
                <li><span class="nav-link" data-target="orders" id="link-orders">Order History</span></li>
            `;
            setupDynamicNavListeners();
            
            if (activeSection === 'orders' || activeSection === 'checkout' || activeSection === 'delivery') {
                showSection('auth');
            }
        }
    });
}

function setupDynamicNavListeners() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            const target = link.getAttribute("data-target");
            if (target === 'orders' && !currentUser) {
                showSection('auth');
            } else {
                showSection(target);
            }
        });
    });
}

// Setup Interactive Action Event Listeners
function setupEventListeners() {
    setupDynamicNavListeners();

    // Auth button in nav
    document.getElementById("nav-auth-btn").addEventListener("click", () => {
        showSection('auth');
    });

    // Sign out button
    document.getElementById("signout-btn").addEventListener("click", () => {
        window.firebaseAuth.signOut().then(() => {
            showSection('catalog');
        });
    });

    // Auth Form Toggle
    document.getElementById("toggle-signup").addEventListener("click", () => {
        document.getElementById("login-form-box").style.display = "none";
        document.getElementById("signup-form-box").style.display = "block";
    });
    
    document.getElementById("toggle-login").addEventListener("click", () => {
        document.getElementById("signup-form-box").style.display = "none";
        document.getElementById("login-form-box").style.display = "block";
    });

    // Auth actions
    document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const pass = document.getElementById("login-pass").value;
        const errorEl = document.getElementById("login-error");
        
        errorEl.textContent = "";
        window.firebaseAuth.signInWithEmailAndPassword(email, pass)
            .catch(err => {
                errorEl.textContent = err.message;
            });
    });

    document.getElementById("signup-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const pass = document.getElementById("signup-pass").value;
        const role = document.getElementById("signup-role").value;
        const errorEl = document.getElementById("signup-error");
        
        errorEl.textContent = "";
        window.firebaseAuth.createUserWithEmailAndPassword(email, pass, role)
            .catch(err => {
                errorEl.textContent = err.message;
            });
    });

    // Search bar
    const searchInput = document.getElementById("search-input");
    let searchTimeout = null;
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchMedicines(null, searchInput.value);
        }, 300);
    });

    // Category filtering
    document.querySelectorAll(".category-capsule").forEach(capsule => {
        capsule.addEventListener("click", () => {
            document.querySelectorAll(".category-capsule").forEach(c => c.classList.remove("active"));
            capsule.classList.add("active");
            
            const category = capsule.getAttribute("data-category");
            fetchMedicines(category === 'All' ? null : category);
        });
    });

    // Cart drawer toggles
    document.getElementById("cart-btn").addEventListener("click", toggleCartDrawer);
    document.getElementById("close-cart").addEventListener("click", toggleCartDrawer);

    // Modal Close
    document.getElementById("close-product-modal").addEventListener("click", () => {
        document.getElementById("product-detail-modal").classList.remove("active");
    });
    
    document.getElementById("close-tracking-modal").addEventListener("click", () => {
        document.getElementById("order-tracking-modal").classList.remove("active");
        if (activeOrder && activeOrder.status === 'DELIVERED') {
            activeOrder = null;
            showSection('orders');
        }
    });

    // Add to cart from Modal
    document.getElementById("modal-add-to-cart").addEventListener("click", () => {
        if (selectedMedicine) {
            addToCart(selectedMedicine.id, selectedMedicine.name, selectedMedicine.price);
            document.getElementById("product-detail-modal").classList.remove("active");
        }
    });

    // Prescription file upload trigger
    const fileBox = document.getElementById("prescription-file-box");
    const fileInput = document.getElementById("prescription-file");
    
    fileBox.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handlePrescriptionUpload);

    // Shipping Form Checkout submit
    document.getElementById("checkout-form").addEventListener("submit", handlePlaceOrder);

    // Automated courier simulation trigger button (for quick self-testing)
    document.getElementById("sim-delivery-btn").addEventListener("click", () => {
        if (activeOrder) {
            simulateCourierStatusUpdates(activeOrder.id);
            showToast("Simulated courier status automation started.");
        }
    });
}

// Fetch Catalog items
function fetchMedicines(category = null, search = null) {
    let url = `${API_BASE}/api/medicines`;
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    
    if (params.length > 0) {
        url += `?${params.join("&")}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            renderMedicines(data);
        })
        .catch(err => {
            console.error("Error fetching medicines catalog:", err);
        });
}

// Render product list cards in INR
function renderMedicines(medicines) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    
    if (medicines.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No medicines found matching your criteria.</div>`;
        return;
    }

    medicines.forEach((med, idx) => {
        const card = document.createElement("div");
        card.className = "product-card glass animate-fade-in";
        card.style.animationDelay = `${idx * 0.05}s`;
        
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img class="product-img" src="${med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'}" alt="${med.name}">
                <span class="product-tag">${med.category}</span>
            </div>
            <div class="product-body">
                <h4 class="product-title">${med.name}</h4>
                <p class="product-generic">Generic/Chemical: ${med.genericName}</p>
                <p style="font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px;">${med.description}</p>
                <div class="product-price-row">
                    <span class="product-price">₹${med.price.toFixed(2)}</span>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-sm" onclick="openProductModal(${med.id})">Details</button>
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart(${med.id}, '${med.name}', ${med.price})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Open details and search for recommendations (Python endpoint integration)
window.openProductModal = function(id) {
    fetch(`${API_BASE}/api/medicines/${id}`)
        .then(res => res.json())
        .then(med => {
            selectedMedicine = med;
            
            document.getElementById("modal-title").textContent = med.name;
            document.getElementById("modal-category").textContent = med.category;
            document.getElementById("modal-desc").textContent = med.description;
            document.getElementById("modal-side-effects").textContent = med.sideEffects || "No side effects reported in standard database.";
            document.getElementById("modal-stock").innerHTML = med.stock > 0 
                ? `<span style="color: var(--success)">In Stock (${med.stock} units available)</span>` 
                : `<span style="color: var(--danger)">Out of Stock</span>`;
            
            // Add To Cart button state
            const cartBtn = document.getElementById("modal-add-to-cart");
            if (med.stock > 0) {
                cartBtn.removeAttribute("disabled");
                cartBtn.textContent = "Add to Cart";
            } else {
                cartBtn.setAttribute("disabled", "true");
                cartBtn.textContent = "Out of Stock";
            }

            // Call recommendations logic
            fetchRecommendations(med.name);
            
            document.getElementById("product-detail-modal").classList.add("active");
        })
        .catch(err => console.error("Error fetching medicine detail:", err));
};

// Query generic alternatives & drug interactions from Python Client
function fetchRecommendations(medicineName) {
    const smartBox = document.getElementById("modal-smart-box");
    smartBox.style.display = "block";
    smartBox.innerHTML = `<div style="text-align: center; padding: 10px;">Loading smart recommendations...</div>`;

    const requestBody = {
        medicines: [medicineName]
    };

    fetch(`${API_BASE}/api/prescription/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(data => {
        smartBox.innerHTML = "";
        
        const recommendations = data.recommendations || [];
        if (recommendations.length > 0 && recommendations[0].hasGeneric) {
            const rec = recommendations[0];
            smartBox.innerHTML = `
                <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary)"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    Generic Savings Recommendation Available
                </h4>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">${rec.recommendationText}</p>
                <div class="price-compare">
                    <div class="price-box brand">
                        <span>Brand Name (${rec.brandName})</span>
                        <strong>₹${rec.brandPrice.toFixed(2)}</strong>
                    </div>
                    <div class="price-box generic">
                        <span>Generic (${rec.genericName})</span>
                        <strong>₹${rec.genericPrice.toFixed(2)}</strong>
                    </div>
                    <div class="saving-badge">Save ${rec.savingPercent}</div>
                </div>
                <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 10px;" onclick="switchMedicineToGeneric(${rec.brandPrice}, ${rec.genericPrice}, '${rec.genericName}')">
                    Add Generic Instead & Save
                </button>
            `;
        } else {
            smartBox.innerHTML = `
                <h4>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary)"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    Generic Pricing Activated
                </h4>
                <p style="font-size: 13px; color: var(--text-muted);">${recommendations.length > 0 ? recommendations[0].recommendationText : 'This medicine is already generic or cost-effective.'}</p>
            `;
        }
    })
    .catch(err => {
        console.error("Error loading recommendations:", err);
        smartBox.style.display = "none";
    });
}

// Substitute brand for generic inside modal
window.switchMedicineToGeneric = function(brandPrice, genericPrice, genericName) {
    if (selectedMedicine) {
        selectedMedicine.name = genericName;
        selectedMedicine.price = genericPrice;
        
        // Re-update display inside modal
        document.getElementById("modal-title").textContent = genericName + " (Generic)";
        document.getElementById("modal-add-to-cart").textContent = "Add Generic to Cart";
        
        // Hide the smart box
        document.getElementById("modal-smart-box").style.display = "none";
    }
};

// Cart drawer functions
function toggleCartDrawer() {
    document.getElementById("cart-drawer").classList.toggle("active");
}

window.addToCart = function(id, name, price) {
    const existing = cart.find(item => item.medicineId === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            medicineId: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    showToast(`Added ${name} to cart.`);
};

window.updateQty = function(id, qtyChange) {
    const item = cart.find(item => item.medicineId === id);
    if (item) {
        item.quantity += qtyChange;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.medicineId !== id);
        }
        saveCartToStorage();
    }
};

function updateCartUI() {
    const badge = document.getElementById("cart-badge-count");
    const list = document.getElementById("cart-items-list");
    const subtotalEl = document.getElementById("cart-subtotal");
    const drawerCheckoutBtn = document.getElementById("drawer-checkout-btn");
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
    
    list.innerHTML = "";
    let subtotal = 0;
    
    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align: center; padding: 40px 0; color: var(--text-muted);">Your shopping cart is empty.</div>`;
        subtotalEl.textContent = "₹0.00";
        drawerCheckoutBtn.setAttribute("disabled", "true");
        // Clear safety alerts
        document.getElementById("cart-safety-alerts").innerHTML = "";
        return;
    }

    drawerCheckoutBtn.removeAttribute("disabled");
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div class="cart-item-details">
                <h5>${item.name}</h5>
                <span>₹${item.price.toFixed(2)} x ${item.quantity}</span>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateQty(${item.medicineId}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQty(${item.medicineId}, 1)">+</button>
            </div>
        `;
        list.appendChild(row);
    });
    
    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;

    // Verify drug-drug safety interaction alerts for the current cart contents
    verifyCartSafety();
}

// Perform cart safety checks
function verifyCartSafety() {
    const medNames = cart.map(item => item.name);
    const alertBox = document.getElementById("cart-safety-alerts");
    alertBox.innerHTML = "";

    if (medNames.length < 2) return;

    fetch(`${API_BASE}/api/prescription/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: medNames })
    })
    .then(res => res.json())
    .then(data => {
        const interactions = data.interactions || [];
        if (interactions.length > 0) {
            interactions.forEach(inter => {
                const el = document.createElement("div");
                el.className = "interaction-alert";
                el.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <div>
                        <strong>Safety Warning (${inter.severity}):</strong> ${inter.drugA} & ${inter.drugB} interaction detected. ${inter.description}
                    </div>
                `;
                alertBox.appendChild(el);
            });
        }
    })
    .catch(err => console.error("Error checking cart safety:", err));
}

// Go to Checkout Wizard
window.goToCheckout = function() {
    toggleCartDrawer();
    if (!currentUser) {
        showSection('auth');
        return;
    }
    
    showSection('checkout');
    setupCheckoutSummary();
};

function setupCheckoutSummary() {
    const list = document.getElementById("checkout-summary-list");
    const totalEl = document.getElementById("checkout-total-val");
    
    list.innerHTML = "";
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        const li = document.createElement("div");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.marginBottom = "10px";
        li.style.fontSize = "14px";
        li.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        list.appendChild(li);
    });
    
    totalEl.textContent = `₹${total.toFixed(2)}`;
}

// Prescription upload & simulated OCR process
function handlePrescriptionUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const ocrStatus = document.getElementById("ocr-status-text");
    const ocrPanel = document.getElementById("ocr-result-panel");
    
    ocrStatus.textContent = "Analyzing prescription image (Running Python OCR Parser)...";
    ocrPanel.style.display = "block";
    ocrPanel.innerHTML = `<div style="text-align: center; padding: 20px;">Uploading and reading text...</div>`;

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE}/api/prescription/analyze`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        ocrStatus.textContent = "Analysis Complete!";
        
        ocrPanel.innerHTML = `
            <h4 style="color: var(--primary); margin-bottom: 8px;">Prescription Metadata Found</h4>
            <div style="font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                <div><strong>Patient:</strong> ${data.patientName}</div>
                <div><strong>Date:</strong> ${data.date}</div>
                <div><strong>Doctor:</strong> ${data.doctorName}</div>
                <div><strong>Hospital:</strong> ${data.hospitalName}</div>
                <div><strong>OCR Confidence:</strong> ${(data.confidence * 100).toFixed(0)}%</div>
            </div>
            <h5 style="margin-bottom: 6px; font-size: 14px;">Extracted Medicines:</h5>
            <ul id="ocr-medicines-list" style="list-style-type: none; margin-bottom: 16px;">
                ${data.medicines.map(m => `
                    <li style="font-size: 13px; margin-bottom: 6px; padding: 6px; background: rgba(0,0,0,0.03); border-radius: 4px;">
                        <strong>${m.name} ${m.dosage}</strong> - ${m.frequency} (${m.duration})
                    </li>
                `).join('')}
            </ul>
            <button class="btn btn-primary btn-sm" style="width: 100%;" onclick='autofillCartFromOCR(${JSON.stringify(data.medicines)})'>
                Autofill Cart with Prescribed Medicines
            </button>
        `;
    })
    .catch(err => {
        console.error("Prescription upload error:", err);
        ocrStatus.textContent = "OCR Analysis failed.";
        ocrPanel.style.display = "none";
    });
}

// Autofill cart with items returned from prescription analysis
window.autofillCartFromOCR = function(medicinesList) {
    if (!medicinesList || medicinesList.length === 0) return;
    
    // Fetch all catalog items first to match medicineIds
    fetch(`${API_BASE}/api/medicines`)
        .then(res => res.json())
        .then(catalog => {
            medicinesList.forEach(m => {
                // Find matching catalog item
                const found = catalog.find(item => item.name.toLowerCase().includes(m.name.toLowerCase()) || item.genericName.toLowerCase().includes(m.name.toLowerCase()));
                if (found) {
                    addToCart(found.id, found.name, found.price);
                } else {
                    // Create simulated id for custom medication
                    const mockId = Math.floor(Math.random() * 1000) + 1000;
                    addToCart(mockId, m.name, 150.00); // 150 INR flat
                }
            });
            
            setupCheckoutSummary();
            showToast("Cart auto-filled with prescribed items.");
        })
        .catch(err => console.error("Error matching items for autofill:", err));
};

// Place order
function handlePlaceOrder(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showToast("Your cart is empty.", "error");
        return;
    }

    const address = document.getElementById("checkout-address").value;
    const email = currentUser.email;
    const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    const orderItems = cart.map(item => ({
        medicineId: item.medicineId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

    // Detect customer location coordinates (real or simulated fallback)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            sendOrderWithLocation(position.coords.latitude, position.coords.longitude);
        }, error => {
            console.warn("Customer geolocation failed or denied. Using simulated location.");
            let simLat = 12.9716 + (Math.random() - 0.5) * 0.08;
            let simLon = 77.5946 + (Math.random() - 0.5) * 0.08;
            sendOrderWithLocation(simLat, simLon);
        });
    } else {
        let simLat = 12.9716 + (Math.random() - 0.5) * 0.08;
        let simLon = 77.5946 + (Math.random() - 0.5) * 0.08;
        sendOrderWithLocation(simLat, simLon);
    }

    function sendOrderWithLocation(lat, lon) {
        const orderData = {
            userEmail: email,
            items: orderItems,
            totalAmount: totalAmount,
            address: address,
            prescriptionUrl: "prescription_doc_sim.jpg",
            latitude: lat,
            longitude: lon
        };

        fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(res => res.json())
        .then(order => {
            cart = [];
            saveCartToStorage();
            startRealtimeTracking(order);
        })
        .catch(err => {
            console.error("Place order failed:", err);
            showToast("Checkout failed. Please try again.", "error");
        });
    }
}

// Real-time tracking initiation (Firebase Auth + Realtime database integration)
function startRealtimeTracking(order) {
    activeOrder = order;
    
    const trackingRef = window.firebaseDB.ref(`orders/${order.id}`);
    
    trackingRef.set({
        id: order.id,
        userEmail: order.userEmail,
        status: "CREATED",
        address: order.address,
        totalAmount: order.totalAmount,
        latitude: order.latitude,
        longitude: order.longitude,
        courierEmail: "",
        lastUpdated: Date.now()
    }).then(() => {
        subscribeToOrderTracking(order.id);
        document.getElementById("order-tracking-modal").classList.add("active");
    });
}

// Listen to order progress in real-time
function subscribeToOrderTracking(orderId) {
    const trackingRef = window.firebaseDB.ref(`orders/${orderId}`);
    
    trackingRef.on("value", snapshot => {
        const order = snapshot.val();
        if (!order) return;
        
        updateTrackingUI(order);
    });
}

// Fallback courier automation simulation (progresses status node every 10 seconds)
function simulateCourierStatusUpdates(orderId) {
    const statuses = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"];
    let currentIdx = 0;
    
    const interval = setInterval(() => {
        currentIdx++;
        if (currentIdx >= statuses.length) {
            clearInterval(interval);
        } else {
            const nextStatus = statuses[currentIdx];
            window.firebaseDB.ref(`orders/${orderId}`).update({
                status: nextStatus,
                courierEmail: "simulated_courier@mediswift.com",
                lastUpdated: Date.now()
            });
            // Sync with Java
            fetch(`${API_BASE}/api/orders/${orderId}/status?status=${nextStatus}`, {
                method: 'PUT'
            }).catch(err => console.error("Java status sync failed:", err));
        }
    }, 10000);
}

// Update tracking UI progress visual indicators
function updateTrackingUI(order) {
    document.getElementById("tracking-order-id").textContent = order.id;
    
    const statuses = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"];
    const statusIdx = statuses.indexOf(order.status);
    
    // Update timeline nodes
    document.querySelectorAll(".status-node").forEach((node, idx) => {
        node.classList.remove("active", "completed");
        if (idx < statusIdx) {
            node.classList.add("completed");
        } else if (idx === statusIdx) {
            node.classList.add("active");
        }
    });
    
    // Progress fill percentage
    const fillPercent = statusIdx === 0 ? 5 : (statusIdx / (statuses.length - 1)) * 90 + 5;
    document.getElementById("tracking-fill").style.width = `${fillPercent}%`;

    // Trigger driver map animation phase
    animateDriverJourney(order.status);
}

// Fetch user orders history
function fetchOrderHistory() {
    if (!currentUser) return;
    
    const list = document.getElementById("order-history-list");
    list.innerHTML = `<div style="text-align: center; padding: 20px;">Fetching order history...</div>`;

    fetch(`${API_BASE}/api/orders/user/${currentUser.email}`)
        .then(res => res.json())
        .then(orders => {
            list.innerHTML = "";
            if (orders.length === 0) {
                list.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">You have not placed any orders yet.</div>`;
                return;
            }

            orders.forEach(order => {
                const card = document.createElement("div");
                card.className = "order-history-card glass animate-fade-in";
                card.style.padding = "20px";
                card.style.marginBottom = "16px";
                card.style.borderRadius = "var(--radius-md)";
                
                const itemsText = order.items.map(i => `${i.name} (x${i.quantity})`).join(", ");
                const dateStr = new Date(order.orderDate).toLocaleDateString();
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong>Order #${order.id}</strong>
                        <span class="detail-category" style="margin-top:0; font-size:12px;">${order.status}</span>
                    </div>
                    <div style="font-size: 13px; color:var(--text-muted); margin-bottom:12px;">
                        <div>Date: ${dateStr}</div>
                        <div>Deliver to: ${order.address}</div>
                        <div style="margin-top:6px; color:var(--text-main);">Items: ${itemsText}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(0,0,0,0.05); padding-top:10px;">
                        <span style="font-weight:700; color:var(--primary);">₹${order.totalAmount.toFixed(2)}</span>
                        ${order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? `
                            <button class="btn btn-primary btn-sm" onclick="trackExistingOrder(${order.id})">Track Status</button>
                        ` : ''}
                    </div>
                `;
                list.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error loading order history:", err);
            list.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--danger);">Failed to load order history.</div>`;
        });
}

window.trackExistingOrder = function(orderId) {
    subscribeToOrderTracking(orderId);
    document.getElementById("order-tracking-modal").classList.add("active");
};

// ==========================================
// DELIVERY PARTNER MODULE (NEW)
// ==========================================

let courierLatitude = 12.9716;
let courierLongitude = 77.5946;
let courierSearchRadius = 10; // default 10 km

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function loadCourierDashboard() {
    if (!currentUser || currentUser.role !== "courier") return;

    // Detect courier geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            courierLatitude = position.coords.latitude;
            courierLongitude = position.coords.longitude;
            const textEl = document.getElementById("courier-location-text");
            if (textEl) textEl.textContent = `${courierLatitude.toFixed(4)}, ${courierLongitude.toFixed(4)}`;
        }, error => {
            console.warn("Courier geolocation blocked or failed. Using simulated coordinates.");
            const textEl = document.getElementById("courier-location-text");
            if (textEl) textEl.textContent = `${courierLatitude.toFixed(4)}, ${courierLongitude.toFixed(4)} (Simulated)`;
        });
    }

    // Radius Slider Listener
    const slider = document.getElementById("courier-radius-slider");
    const valText = document.getElementById("courier-radius-val");
    if (slider && !slider.dataset.listener) {
        slider.dataset.listener = "true";
        slider.addEventListener("input", (e) => {
            courierSearchRadius = parseInt(e.target.value);
            if (valText) valText.textContent = courierSearchRadius;
            renderCourierDashboardData();
        });
    }

    renderCourierDashboardData();
}

function renderCourierDashboardData() {
    const availableList = document.getElementById("courier-available-orders");
    const activeSection = document.getElementById("courier-active-assignment");

    if (!availableList || !activeSection) return;

    // Fetch all orders from Firebase Realtime Database
    const ordersRef = window.firebaseDB.ref("orders");
    
    ordersRef.off("value"); // Unsubscribe previous listeners to avoid duplicates
    ordersRef.on("value", snapshot => {
        const allOrders = snapshot.val() || {};
        
        const availableOrders = [];
        let activeAssignment = null;

        Object.keys(allOrders).forEach(key => {
            const order = allOrders[key];
            
            // Calculate distance in real-time
            const distance = calculateDistance(courierLatitude, courierLongitude, order.latitude, order.longitude);
            order.distance = distance;

            if (order.courierEmail === currentUser.email && order.status !== "DELIVERED") {
                activeAssignment = order;
            } else if ((order.status === "CREATED" || order.status === "PROCESSING") && !order.courierEmail) {
                // Filter by radius
                if (distance <= courierSearchRadius) {
                    availableOrders.push(order);
                }
            }
        });

        // Render Available nearby orders
        availableList.innerHTML = "";
        if (availableOrders.length === 0) {
            availableList.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:10px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <div>No available deliveries within ${courierSearchRadius} km search radius.</div>
                </div>`;
        } else {
            availableOrders.forEach(order => {
                const card = document.createElement("div");
                card.className = "courier-order-card animate-fade-in";
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong>Order #${order.id}</strong>
                        <span class="courier-payout">₹${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
                        <div style="margin-bottom: 4px;"><strong>Address:</strong> ${order.address}</div>
                        <div style="margin-bottom: 4px;"><strong>Customer:</strong> ${order.userEmail}</div>
                        <div style="color: var(--primary); font-weight: 600;">Distance: ${order.distance.toFixed(1)} km away</div>
                    </div>
                    <button class="btn btn-primary btn-sm" style="width:100%;" onclick="courierAcceptOrder(${order.id})">
                        Accept & Navigate
                    </button>
                `;
                availableList.appendChild(card);
            });
        }

        // Render Active accepted assignment
        activeSection.innerHTML = "";
        if (activeAssignment) {
            activeSection.innerHTML = `
                <div class="active-task-box" style="padding: 10px 0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <strong style="font-size:16px;">Active Order #${activeAssignment.id}</strong>
                        <span class="detail-category" style="margin-top:0;">${activeAssignment.status}</span>
                    </div>
                    
                    <div style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
                        <div style="margin-bottom:6px;"><strong>Deliver To:</strong> ${activeAssignment.address}</div>
                        <div style="margin-bottom:6px;"><strong>Customer:</strong> ${activeAssignment.userEmail}</div>
                        <div style="margin-bottom:6px;"><strong>Distance:</strong> ${activeAssignment.distance.toFixed(1)} km</div>
                        <div><strong>Total Value:</strong> ₹${activeAssignment.totalAmount.toFixed(2)}</div>
                    </div>

                    <!-- Payout card -->
                    <div style="background:var(--primary-glow); border:1px solid rgba(16,185,129,0.15); padding:12px; border-radius:var(--radius-sm); margin-bottom:20px; text-align:center;">
                        <span style="font-size:12px; color:var(--text-muted); display:block;">ESTIMATED COURIER PAYOUT</span>
                        <strong style="font-size:20px; color:var(--primary);">₹${(activeAssignment.totalAmount * 0.15 + 40).toFixed(2)}</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${activeAssignment.status === 'CREATED' || activeAssignment.status === 'PROCESSING' ? `
                            <button class="btn btn-primary" onclick="courierUpdateStatus(${activeAssignment.id}, 'SHIPPED')">
                                Mark Picked Up (Out for Delivery)
                            </button>
                        ` : ''}
                        
                        ${activeAssignment.status === 'SHIPPED' ? `
                            <button class="btn btn-primary" onclick="courierUpdateStatus(${activeAssignment.id}, 'DELIVERED')">
                                Confirm Delivered
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            activeSection.innerHTML = `<div style="text-align: center; padding: 40px 0; color: var(--text-muted);">No active delivery assigned. Accept an order from the list on the left to start!</div>`;
        }
    });
}

window.courierAcceptOrder = function(orderId) {
    if (!currentUser) return;
    
    // Update Firebase order status and assign courier
    window.firebaseDB.ref(`orders/${orderId}`).update({
        courierEmail: currentUser.email,
        status: "PROCESSING",
        lastUpdated: Date.now()
    }).then(() => {
        // Sync with Java API database
        fetch(`${API_BASE}/api/orders/${orderId}/status?status=PROCESSING`, {
            method: 'PUT'
        })
        .then(() => {
            showToast("Delivery accepted successfully!");
        })
        .catch(err => console.error("Java status sync failed:", err));
    });
};

window.courierUpdateStatus = function(orderId, status) {
    window.firebaseDB.ref(`orders/${orderId}`).update({
        status: status,
        lastUpdated: Date.now()
    }).then(() => {
        fetch(`${API_BASE}/api/orders/${orderId}/status?status=${status}`, {
            method: 'PUT'
        })
        .then(() => {
            showToast(`Order status updated to ${status}.`);
        })
        .catch(err => console.error("Java status sync failed:", err));
    });
};

// ==========================================
// Canvas Map tracking animation variables
// ==========================================
let mapCtx = null;
let driverX = 50;
let driverY = 120;
let destinationX = 450;
let destinationY = 120;
let currentStatus = "CREATED";
let mapAnimationId = null;

function setupMapCanvas() {
    const canvas = document.getElementById("tracking-map-canvas");
    if (canvas) {
        mapCtx = canvas.getContext("2d");
        canvas.width = 500;
        canvas.height = 250;
    }
}

function animateDriverJourney(status) {
    if (!mapCtx) return;
    currentStatus = status;
    
    // Stop any existing animation loop
    if (mapAnimationId) {
        cancelAnimationFrame(mapAnimationId);
    }
    
    driverX = 50;
    driverY = 125;
    destinationX = 450;
    destinationY = 125;
    
    let progress = 0; // 0 to 1
    
    function drawLoop() {
        if (!mapCtx) return;
        
        // Clear canvas (Light Gray road grid theme)
        mapCtx.fillStyle = "#f8fafc";
        mapCtx.fillRect(0, 0, 500, 250);
        
        // Draw grid lines
        mapCtx.strokeStyle = "rgba(0, 0, 0, 0.02)";
        mapCtx.lineWidth = 1;
        for (let x = 0; x < 500; x += 25) {
            mapCtx.beginPath();
            mapCtx.moveTo(x, 0);
            mapCtx.lineTo(x, 250);
            mapCtx.stroke();
        }
        for (let y = 0; y < 250; y += 25) {
            mapCtx.beginPath();
            mapCtx.moveTo(0, y);
            mapCtx.lineTo(500, y);
            mapCtx.stroke();
        }

        // Draw delivery route path
        mapCtx.strokeStyle = "rgba(16, 185, 129, 0.15)";
        mapCtx.lineWidth = 4;
        mapCtx.setLineDash([5, 5]);
        mapCtx.beginPath();
        mapCtx.moveTo(50, 125);
        mapCtx.lineTo(200, 125);
        mapCtx.lineTo(200, 60);
        mapCtx.lineTo(350, 60);
        mapCtx.lineTo(350, 180);
        mapCtx.lineTo(450, 180);
        mapCtx.lineTo(450, 125);
        mapCtx.stroke();
        mapCtx.setLineDash([]); // Reset dash

        // Draw Nodes: Pharmacy
        mapCtx.fillStyle = "#fff";
        mapCtx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        mapCtx.lineWidth = 3;
        mapCtx.beginPath();
        mapCtx.arc(50, 125, 20, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.stroke();
        
        mapCtx.fillStyle = "#10b981";
        mapCtx.font = "bold 10px Inter";
        mapCtx.fillText("PHARMACY", 22, 90);
        
        // Draw cross inside pharmacy node
        mapCtx.fillStyle = "#10b981";
        mapCtx.fillRect(47, 117, 6, 16);
        mapCtx.fillRect(42, 122, 16, 6);

        // Draw Nodes: Home
        mapCtx.fillStyle = "#fff";
        mapCtx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        mapCtx.beginPath();
        mapCtx.arc(450, 125, 20, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.stroke();
        
        mapCtx.fillStyle = "#0284c7";
        mapCtx.font = "bold 10px Inter";
        mapCtx.fillText("DELIVERY HOME", 410, 90);

        // Draw simple home shape
        mapCtx.fillStyle = "#0284c7";
        mapCtx.beginPath();
        mapCtx.moveTo(450, 115);
        mapCtx.lineTo(438, 127);
        mapCtx.lineTo(442, 127);
        mapCtx.lineTo(442, 135);
        mapCtx.lineTo(458, 135);
        mapCtx.lineTo(458, 127);
        mapCtx.lineTo(462, 127);
        mapCtx.closePath();
        mapCtx.fill();

        // Calculate driver position based on status
        if (currentStatus === "CREATED" || currentStatus === "PROCESSING") {
            driverX = 50;
            driverY = 125;
        } else if (currentStatus === "DELIVERED") {
            driverX = 450;
            driverY = 125;
        } else if (currentStatus === "SHIPPED") {
            progress += 0.002;
            if (progress > 1) progress = 0;
            
            const segment1 = 0.2;  
            const segment2 = 0.35; 
            const segment3 = 0.55; 
            const segment4 = 0.8;  
            const segment5 = 0.95; 
            
            if (progress <= segment1) {
                const ratio = progress / segment1;
                driverX = 50 + (200 - 50) * ratio;
                driverY = 125;
            } else if (progress <= segment2) {
                const ratio = (progress - segment1) / (segment2 - segment1);
                driverX = 200;
                driverY = 125 + (60 - 125) * ratio;
            } else if (progress <= segment3) {
                const ratio = (progress - segment2) / (segment3 - segment2);
                driverX = 200 + (350 - 200) * ratio;
                driverY = 60;
            } else if (progress <= segment4) {
                const ratio = (progress - segment3) / (segment4 - segment3);
                driverX = 350;
                driverY = 60 + (180 - 60) * ratio;
            } else if (progress <= segment5) {
                const ratio = (progress - segment4) / (segment5 - segment4);
                driverX = 350 + (450 - 350) * ratio;
                driverY = 180;
            } else {
                const ratio = (progress - segment5) / (1 - segment5);
                driverX = 450;
                driverY = 180 + (125 - 180) * ratio;
            }
        }

        // Draw Courier Driver dot
        mapCtx.fillStyle = "#10b981";
        mapCtx.shadowColor = "rgba(16, 185, 129, 0.4)";
        mapCtx.shadowBlur = 8;
        mapCtx.beginPath();
        mapCtx.arc(driverX, driverY, 8, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.shadowBlur = 0; // Reset blur

        // Draw driver pulse effect
        mapCtx.strokeStyle = "rgba(16, 185, 129, 0.3)";
        mapCtx.lineWidth = 2;
        mapCtx.beginPath();
        const pulseRad = 8 + (Date.now() % 1000) / 70;
        mapCtx.arc(driverX, driverY, pulseRad, 0, Math.PI * 2);
        mapCtx.stroke();

        mapAnimationId = requestAnimationFrame(drawLoop);
    }
    
    drawLoop();
}

// Display visual notifications (Toast)
function showToast(message, type = "success") {
    let toast = document.getElementById("toast-msg");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-msg";
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.padding = "12px 24px";
        toast.style.borderRadius = "var(--radius-sm)";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "600";
        toast.style.zIndex = "2000";
        toast.style.transition = "opacity 0.3s ease";
        document.body.appendChild(toast);
    }

    if (type === "success") {
        toast.style.backgroundColor = "var(--primary)";
        toast.style.color = "#fff";
    } else {
        toast.style.backgroundColor = "var(--danger)";
        toast.style.color = "#fff";
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 3000);
}
