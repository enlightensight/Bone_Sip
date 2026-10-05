# BONE SIP Technical & Clinical Framework
**Author:** BONE SIP Engineering & Clinical Nutrition Team  
**Last Updated:** October 2026  
**Target:** Internal Platform Documentation, Clinical Reviewers & API Integration

---

## 1. AI Assistant Context Pipeline (`server/assistant.js`)

BONE SIP uses a server-side handler for its AI guide (Ojas) that runs in `server/assistant.js` and feeds completions to Groq's OpenAI-compatible API (`https://api.groq.com/openai/v1/chat/completions`). 

To keep latency low and avoid burning rate limits on repetitive tokens, the prompt is divided into two parts: a static cached prompt containing medical and platform rules, and a dynamic runtime snapshot generated on every user request.

### 1.1 The Static Knowledge Prompt (`buildKnowledgePrompt`)
The static prompt compiles data directly from `js/data.js` when the server starts. Because the system instructions remain identical across requests, the inference provider caches the prefix.

Key components included in this prompt:

1. **Clinical boundaries and safety rules**:
   - The assistant explicitly disclaims physician status and is barred from prescribing medications, altering drug regimens, or recommending specific supplement dosages.
   - Emergency triage triggers: If a user reports severe acute pain after a fall, inability to bear weight, sudden neurological symptoms, or chest pain, the assistant must direct them to call Indian emergency services (112 or 108).
   - Osteoporosis movement restrictions: The assistant warns against loaded forward flexion (e.g. traditional sit-ups, bending to touch toes with stiff knees) and rapid spinal rotation for users with low T-scores.

2. **Exercise library coverage**:
   - All 10 filmed exercises in `js/data.js` are cataloged across Strength (Chair Sit-to-Stand, Heel Raises), Balance (Single-Leg Stand, Tandem Walk), and Posture (Seated Band Pull-Apart).
   - Details include step-by-step cues, targeted anatomical bones (femoral neck, spine, distal radius), and safety considerations (such as keeping a wall or chair within reach).

3. **Regional nutrition catalog**:
   - Nutrient mappings covering over 100 Indian dishes across North, South, West, East, and Continental cuisines.
   - Elemental calcium and protein values are indexed using standard Indian household units (katoris, rotis, tablespoons, glasses).
   - Includes high-calcium regional staples: finger millet (Ragi), unhulled sesame seeds (Til), drumstick leaves (Moringa), poppy seeds (Khus Khus), paneer, and curd.

4. **Metabolic condition rules**:
   - **Diabetes**: Emphasizes low-glycaemic millets (Ragi, Jowar, Bajra) and pulses; avoids refined carbohydrates.
   - **Hypertension**: Follows DASH guidelines (< 2,000 mg sodium/day) to prevent excess urinary calcium excretion.
   - **Thyroid medication**: Enforces the 4-hour spacing rule between morning levothyroxine and calcium-rich foods or supplements.
   - **Lactose intolerance & Nut allergies**: Replaces dairy with fortified plant milks, tofu, ragi, and sesame; replaces nuts with pumpkin and sunflower seeds.

5. **Action tag deep-linking**:
   - The assistant appends UI action tags (e.g. `[[action:open_diet]]`, `[[action:start_workout]]`, `[[action:open_report]]`) to route users directly to specific app views without manual navigation.

### 1.2 The Dynamic Runtime Snapshot (`buildSnapshot`)
On each user turn, the client passes a sanitized state object `ctx`. The server transforms this into a brief plain-text context block:

```text
Today: 2026-10-05
Screen open: diet_tab
First name: Meera
Age: 58
Height cm: 158
Weight kg: 62
BMI: 24.8
Diet: Vegetarian
Cuisine: South Indian
Activity: Light
Health & metabolic conditions: Hypertension, Thyroid
Clinical nutrition directive: Strictly personalize diet charts and recommendations to these conditions: Hypertension, Thyroid.
Unlocked pillars: build, protect
Bone score today: 72/100 (Active Capital Builder): diet 32/40, exercise 20/30, safety 10/20, streak bonus 10/10
Streak days: 5
Today's meals ticked: breakfast: Ragi Dosa; lunch: Sambar + Curd
Pending boosters: snack, dinner, sun_d3
```

