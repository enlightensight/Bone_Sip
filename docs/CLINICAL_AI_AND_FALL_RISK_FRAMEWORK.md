# BONE SIP: Clinical Architecture, AI Engine & Fall Risk Framework

*A practical technical and clinical guide to how BONE SIP personalizes nutrition, powers its AI assistant (Ojas), and screens for fall risks in older adults.*

---

## 1. What Content We Feed into the AI Chatbot (Ojas)

Our conversational AI assistant is called **Ojas** (a Sanskrit term representing core vitality, strength, and immunity). When a user chats with Ojas, the backend (`server/assistant.js`) combines two distinct layers of information: a **comprehensive domain knowledge base** and a **live per-user medical snapshot**. 

Here is exactly how that pipeline works and what data gets passed into it.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. SYSTEM KNOWLEDGE BASE (Cached at Server Edge)                        │
│    • Clinical safety boundaries (not a doctor, emergency triage 112/108)│
│    • 10 filmed exercise regimens (form cues, bones targeted, safety)    │
│    • 100+ Indian regional bone-building foods (calcium & protein values)│
│    • 8 metabolic disease decision rules (diabetes, thyroid, renal, etc.)│
│    • App navigation pathways & action triggers                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. LIVE USER CONTEXT SNAPSHOT (Appended on Every User Turn)             │
│    • Vitals & Body Metrics: Age, height, weight, computed live BMI      │
│    • Regional & Lifestyle Identity: Cuisine (North/South/etc.), Diet    │
│    • Medical Background: Active health flags (hypertension, thyroid)    │
│    • Today's Progress: Bone score (0–100), checked meals, active streak │
│    • UI Screen: What page or modal the user currently has open          │
│    • Filtered Meal Ideas: Top local dishes matching their conditions    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. MULTILINGUAL DIALOGUE ENGINE                                         │
│    Responds in user's chosen language (English + 11 Indian scripts)     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### A. The Static Knowledge Base (`buildKnowledgePrompt`)
The static prompt acts as Ojas's core medical and platform training. Because it stays constant across requests, our backend uses Groq prompt caching so it does not consume unnecessary rate limits or add latency.

1. **Medical Guardrails & Emergency Triage**:
   - Ojas explicitly states it is an educational AI guide, not a treating physician. It never changes prescription doses or suggests stopping prescribed medicines.
   - **Emergency Red Flag Protocol**: If a user mentions a recent fall accompanied by severe hip/back pain, inability to bear weight, dizziness, chest tightness, or loss of consciousness, Ojas halts routine advice and instructs them to call emergency services immediately (**112** or **108** in India).
   - **Osteoporosis Precautions**: For users with low bone density, Ojas flags movements to avoid—specifically loaded forward spine flexion (like touching toes or sit-ups), rapid twisting, and high-impact jumping.

2. **The 10 Filmed Exercise Modules**:
   - Ojas knows every exercise in the BONE SIP library across **Strength** (e.g., Chair Sit-to-Stand, Heel Raises), **Balance** (Single-Leg Stand, Tandem Walk), and **Posture** (Seated Band Pull-Apart).
   - It knows the exact coaching cues, the primary bones being loaded (femoral neck, lumbar spine, distal radius), and safety advice (e.g., keeping a chair nearby for support).

3. **Regional Indian Food & Mineral Database**:
   - Contains over 100 authentic dishes tailored to 5 culinary traditions: **North Indian, South Indian, West Indian, East Indian, and Global/Continental**.
   - Contains exact nutrient counts (calcium in mg, protein in g) per everyday Indian serving (katori, roti, glass, tablespoon).
   - Prioritizes accessible Indian calcium powerhouses:
     - **Ragi (Finger Millet)**: ~340 mg calcium per 100g.
     - **Roasted White Sesame (Til)**: ~1,400 mg/100g unhulled (~180 mg in 2 teaspoons).
     - **Moringa (Drumstick Leaves)**: ~440 mg per 100g.
     - **Poppy Seeds (Khus Khus)**: ~1,400 mg per 100g.
     - **Dairy Staples**: Fresh Curd/Dahi (~300 mg per bowl), Paneer (~200–350 mg per 100g).

