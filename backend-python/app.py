import os
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="MediSwift Python Intelligence Service", version="1.0.0")

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock databases for prescription OCR and recommendations
GENERIC_ALTERNATIVES = {
    "lipitor": {"generic": "Atorvastatin", "brand": "Lipitor", "saving": "75%", "brandPrice": 450.0, "genericPrice": 112.50},
    "tylenol": {"generic": "Acetaminophen", "brand": "Tylenol", "saving": "60%", "brandPrice": 120.0, "genericPrice": 48.00},
    "advil": {"generic": "Ibuprofen", "brand": "Advil", "saving": "50%", "brandPrice": 100.0, "genericPrice": 50.00},
    "nexium": {"generic": "Esomeprazole", "brand": "Nexium", "saving": "70%", "brandPrice": 380.0, "genericPrice": 114.00},
    "ventolin": {"generic": "Albuterol", "brand": "Ventolin", "saving": "65%", "brandPrice": 250.0, "genericPrice": 87.50},
    "zoloft": {"generic": "Sertraline", "brand": "Zoloft", "saving": "80%", "brandPrice": 550.0, "genericPrice": 110.00},
    "glucophage": {"generic": "Metformin", "brand": "Glucophage", "saving": "55%", "brandPrice": 200.0, "genericPrice": 90.00},
    "synthroid": {"generic": "Levothyroxine", "brand": "Synthroid", "saving": "40%", "brandPrice": 180.0, "genericPrice": 108.00},
}

DRUG_INTERACTIONS = [
    {
        "drugs": {"ibuprofen", "aspirin"},
        "severity": "Moderate",
        "description": "Concomitant use may decrease Aspirin cardioprotection and increase gastrointestinal bleeding risk."
    },
    {
        "drugs": {"ibuprofen", "warfarin"},
        "severity": "Severe",
        "description": "Significant risk of bleeding. Concomitant use increases bleeding risk. Monitor coagulation parameters closely."
    },
    {
        "drugs": {"sildenafil", "nitroglycerin"},
        "severity": "Critical",
        "description": "Coadministration can cause severe, potentially fatal hypotension (drop in blood pressure). Absolute contraindication."
    },
    {
        "drugs": {"lisinopril", "spironolactone"},
        "severity": "Moderate",
        "description": "Increased risk of hyperkalemia (high potassium levels). Regular monitoring of serum potassium is advised."
    },
    {
        "drugs": {"amoxicillin", "methotrexate"},
        "severity": "Moderate",
        "description": "Amoxicillin may decrease renal clearance of Methotrexate, leading to toxicity. Monitor closely."
    },
    {
        "drugs": {"alprazolam", "alcohol"},
        "severity": "Severe",
        "description": "Alprazolam combined with alcohol leads to severe central nervous system depression, drowsiness, and respiratory risks."
    }
]