---

## 2. The 3-2-1 Nutritional Model: Clinical Rationale

The 3-2-1 rule is BONE SIP's daily nutrition baseline for adults aged 50 and above:
- **3 Calcium Servings** (~1,000–1,200 mg/day elemental calcium)
- **2 Protein Portions** (~1.0–1.2 g/kg body weight/day)
- **1 Vitamin D3 Source** (15–20 min safe sunlight or clinical supplementation)

### 2.1 Why 3 Calcium Servings?
Active intestinal calcium transport occurs in the duodenum and upper jejunum via TRPV6 channels and calbindin-D9k. Kinetic studies (Heaney et al., 1988) show that active transport saturates when single-dose elemental calcium exceeds 400–500 mg. 

When a user consumes 1,000–1,200 mg in a single meal or tablet, fractional absorption drops significantly. Dividing intake across 3 meal occasions (Breakfast, Lunch, and Dinner/Snack) ensures the saturable carrier system operates at optimal efficiency throughout the day.

### 2.2 Why 2 Protein Portions?
Bone is approximately 50% protein by volume, primarily structured as a Type-I collagen matrix upon which hydroxyapatite crystals deposit (Bonjour, 2005). 

Dietary protein intake of 1.0–1.2 g/kg/day supports circulating Insulin-like Growth Factor 1 (IGF-1), which stimulates osteoblast activity and renal tubular calcium reabsorption. In aging adults, adequate protein also preserves muscle mass (countering sarcopenia), maintaining physical strength to prevent falls.

### 2.3 Why 1 Vitamin D3 Source?
Vitamin D is required for the synthesis of calbindin-D9k. Without sufficient 1,25-dihydroxyvitamin D, intestinal calcium absorption falls below 10–15% (Holick, 2007). 

BONE SIP tracks either 15–20 minutes of daily mid-morning sun exposure on arms and legs (between 10:00 AM and 1:00 PM for peak UVB) or a clinical oral supplement prescribed by the user's doctor.

### 2.4 Meal Timing & Absorption Rules
- **Levothyroxine (Thyroid) Spacing**: Calcium carbonate and dietary calcium bind to levothyroxine in the stomach, forming unabsorbable chelates (Singh et al., 2000). The app enforces taking thyroid medication first thing in the morning with water, spacing all calcium intake at least 4 hours later.
- **Tea and Coffee Tannins**: Polyphenols and phytates in Indian chai bind divalent cations. The app recommends separating tea or coffee by at least 1 hour from calcium-rich meals.
- **Sodium and Hypercalciuria**: High sodium intake shares proximal renal clearance pathways with calcium, increasing urinary calcium loss. Daily recipes are formulated with moderate sodium to prevent silent calcium wasting.

---

## 3. Fall Risk Screening & Home Hazard Assessment

Falls account for the majority of non-vertebral fractures in older adults. BONE SIP's **Protect** module implements a two-stage screening tool based on validated clinical guidelines.

### 3.1 Personal Fall Risk Screening (6 Clinical Warning Signs)
Adapted from the CDC STEADI (Stopping Elderly Accidents, Deaths, & Injuries) screening algorithm ("Stay Independent" tool; Stevens et al., 2014) and the American Geriatrics Society / British Geriatrics Society (AGS/BGS) clinical guidelines:

1. **Fell in the last year (`risk_fall`)**: A previous fall within the past 12 months is the single strongest clinical predictor of a future fall.
2. **Unsteady walking (`risk_unsteady`)**: Screens for lower-extremity weakness, gait asymmetry, and proprioceptive deficits.
3. **Dizziness when standing (`risk_dizziness`)**: Identifies potential orthostatic hypotension or vestibular dysfunction.
4. **Fear of falling (`risk_fear`)**: Detects self-limiting activity avoidance (kinesiophobia), which leads to deconditioning and muscle atrophy.
5. **Vision problems (`risk_vision`)**: Flags reduced visual acuity and contrast sensitivity, common causes of misjudging steps.
6. **4+ daily prescription medications (`risk_meds`)**: Polypharmacy increases the risk of sedative, hypotensive, and anticholinergic side effects.