4. **Metabolic Disease Adaptation Rules**:
   When a user has pre-existing conditions, Ojas automatically alters its meal recommendations:
   - **Diabetes**: Recommends low-glycaemic millets (Ragi, Jowar, Bajra), moong sprouts, and high-fiber legumes. Explains why elevated blood glucose creates Advanced Glycation End-products (AGEs) that weaken collagen cross-links in bone.
   - **Hypertension**: Enforces sodium restriction (< 2,000 mg/day) following DASH guidelines. Highlights that excess sodium forces the kidneys to dump calcium into urine (*hypercalciuria*).
   - **Obesity / Weight Management**: Focuses on high-satiety, lean proteins (tofu, sprouts, egg whites, boiled chana) at 1.0–1.2 g/kg body weight so bone-supporting muscles stay nourished while managing calories.
   - **High Cholesterol (Dyslipidemia)**: Focuses on soluble fiber (methi seeds, oats) and plant-based Omega-3s (flaxseeds, walnuts) to reduce chronic systemic inflammation that triggers bone resorption.
   - **Thyroid Disorders**: Enforces the **4-Hour Calcium Spacing Rule**—thyroid hormone (Levothyroxine) must be taken first thing in the morning with plain water, and any calcium-rich food, milk, curd, or tablet must wait at least 4 hours.
   - **Lactose Intolerance**: Replaces dairy with fortified soy milk, firm tofu, ragi rotis, sesame chutneys, and leafy greens.
   - **Nut Allergies**: Strictly excludes almonds, peanuts, cashews, and walnuts, swapping in pumpkin seeds, sunflower seeds, and roasted chana.

5. **In-App Navigation & Interactive Action Buttons**:
   Ojas can attach deep-link action pills to its responses so older adults do not have to hunt through menus:
   - `[[action:open_diet]]` — Takes user straight to today's 3-2-1 meal tracker.
   - `[[action:start_workout]]` — Launches the full-screen guided workout player.
   - `[[action:open_report]]` — Opens the comprehensive bone health report and score breakdown.
   - `[[action:open_protect]]` — Opens the fall risk and room-by-room safety audit.
   - `[[action:open_strengthen]]` — Opens the "Ask Your Doctor" checklist and DXA T-Score guide.
   - `[[action:open_profile]]` — Opens the profile screen to adjust height, weight, diet, or conditions.

---

### B. The Live Per-User Snapshot (`buildSnapshot`)
Whenever a user sends a message, the app generates a lightweight JSON summary of their current state. This allows Ojas to answer personal questions like *"What should I have for dinner tonight?"* or *"Why is my score only 65?"* with total accuracy.

```javascript
// Example of the live snapshot sent to the model with every prompt
{
  "First name": "Meera",
  "Age": 58,
  "Height cm": 158,
  "Weight kg": 62,
  "BMI": 24.8,
  "Diet": "Vegetarian",
  "Cuisine": "South Indian",
  "Activity": "Light daily walks",
  "Health & metabolic conditions": ["Hypertension", "Thyroid"],
  "Clinical nutrition directive": "Strictly personalize recommendations to: Hypertension, Thyroid",
  "Bone score today": "72/100 (Active Capital Builder): diet 32/40, exercise 20/30, safety 10/20, streak 10/10",
  "Streak days": 5,
  "Today's meals ticked": ["Breakfast (Ragi Dosa + Chutney)", "Lunch (Sambar + Curd + Brown Rice)"],
  "Pending boosters": ["Evening snack", "Dinner", "Sunlight & Vitamin D"],
  "Screen open": "Diet Tab",
  "Filtered meal ideas": [
    "snack: Roasted Makhana with sesame (~160 mg Ca)",
    "dinner: Methi Tofu Bhurji with Phulka (~280 mg Ca)"
  ]
}
```

---

## 2. The "3-2-1 Calcium Scaffolding" Clinical Methodology

The **3-2-1 Scaffolding** is BONE SIP's clinical framework designed around how the human gut actually absorbs calcium and how bone cells build structural strength.

```
       ┌─────────────────────────────────────────────────────────────┐
       │               THE BONE SIP 3-2-1 DAILY RULE                 │
       ├─────────────────────────────────────────────────────────────┤
       │  3  │  CALCIUM MOMENTS   │ ~1,000–1,200 mg across 3 meals   │
       │  2  │  PROTEIN ANCHORS   │ 1.0–1.2 g/kg across 2 main meals │
       │  1  │  VITAMIN D3 SOURCE │ 15–20 min sun or clinical D3     │
       └─────────────────────────────────────────────────────────────┘
```

### Why Do We Call It "Scaffolding"?

