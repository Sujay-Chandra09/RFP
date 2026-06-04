# MediSwift – Medicine Delivery Platform

MediSwift is a full-stack, premium medicine delivery platform featuring a medicine ordering system, user authentication, a shopping cart, real-time order tracking, Firebase database integration, and a Python-powered smart assistant for prescription OCR analysis and drug-drug safety interaction checking.

## Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla CSS3 (custom CSS variables, glassmorphism, keyframe animations), JavaScript (ES6+), Firebase Web SDK (with auto-simulation fallback mode).
- **Backend (Java)**: Spring Boot 3.x, Spring Data JPA, H2 Database (in-memory, SQL tracking), Java REST APIs.
- **Intelligence Service (Python)**: FastAPI, Pydantic, Uvicorn, Python OCR simulation parser, drug equivalence recommendation engine.
- **Real-time Database**: Firebase Auth & Firebase Realtime Database.

---

## Folder Structure

```text
rfp/
├── backend-java/               # Spring Boot Application (serves static frontend assets)
│   ├── src/main/java/          # Java API classes (models, controllers, services)
│   └── src/main/resources/     # Properties & static UI files (index.html, styles, scripts)
├── backend-python/             # FastAPI Recommendation & OCR Analysis engine
│   ├── app.py                  # API endpoints and logic
│   └── requirements.txt        # Python requirements
└── README.md                   # Start-up & developer guide
```

---

## Installation & Getting Started

Follow these steps to run the application locally.

### 1. Start the Python Service

The Python intelligence service handles the drug-drug interaction alerts and prescription file parsing (OCR).

1. Navigate to the `backend-python/` directory:
   ```bash
   cd backend-python
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python app.py
   ```
   *The Python service will start running on **`http://localhost:8000`**.*

### 2. Start the Java Backend & Serve Frontend

The Java service coordinates requests, manages order storage in H2, and serves the static frontend UI.

1. Navigate to the `backend-java/` directory:
   ```bash
   cd ../backend-java
   ```
2. Build and run the Spring Boot project using the Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The Java backend and the frontend client will start running on **`http://localhost:8080`**.*

---

## How to Test the Application

1. Open your web browser and navigate to: **`http://localhost:8080/index.html`** or **`http://localhost:8080`**.
2. **Sign In / Register**: 
   - Click "Sign In" in the navigation bar.
   - You can enter any email and password. Since Firebase runs in simulation mode by default, it will register you in local storage instantly!
3. **Browse Medicines**:
   - Filter by categories (e.g., *Cardiology*, *Antibiotics*, *Pain Relievers*) or search for terms like "Lipitor", "Advil", or "Amoxicillin".
4. **Smart Generic Suggestions**:
   - Click on "Details" for a brand-name medicine (e.g., *Lipitor* or *Advil*).
   - In the details modal, the **Smart Assistant Suggestions** (connected to the Python backend) will show the cost comparison of switching to the generic equivalent (*Atorvastatin* / *Ibuprofen*), and let you swap with one click to save up to 75%!
5. **Drug-Drug Safety Interaction Checking**:
   - Add both **Advil** (Ibuprofen) and **Aspirin** to your cart.
   - Open the shopping cart drawer. A safety warning panel will appear, warning you of the interaction (GI bleeding risk).
6. **Prescription OCR Parsing**:
   - Proceed to checkout.
   - Under the Prescription Upload box, click to upload any image file.
   - The system sends the photo to the Python OCR simulation service, parses the names, and lists the prescribed items with an "Autofill Cart" button that populates your cart immediately!
7. **Real-time Order Tracking**:
   - Enter a shipping address and place the order.
   - A tracking dashboard modal opens with a live timeline (Created -> Preparing -> Out for Delivery -> Delivered).
   - **Interactive Live Map**: A canvas element will render an abstract grid and animate a delivery courier traveling along streets in real-time until they reach the destination house.

---

## Configuring Real Firebase (Optional)

To switch from the simulated Firebase fallback to a live Firebase instance:
1. Open the file [firebase-config.js](file:///Users/sujaychandrareddy/rfp/backend-java/src/main/resources/static/js/firebase-config.js).
2. Insert your standard Firebase API credentials into the `firebaseConfig` object at the top of the file.
3. Save the file. The client will automatically detect the presence of keys and switch to the live Firebase Auth and Realtime Database services.