**Risk Tiers**:
- **0–1 Warning Signs**: Low Risk — Routine balance maintenance and baseline home checks.
- **2–4 Warning Signs**: Moderate Risk — Targeted balance drills, environmental modifications, and medication review.
- **5–6 Warning Signs**: High Risk — Recommends clinical evaluation, physical therapy assessment, and supervised mobility.

### 3.2 5-Room Home Hazard Audit (15 Checkpoints)
Adapted from the CDC STEADI "Check for Safety" home assessment and the National Institute on Aging (NIA/NIH) home safety guidelines:

| Room | Checkpoint | Clinical Objective |
|---|---|---|
| **Bedroom** | Pathway clear of rugs and cables | Eliminates tripping hazards between bed and doorway. |
| | Bedside light within easy reach | Prevents walking in darkness when waking up. |
| | Feet rest flat on floor when seated on bed | Ensures stable posture before standing. |
| **Bathroom** | Grab bars near toilet and shower | Provides anchored support during transfers (replaces towel racks). |
| | Non-slip suction mats inside/outside bath | Prevents slipping on wet tile surfaces. |
| | Night light or continuous illumination | Ensures clear visibility during nocturnal bathroom visits. |
| **Stairs** | Handrails on both sides | Provides continuous bilateral upper-body support. |
| | Non-slip adhesive step treads | Improves shoe grip and step-edge contrast. |
| | Dual switches at top and bottom landings | Ensures stairways are never climbed or descended in the dark. |
| **Kitchen** | Frequently used items at waist-to-shoulder height | Eliminates the need to climb on stools or overreach. |
| | Non-skid mat near the sink | Reduces slipping risks in splash zones. |
| | Immediate cleanup protocol for spills | Prevents slick spots on kitchen flooring. |
| **Living Room**| Area rugs removed or taped down | Fixes loose rug edges that catch walking canes or footwear. |
| | Electrical wires tucked along baseboards | Removes loose cords crossing foot corridors. |
| | Clear walking paths between furniture | Maintains wide, unobstructed movement paths. |

---

## 4. References & Clinical Literature

1. **Heaney RP, Saville PD, Recker RR.** (1975). *Estimation of true calcium absorption.* Annals of Internal Medicine, 83(2), 174-177.
2. **Heaney RP, Weaver CM, Fitzsimmons ML.** (1988). *Absorption of calcium from calcium carbonate and calcium citrate.* Journal of Bone and Mineral Research, 3(5), 525-530.
3. **Bonjour JP.** (2005). *Dietary protein: an essential nutrient for bone health.* Journal of the American College of Nutrition, 24(sup6), 526S-536S.
4. **Rizzoli R, et al.** (2018). *Benefits and safety of dietary protein for bone health—an expert consensus paper endorsed by ESCEO.* Osteoporosis International, 29(9), 1933-1948.
5. **Holick MF.** (2007). *Vitamin D deficiency.* New England Journal of Medicine, 357(3), 266-281.
6. **Singh N, Singh PN, Hershman JM.** (2000). *Effect of calcium carbonate on the absorption of levothyroxine.* JAMA, 283(21), 2822-2825.
7. **Stevens JA, Ballesteros MF, Phelan EA.** (2014). *The STEADI tool kit: A resource for health care providers to prevent older adult falls.* Journal of Safety Research, 48, 109-115.
8. **Panel on Prevention of Falls in Older Persons, AGS/BGS.** (2011). *Summary of the Updated American Geriatrics Society/British Geriatrics Society clinical practice guideline for prevention of falls in older persons.* Journal of the American Geriatrics Society, 59(1), 148-157.
9. **National Institute on Aging (NIA/NIH).** (2022). *Fall-Proofing Your Home: A Room-by-Room Checklist.* U.S. Department of Health and Human Services.
