package com.mediswift.backend_java.config;

import com.mediswift.backend_java.model.Medicine;
import com.mediswift.backend_java.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MedicineRepository medicineRepository;

    @Override
    public void run(String... args) throws Exception {
        if (medicineRepository.count() == 0) {
            seedMedicines();
        }
    }

    private void seedMedicines() {
        // --- Cardiology ---
        Medicine m1 = new Medicine(null, "Lipitor", "Pfizer", "Atorvastatin", 450.0, "Cardiology", 100,
                "Lipitor (atorvastatin) belongs to a group of drugs called HMG-CoA reductase inhibitors, or 'statins'. It is used to lower cholesterol and triglycerides in the blood.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Joint pain, diarrhea, stuffy nose, sore throat. Severe side effects include muscle breakdowns (rhabdomyolysis).");

        Medicine m2 = new Medicine(null, "Lisinopril", "Aurobindo", "Lisinopril", 150.0, "Cardiology", 150,
                "Lisinopril is an ACE (angiotensin-converting enzyme) inhibitor. It is used to treat high blood pressure (hypertension) in adults and children.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Cough, dizziness, headache, tiredness. Do not take if pregnant.");

        // --- Antibiotics ---
        Medicine m3 = new Medicine(null, "Amoxicillin", "Sandoz", "Amoxicillin", 180.0, "Antibiotics", 120,
                "Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria.",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Nausea, vomiting, diarrhea, rash. Ensure you finish the entire prescribed course.");

        Medicine m4 = new Medicine(null, "Azithromycin", "Teva", "Azithromycin", 220.0, "Antibiotics", 80,
                "Azithromycin is a macrolide antibiotic used to treat various bacterial infections, including respiratory infections, skin infections, ear infections, and sexually transmitted diseases.",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Diarrhea, nausea, vomiting, abdominal pain, headache.");

        // --- Pain Relievers ---
        Medicine m5 = new Medicine(null, "Advil", "Advil", "Ibuprofen", 100.0, "Pain Relievers", 200,
                "Advil (ibuprofen) is a nonsteroidal anti-inflammatory drug (NSAID). It works by reducing hormones that cause pain and inflammation in the body.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Upset stomach, mild heartburn, nausea, vomiting, bloating. Avoid taking with other NSAIDs like Aspirin.");

        Medicine m6 = new Medicine(null, "Tylenol", "McNeil", "Acetaminophen", 120.0, "Pain Relievers", 250,
                "Tylenol (acetaminophen) is a pain reliever and a fever reducer. It is used to treat mild to moderate pain, including headache, muscle aches, and backache.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Generally safe, but excessive dosage can cause severe liver damage. Do not exceed 4000mg per day.");

        Medicine m7 = new Medicine(null, "Aspirin", "Bayer", "Aspirin", 80.0, "Pain Relievers", 300,
                "Aspirin is a salicylate that works by reducing substances in the body that cause pain, fever, and inflammation. It is also used as a blood thinner to prevent heart attacks.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Heartburn, stomach upset, easy bruising. Seek medical attention if stomach bleeding occurs.");

        // --- Diabetes ---
        Medicine m8 = new Medicine(null, "Glucophage", "Merck", "Metformin", 200.0, "Diabetes", 140,
                "Glucophage (metformin) is an oral diabetes medicine that helps control blood sugar levels. It is used for people with type 2 diabetes.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Nausea, upset stomach, diarrhea, metallic taste. Take with meals to minimize side effects.");

        // --- Gastrointestinal ---
        Medicine m9 = new Medicine(null, "Nexium", "AstraZeneca", "Esomeprazole", 380.0, "Gastrointestinal", 90,
                "Nexium (esomeprazole) is a proton pump inhibitor that decreases the amount of acid produced in the stomach. It is used to treat GERD and acid reflux.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Headache, diarrhea, nausea, flatulence, dry mouth.");

        // --- Asthma ---
        Medicine m10 = new Medicine(null, "Ventolin", "GSK", "Albuterol", 250.0, "Asthma", 70,
                "Ventolin (albuterol) is a bronchodilator that relaxes muscles in the airways and increases air flow to the lungs. Used to treat or prevent bronchospasm.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Tremors, nervousness, headache, throat irritation, rapid heart rate.");

        // --- Mental Health ---
        Medicine m11 = new Medicine(null, "Xanax", "Pfizer", "Alprazolam", 300.0, "Mental Health", 50,
                "Xanax (alprazolam) is a benzodiazepine that works by enhancing the effects of a certain natural chemical in the body (GABA). It is used to treat anxiety and panic disorders.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Drowsiness, dizziness, increased saliva production. Avoid alcohol entirely due to severe interactions.");

        Medicine m12 = new Medicine(null, "Zoloft", "Viatris", "Sertraline", 550.0, "Mental Health", 65,
                "Zoloft (sertraline) is an antidepressant belonging to a group of drugs called selective serotonin reuptake inhibitors (SSRIs). Used to treat depression, OCD, and PTSD.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Common side effects: Nausea, trouble sleeping, diarrhea, dry mouth, drowsiness, sweating.");

        // --- Baby Care (NEW) ---
        Medicine m13 = new Medicine(null, "Himalaya Baby Lotion", "Himalaya", "Herbal Baby Nourisher", 280.0, "Baby Care", 90,
                "Himalaya Baby Lotion helps keep baby's skin soft, supple, and protected. Formulated with Olive Oil and Almond Oil to provide gentle natural nourishment.",
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=400",
                "Gentle and hypoallergenic. Pediatrician tested.");

        Medicine m14 = new Medicine(null, "Pampers Baby Diapers Small", "Pampers", "Baby Diapers", 650.0, "Baby Care", 75,
                "Pampers Active Baby small size diapers designed with air channels for breathable dryness, keeping your baby dry and comfortable all night.",
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=400",
                "Change diaper immediately when soiled to prevent diaper rash.");

        Medicine m15 = new Medicine(null, "Johnson's Baby Powder", "Johnson & Johnson", "Talcum Powder", 150.0, "Baby Care", 120,
                "Johnson's Baby Powder protects baby's skin from excess moisture and leaves it soft and smooth. Helps eliminate friction while keeping skin dry.",
                "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=400",
                "Avoid contact with baby's eyes, nose, and mouth to prevent inhalation.");

        // --- Women Care (NEW) ---
        Medicine m16 = new Medicine(null, "Whisper Ultra Clean XL", "Whisper", "Sanitary Pads", 320.0, "Women Care", 180,
                "Whisper Ultra Clean XL sanitary pads with wings offer long-lasting protection and comfort during heavy flow days, with a dry-weave top sheet.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Dermatologically tested. Dispose of responsibly.");

        Medicine m17 = new Medicine(null, "Revital Woman", "Sun Pharma", "Women Multivitamins", 350.0, "Women Care", 110,
                "Revital Woman is a daily health supplement specially formulated for women, packed with vitamins, minerals, and Ginseng to boost energy and immunity.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Take one capsule daily after meals. Do not exceed recommended dosage.");

        Medicine m18 = new Medicine(null, "Dexorange Iron Syrup", "Franco-Indian", "Iron and Folic Acid", 160.0, "Women Care", 140,
                "Dexorange Syrup is a hematinic formulation containing Iron, Folic Acid, and Vitamin B12. Helps in treating iron deficiency and anemia.",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400",
                "Consult physician for appropriate dosage. May cause mild dark stool.");

        // --- OTC (NEW) ---
        Medicine m19 = new Medicine(null, "Dettol Antiseptic Liquid", "Reckitt", "Chloroxylenol Antiseptic", 210.0, "OTC", 200,
                "Dettol Antiseptic Liquid provides protection against 100 illness-causing germs. Used for first aid, medical sanitation, and personal hygiene.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "For external use only. Dilute before applying on wounds.");

        Medicine m20 = new Medicine(null, "Volini Pain Spray", "Sun Pharma", "Diclofenac Pain Relief", 145.0, "OTC", 160,
                "Volini Spray is a modern pain relief formulation with Diclofenac and Methyl Salicylate. Provides instant relief from back pain, joint pain, and sprains.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "Do not spray on open wounds or eyes. Flammable container.");

        Medicine m21 = new Medicine(null, "Vicks Vaporub", "Procter & Gamble", "Menthol Camphor Rub", 155.0, "OTC", 250,
                "Vicks Vaporub provides multi-symptom relief from cold symptoms, cough, nasal congestion, and body ache. Formulated with Menthol, Camphor, and Eucalyptus Oil.",
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400",
                "For external use and steam inhalation. Do not ingest.");

        // --- Personal Care (NEW) ---
        Medicine m22 = new Medicine(null, "Cetaphil Skin Cleanser", "Cetaphil", "Gentle Skin Cleanser", 315.0, "Personal Care", 85,
                "Cetaphil Gentle Skin Cleanser is a mild, non-irritating formula that soothes skin as it cleanses. Ideal for sensitive and dry skin types.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Dermatologist recommended. Soap-free and fragrance-free.");

        Medicine m23 = new Medicine(null, "Nivea Soft Cream", "Nivea", "Moisturizing Cream", 290.0, "Personal Care", 130,
                "Nivea Soft is an intensive, highly effective moisturizing cream for daily use. Lightweight formula with Jojoba Oil and Vitamin E that absorbs quickly.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                "Suitable for all skin types. Apply daily for best results.");

        medicineRepository.saveAll(Arrays.asList(
            m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, 
            m13, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23
        ));
        System.out.println("MediSwift: Seeded 23 high-quality medicine and healthcare records into database.");
    }
}