class MedicineAnalysis(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class PrescriptionResponse(BaseModel):
    patientName: str
    date: str
    medicines: List[MedicineAnalysis]
    doctorName: str
    hospitalName: str
    confidence: float

class RecommendationRequest(BaseModel):
    medicines: List[str]

class GenericRecommendation(BaseModel):
    queriedName: str
    hasGeneric: bool
    brandName: Optional[str] = None
    genericName: str
    brandPrice: Optional[float] = None
    genericPrice: float
    savingPercent: Optional[str] = None
    recommendationText: str

class DrugInteraction(BaseModel):
    drugA: str
    drugB: str
    severity: str
    description: str

class RecommendationResponse(BaseModel):
    recommendations: List[GenericRecommendation]
    interactions: List[DrugInteraction]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MediSwift Python Intelligence Service"}

@app.post("/analyze-prescription", response_model=PrescriptionResponse)
async def analyze_prescription(file: UploadFile = File(...)):
    filename = file.filename.lower()
    
    # Simple simulated OCR logic parsing files based on filenames
    patient_name = "Jane Doe"
    doctor_name = "Dr. Sarah Jenkins"
    hospital_name = "City General Care Hospital"
    confidence = 0.98
    
    medicines_list = []
    
    if "asthma" in filename or "ventolin" in filename or "albuterol" in filename:
        medicines_list = [
            MedicineAnalysis(name="Ventolin", dosage="100mcg", frequency="2 puffs every 4-6 hours as needed", duration="30 days"),
            MedicineAnalysis(name="Montelukast", dosage="10mg", frequency="Once daily in the evening", duration="30 days")
        ]
        patient_name = "Alex Carter"
    elif "infection" in filename or "amoxicillin" in filename or "antibiotic" in filename:
        medicines_list = [
            MedicineAnalysis(name="Amoxicillin", dosage="500mg", frequency="One capsule three times daily", duration="7 days")
        ]
        patient_name = "Michael Vance"
        doctor_name = "Dr. Robert Chen"
    elif "pain" in filename or "advil" in filename or "ibuprofen" in filename:
        medicines_list = [
            MedicineAnalysis(name="Advil", dosage="400mg", frequency="One tablet every 6 hours as needed with food", duration="5 days"),
            MedicineAnalysis(name="Tylenol", dosage="500mg", frequency="One tablet every 8 hours as needed", duration="3 days")
        ]
        patient_name = "Sarah Miller"
    elif "diabetes" in filename or "metformin" in filename or "glucophage" in filename:
        medicines_list = [
            MedicineAnalysis(name="Glucophage", dosage="500mg", frequency="One tablet twice daily with meals", duration="60 days")
        ]
        patient_name = "David Harrison"
        doctor_name = "Dr. Elena Rostova"
    elif "heart" in filename or "cholesterol" in filename or "lipitor" in filename:
        medicines_list = [
            MedicineAnalysis(name="Lipitor", dosage="20mg", frequency="Once daily at bedtime", duration="90 days"),
            MedicineAnalysis(name="Lisinopril", dosage="10mg", frequency="Once daily in the morning", duration="90 days")
        ]
        patient_name = "Robert Thompson"
        doctor_name = "Dr. James Vance"
    else:
        # Default fallback prescription
        medicines_list = [
            MedicineAnalysis(name="Amoxicillin", dosage="500mg", frequency="Three times daily", duration="7 days"),
            MedicineAnalysis(name="Advil", dosage="400mg", frequency="Every 6 hours as needed", duration="5 days")
        ]
        confidence = 0.92

    return PrescriptionResponse(
        patientName=patient_name,
        date="2026-06-03",
        medicines=medicines_list,
        doctorName=doctor_name,
        hospitalName=hospital_name,
        confidence=confidence
    )

@app.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    queried_medicines = request.medicines
    recommendations = []
    interactions = []
    
    # Process each medicine for generic equivalents
    for med in queried_medicines:
        med_clean = med.strip().lower()
        
        # Check if we have information for this brand
        if med_clean in GENERIC_ALTERNATIVES:
            info = GENERIC_ALTERNATIVES[med_clean]
            recommendations.append(GenericRecommendation(
                queriedName=med,
                hasGeneric=True,
                brandName=info["brand"],
                genericName=info["generic"],
                brandPrice=info["brandPrice"],
                genericPrice=info["genericPrice"],
                savingPercent=info["saving"],
                recommendationText=f"Switch to Generic {info['generic']} to save {info['saving']} on your prescription."
            ))
        else:
            # Check if user already queried a generic name
            matching_brand = None
            for brand, data in GENERIC_ALTERNATIVES.items():
                if data["generic"].lower() == med_clean:
                    matching_brand = data
                    break
            
            if matching_brand:
                recommendations.append(GenericRecommendation(
                    queriedName=med,
                    hasGeneric=False,
                    brandName=matching_brand["brand"],
                    genericName=matching_brand["generic"],
                    brandPrice=matching_brand["brandPrice"],
                    genericPrice=matching_brand["genericPrice"],
                    savingPercent="0%",
                    recommendationText=f"You are already using the cost-effective generic version ({matching_brand['generic']})."
                ))
            else:
                # No generic substitution found, standard pricing
                recommendations.append(GenericRecommendation(
                    queriedName=med,
                    hasGeneric=False,
                    genericName=med,
                    genericPrice=150.00, # Default flat pricing for unknown items
                    recommendationText="No cheaper generic substitute found in our local database."
                ))
                
    # Check for drug-drug interactions
    norm_medicines = [m.strip().lower() for m in queried_medicines]
    
    # Map any brand name to its generic counterpart for uniform interaction checking
    resolved_meds = []
    for m in norm_medicines:
        if m in GENERIC_ALTERNATIVES:
            resolved_meds.append(GENERIC_ALTERNATIVES[m]["generic"].lower())
        else:
            resolved_meds.append(m)
            
    # Set of unique drugs in the request
    med_set = set(resolved_meds)
    
    for interaction in DRUG_INTERACTIONS:
        # Check if the interaction set of drugs is a subset of the queried/resolved set
        intersect = interaction["drugs"].intersection(med_set)
        if len(intersect) == 2:
            drugs_list = list(interaction["drugs"])
            # Format the output matching original user names
            interactions.append(DrugInteraction(
                drugA=drugs_list[0].capitalize(),
                drugB=drugs_list[1].capitalize(),
                severity=interaction["severity"],
                description=interaction["description"]
            ))
            
    return RecommendationResponse(
        recommendations=recommendations,
        interactions=interactions
    )

if __name__ == "__main__":
    import uvicorn
    # Read port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