1. **Intestinal Receptor Saturation (Why 3 Servings?)**:
   - Calcium is absorbed in the small intestine through two pathways: active transcellular transport (via the **TRPV6** channel and **Calbindin-D9k** protein) and passive paracellular diffusion.
   - The active transport pathway **saturates at roughly 400 to 500 mg of elemental calcium per meal**. 
   - If someone consumes their entire daily 1,200 mg target in a single massive meal or large tablet, absorption drops below 15–20%, and the excess is lost through the stool.
   - **The 3-Serving Solution**: BONE SIP breaks daily intake into **three 300–400 mg deposits** (Breakfast, Lunch, and Dinner/Snack). This keeps the gut transporters working at maximum efficiency throughout the day.

2. **Building the Protein Matrix (Why 2 Anchors?)**:
   - Many people think bone is just hard mineral chalk. In reality, **50% of bone volume is an organic protein matrix**, made almost entirely of **Type-I Collagen**. Calcium crystals (hydroxyapatite) attach onto this collagen structure like bricks onto steel reinforcement rods.
   - Dietary protein stimulates the liver to produce **IGF-1 (Insulin-like Growth Factor 1)**. IGF-1 signals the kidneys to reabsorb calcium and activates osteoblasts (bone-forming cells).
   - Furthermore, adequate protein prevents **sarcopenia** (muscle wasting) in adults over 50. Strong quadriceps and glutes are the primary shock absorbers that protect the hip from breaking during a stumble.
   - **The 2-Anchor Solution**: Two dedicated protein portions per day (~50–70g total, or 1.0–1.2 g per kg of body weight) from dal, paneer, curd, soya, sprouts, eggs, or fish.

3. **Active Mineralization (Why 1 Vitamin D3 Source?)**:
   - Without active Vitamin D ($1,25(\text{OH})_2\text{D}_3$), the intestine cannot produce Calbindin-D9k, and calcium absorption plummets to under 10–15%.
   - **The 1-Source Solution**: A daily deposit of either 15–20 minutes of safe mid-morning sun exposure on the arms and legs (between 10:00 AM and 1:00 PM for optimal UVB synthesis) or a doctor-prescribed Vitamin D3 supplement.

---

### The Supporting Biochemical Co-Factors & Meal Timing Rules

- **Vitamin K2 (MK-7)**: Vitamin K2 acts like a traffic cop for calcium. It activates *osteocalcin* (through gamma-carboxylation), which binds free calcium into the bone crystal matrix instead of letting it deposit into blood vessel walls.
- **Magnesium**: Magnesium is required by the liver and kidneys to convert raw Vitamin D into its active form. It also helps regulate Parathyroid Hormone (PTH).
- **Thyroid Medication Separation**: Levothyroxine chemically binds to calcium ions in the stomach, forming an insoluble clump that blocks absorption of both the hormone and the mineral. BONE SIP strictly mandates taking thyroid medication first on an empty stomach and waiting **at least 4 hours** before having milk, curd, paneer, or calcium tablets.
- **Tea & Coffee Spacing**: Tannins, phytates, and polyphenols in Indian chai and coffee bind to dietary calcium. BONE SIP advises having tea/coffee **at least 1 hour before or after** main 3-2-1 meals.
- **Sodium Cap**: Excessive salt causes the kidneys to excrete calcium alongside sodium. We keep recipes low in added salt to prevent silent urinary calcium loss.

---

## 3. Fall Risk Screening: Clinical Questionnaires & Sources

Most osteoporotic fractures do not happen spontaneously—they occur when a fragile bone experiences the impact of a simple, ground-level fall. To protect our users, BONE SIP incorporates a **two-tier clinical fall screening tool**.

---

### A. Personal Fall Risk Screening (6 Clinical Warning Signs)

#### Clinical Origin & Validation:
- **Primary Source**: **CDC STEADI (Stopping Elderly Accidents, Deaths, & Injuries)** algorithm, specifically the validated **"Stay Independent"** screening tool created by the U.S. Centers for Disease Control and Prevention.
- **Endorsing Guidelines**: 
  - **AGS/BGS (American Geriatrics Society & British Geriatrics Society)** Clinical Practice Guidelines for Fall Prevention in Older Adults.
  - **WHO ICOPE (Integrated Care for Older People)** Clinical Protocol on Mobility Loss and Falls.

#### The 6 Warning Signs Screened in BONE SIP:

| Factor ID | Question / Warning Sign | Why This Matters Clinically |
|---|---|---|
| `risk_fall` | **Fell in the last year** | Having fallen once in the past 12 months is the single strongest statistical predictor of a future fall and fracture. |
| `risk_unsteady` | **Unsteady walking or balance** | Highlights gait abnormalities, lower-body weakness, or peripheral sensory loss in the feet. |
| `risk_dizziness` | **Dizziness when standing up** | Screens for orthostatic hypotension (sudden blood pressure drop), vestibular issues, or heart rhythm fluctuations. |
| `risk_fear` | **Fear of falling** | Fear causes people to limit their daily activities. This leads to rapid muscle atrophy, worsening balance, and paradoxically *increases* fall risk. |
| `risk_vision` | **Vision problems** | Reduced contrast sensitivity, cataracts, or misjudging step heights in dim lighting frequently cause trips. |
| `risk_meds` | **4 or more daily medicines** | Polypharmacy (especially combinations of blood pressure drugs, sedatives, antidepressants, or sleep aids) significantly increases disorientation and balance loss. |

#### Risk Stratification in the App:
- **0–1 Warning Signs**: **Low Risk** — The user focuses on maintenance workouts (Heel-to-Toe walking, Chair Sit-to-Stand) and basic home safety.
- **2–4 Warning Signs**: **Moderate Risk** — Prompts the user to start daily balance training, inspect home hazards, and discuss medication side effects with their doctor.
- **5–6 Warning Signs**: **High Risk** — Recommends a clinical medical checkup, physical therapy evaluation, and using assistive support when moving outdoors.

---

### B. The 5-Room Home Hazard Safety Audit (15 Environmental Checkpoints)

#### Clinical Origin:
- **Primary Source**: **CDC STEADI "Check for Safety: A Home Fall Prevention Checklist for Older Adults"**.
- **Supporting Research**: **National Institute on Aging (NIA / NIH)** Home Fall-Proofing and Environmental Hazard Guidelines.

Over 60% of all falls in older adults happen right inside their own homes. BONE SIP guides the user room-by-room through 15 actionable checkpoints:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   BONE SIP 5-ROOM HOME SAFETY AUDIT                     │
├─────────────────┬───────────────────────────────────────────────────────┤
│ 1. Bedroom      │ • Clear walkway from bed to door (no loose throw rugs)│
│                 │ • Bedside touch lamp or switch within easy arm's reach│
│                 │ • Bed height allows feet to rest flat on the floor    │
├─────────────────┼───────────────────────────────────────────────────────┤
│ 2. Bathroom     │ • Sturdy wall-anchored grab bars near shower & toilet │
│ (Highest Risk)  │ • Heavy-duty suction non-slip rubber floor mats       │
│                 │ • Motion-sensor night light for midnight trips        │
├─────────────────┼───────────────────────────────────────────────────────┤
│ 3. Stairs       │ • Secure handrails on both sides of the staircase     │
│                 │ • High-contrast non-slip adhesive treads on step edges│
│                 │ • Dual light switches at both top and bottom landings │
├─────────────────┼───────────────────────────────────────────────────────┤
│ 4. Kitchen      │ • Frequently used dishes & spices kept at waist height│
│                 │ • Non-skid rubber-backed mat in front of the sink     │
│                 │ • Immediate mop protocol for water or cooking oil     │
├─────────────────┼───────────────────────────────────────────────────────┤
│ 5. Living Room  │ • Loose area rugs removed or taped down securely      │
│                 │ • Electrical wires routed along walls and baseboards  │
│                 │ • Wide, open walking paths between tables and chairs  │
└─────────────────┴───────────────────────────────────────────────────────┘
```

---

## 4. Summary Quick Reference

| System Component | What It Does | Grounded Clinical / Evidence Source |
|---|---|---|
| **Ojas Knowledge Base** | Gives accurate, safe, Indian-diet-friendly bone guidance without prescribing | `server/assistant.js`, built directly from `js/data.js` |
| **Ojas User Snapshot** | Injects real-time age, BMI, metabolic flags, and today's meal status into every prompt | Dynamic context engine (`buildSnapshot()`) |
| **3-2-1 Scaffolding** | 3 calcium deposits (~1,200 mg), 2 protein anchors (1.0–1.2 g/kg), 1 D3 source | TRPV6 intestinal saturation kinetics & Collagen matrix synthesis |
| **Personal Fall Screening** | Identifies 6 core clinical risk factors (prior falls, gait, dizziness, polypharmacy) | **CDC STEADI ("Stay Independent")**, **AGS/BGS**, **WHO ICOPE** |
| **5-Room Safety Audit** | Audits 15 physical hazards across Bedroom, Bathroom, Stairs, Kitchen & Living Area | **CDC STEADI ("Check for Safety")**, **NIA/NIH Guidelines** |

---
*BONE SIP Clinical & AI Architecture Reference Guide*
