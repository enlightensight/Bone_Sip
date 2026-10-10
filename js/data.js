// BONE SIP - Complete 16-Module Domain Knowledge & Data Architecture
// Extracted and curated from BONE SIP DOMAIN (1).pptx

const BONE_SIP_DATA = {
  appName: "BONE SIP",
  tagline: "Strong Independence Plan",
  motto: "Invest today. Stay independent tomorrow.",
  definition: "Just as you invest regularly for your financial future, your bones deserve a long-term investment plan too.",

  // --------------------------------------------------------------------------
  // MODULE 1: ONBOARDING CAROUSEL SCREENS (MATCHING IMAGES 2, 3, 4)
  // --------------------------------------------------------------------------
  onboardingScreens: [
    {
      id: "onboard_portfolio",
      step: 1,
      tag: "YOUR LIFE PORTFOLIO",
      title: "Your bones carry your whole life.",
      description: "Every trip, walk and hug rests on them.",
      theme: "green",
      art: ["bone", "airplane", "hug", "running"],
      btnText: "Next"
    },
    {
      id: "onboard_moves",
      step: 2,
      tag: "THREE MOVES",
      title: "Build. Protect. Strengthen.",
      description: "Eat & move. Prevent falls. Check in with your doctor.",
      theme: "blue",
      art: ["biceps", "shield", "chart"],
      btnText: "Next"
    },
    {
      id: "onboard_daily",
      step: 3,
      tag: "SMALL DAILY SIPS",
      title: "Small daily steps. Big returns.",
      description: "Meals, moves and reminders made for you. No sign-up to start.",
      theme: "gold",
      art: ["phone", "milk", "bell", "fire"],
      btnText: "Let's begin"
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 2: GOAL SELECTION & MULTI-STEP ASSESSMENT METADATA
  // --------------------------------------------------------------------------
  lifeAssets: [
    {
      id: "asset_travel",
      title: "Travel",
      img: "airplane",
      icon: "fa-globe",
    },
    {
      id: "asset_independence",
      title: "Independence",
      img: "house",
      icon: "fa-house",
    },
    {
      id: "asset_family",
      title: "Family time",
      img: "hug",
      icon: "fa-users",
    },
    {
      id: "asset_active",
      title: "Staying active",
      img: "running",
      icon: "fa-heart-pulse",
    },
    {
      id: "asset_confidence",
      title: "Moving freely",
      img: "walking",
      icon: "fa-arrow-trend-up",
    },
    {
      id: "asset_quality",
      title: "Joy of life",
      img: "hearts",
      icon: "fa-heart",
    }
  ],

  // Step: Diet Pattern
  dietOptions: [
    {
      id: "veg",
      title: "Vegetarian",
      description: "Dairy, dal & grains",
      img: "salad"
    },
    {
      id: "eggetarian",
      title: "Eggetarian",
      description: "Veg + eggs",
      img: "egg"
    },
    {
      id: "non_veg",
      title: "Non-vegetarian",
      description: "Eggs, fish & chicken",
      img: "poultry"
    },
    {
      id: "vegan",
      title: "Vegan",
      description: "100% plant-based",
      img: "seedling"
    }
  ],

  // Step: Regional Food Preference
  regionalFoodOptions: [
    {
      id: "north",
      title: "North Indian",
      description: "Paneer · Roti · Saag",
      img: "flatbread"
    },
    {
      id: "south",
      title: "South Indian",
      description: "Ragi dosa · Curd rice",
      img: "curry"
    },
    {
      id: "west",
      title: "West & Central",
      description: "Thepla · Bhakri · Dhokla",
      img: "stuffed"
    },
    {
      id: "east",
      title: "East & North-East",
      description: "Fish · Chhena · Greens",
      img: "fish"
    },
    {
      id: "continental",
      title: "Global",
      description: "Yogurt · Tofu · Salads",
      img: "globe"
    }
  ],

  // Step: Daily Activity Level
  activityLevelOptions: [
    {
      id: "sedentary",
      title: "Mostly sitting",
      description: "Under 3k steps",
      img: "laptop"
    },
    {
      id: "light",
      title: "Lightly active",
      description: "3k–6k steps",
      img: "walking"
    },
    {
      id: "moderate",
      title: "Moderately active",
      description: "6k–10k steps",
      img: "running"
    },
    {
      id: "very_active",
      title: "Very active",
      description: "10k+ steps",
      img: "weights"
    }
  ],

  // Step: Health Conditions & Metabolic History
  healthConditionOptions: [
    {
      id: "diabetes",
      title: "Diabetes",
      description: "Blood sugar & glycemic balance",
      img: "glucose"
    },
    {
      id: "hypertension",
      title: "Hypertension",
      description: "Blood pressure & low sodium",
      img: "bp_cuff"
    },
    {
      id: "obesity",
      title: "Obesity",
      description: "Weight & calorie management",
      img: "scale"
    },
    {
      id: "dyslipidemia",
      title: "High Cholesterol (Dyslipidemia)",
      description: "Heart-healthy lipids & fats",
      img: "cholesterol"
    },
    {
      id: "thyroid",
      title: "Thyroid Disorders",
      description: "Hormone & metabolic rate",
      img: "thyroid"
    },
    {
      id: "kidney",
      title: "Kidney Impairment/Disease",
      description: "Renal & mineral filtration",
      img: "kidney"
    },
    {
      id: "lactose_intolerance",
      title: "Lactose Intolerance",
      description: "Dairy-free & plant calcium",
      img: "lactose"
    },
    {
      id: "nuts_allergy",
      title: "Nuts Allergy",
      description: "Nut-free seeds & legumes",
      img: "nut_allergy"
    },
    {
      id: "fracture",
      title: "Fracture after 40",
      description: "From a minor fall",
      img: "bandage"
    },
    {
      id: "none",
      title: "None of these",
      description: "General bone health prevention",
      img: "check"
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 3: VALUE NARRATIVE + BONE SIP INTRO
  // --------------------------------------------------------------------------
  narrativeComparison: [
    {
      parameter: "Core Investment",
      financialSIP: "Monthly capital deposited into mutual funds & assets",
      boneSIP: "Daily Calcium (1,000–1,200mg), Protein & Vitamin D3 deposited into bone matrix"
    },
    {
      parameter: "Compounding Mechanism",
      financialSIP: "Compound interest generates wealth exponential over decades",
      boneSIP: "Daily osteoblast mineralization maintains high Bone Mineral Density (BMD)"
    },
    {
      parameter: "Critical Risk Factor",
      financialSIP: "Market crashes and sudden economic downturns",
      boneSIP: "Accidental standing-height falls and progressive muscle sarcopenia"
    },
    {
      parameter: "Ultimate Outcome",
      financialSIP: "Financial freedom and peace of mind in retirement",
      boneSIP: "Physical mobility, zero fracture reliance, and lifelong independence"
    }
  ],

  pillars: [
    {
      id: "build",
      tag: "BUILD",
      title: "Build your Bone Capital",
      accent: "#4A3F7A",
      itemsText: "Nutrition | Vitamin D | Protein | Exercise | Muscle Strength"
    },
    {
      id: "protect",
      tag: "PROTECT",
      title: "Protect your Bone Wealth",
      accent: "#D6265A",
      itemsText: "Fall Prevention | Safe Movement | Home Safety | Footwear"
    },
    {
      id: "strengthen",
      tag: "STRENGTHEN",
      title: "Optimize your Bone Portfolio",
      accent: "#8E2C6A",
      itemsText: "Risk Assessment | DXA/BMD | FRAX® | Fracture History | Doctor Discussion"
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 4: SEQUENTIAL TAB SHELL (JOURNEY MILESTONES)
  // --------------------------------------------------------------------------
  journeyMilestones: [
    { id: "stage_intro", stage: 1, title: "Onboarding & Login", view: "flash", icon: "fa-shield-halved", unlocked: true, completed: false },
    { id: "stage_build", stage: 2, title: "Build: 3-2-1 Diet", view: "nutrition", icon: "fa-utensils", unlocked: true, completed: false },
    { id: "stage_daily", stage: 3, title: "Daily Active SIP", view: "tracker", icon: "fa-calendar-check", unlocked: true, completed: false },
    { id: "stage_exercises", stage: 4, title: "Bone Loading Exercises", view: "exercises", icon: "fa-person-walking", unlocked: true, completed: false },
    { id: "stage_protect", stage: 5, title: "Protect: Home Safety", view: "home-safety", icon: "fa-house-circle-check", unlocked: true, completed: false },
    { id: "stage_strengthen", stage: 6, title: "Strengthen: Clinical", view: "doctor-review", icon: "fa-user-doctor", unlocked: true, completed: false }
  ],

  // --------------------------------------------------------------------------
  // MODULE 5: BUILD: ANIMATED EDUCATION SCREENS (PUNCH-LINE MESSAGING)
  // --------------------------------------------------------------------------
  punchlines: [
    {
      id: "punch_1",
      number: "01",
      tag: "Living Biology",
      headline: "Bone is living tissue, not dry concrete.",
      punch: "Every 10 years, your entire skeleton completely remodels itself.",
      detail: "Specialized cells called osteoclasts clear old bone while osteoblasts build fresh mineral scaffolding. Feeding them daily calcium and protein ensures new bone is dense and resilient.",
      icon: "fa-dna",
      accent: "blue"
    },
    {
      id: "punch_2",
      number: "02",
      tag: "The Scaffolding Principle",
      headline: "Calcium without Protein is like bricks without cement.",
      punch: "50% of your bone volume is made of pure collagen protein matrix.",
      detail: "Calcium crystals embed themselves onto a flexible protein framework. If your diet lacks protein, calcium has no foundation to latch onto, making bones brittle like chalk.",
      icon: "fa-cubes-stacked",
      accent: "pink"
    },
    {
      id: "punch_3",
      number: "03",
      tag: "The Gateway Vitamin",
      headline: "Vitamin D is the master key that unlocks calcium absorption.",
      punch: "Without Vitamin D, your body absorbs less than 15% of the calcium you eat.",
      detail: "Vitamin D3 triggers calcium transporter channels in your intestinal wall. Just 15 minutes of safe midday sun or clinical D3 supplementation turns food into bone capital.",
      icon: "fa-sun",
      accent: "blue"
    },
    {
      id: "punch_4",
      number: "04",
      tag: "Mechanical Loading",
      headline: "Bones grow stronger only when muscles pull on them.",
      punch: "Gravity and resistance are the direct chemical triggers for bone growth.",
      detail: "When you perform sit-to-stands or brisk walking, tiny mechanical piezoelectric signals stimulate osteoblasts to reinforce the exact areas under load.",
      icon: "fa-dumbbell",
      accent: "pink"
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 6: BUILD: NUTRITION & VITAMIN INFO (STATIC INFORMATIVE)
  // --------------------------------------------------------------------------
  rule321: {
    title: "THE 3-2-1 BONE SIP RULE",
    description: "Daily golden ratio of bone-building nutrition designed for longevity.",
    rules: [
      { count: 3, label: "Calcium-Rich Foods", unit: "servings (~1,000–1,200 mg total)", icon: "fa-glass-water", color: "#0284C7" },
      { count: 2, label: "Protein Servings", unit: "high biological value (1.0–1.2 g/kg)", icon: "fa-drumstick-bite", color: "#E11D48" },
      { count: 1, label: "Vitamin D Source", unit: "safe midday sun / fortified / D3", icon: "fa-sun", color: "#0284C7" }
    ]
  },

  calciumRichFoods: [
    { food: "Ragi (Finger Millet)", serving: "100 g flour", calciumMg: 344, proteinG: 7.3, category: "Grains", bio: "High" },
    { food: "Sesame Seeds (Til)", serving: "2 tbsp (20 g)", calciumMg: 195, proteinG: 3.6, category: "Seeds", bio: "Very High" },
    { food: "Paneer (Cottage Cheese)", serving: "100 g", calciumMg: 480, proteinG: 18.0, category: "Dairy", bio: "Excellent" },
    { food: "Curd / Yogurt", serving: "1 medium bowl (200 g)", calciumMg: 260, proteinG: 6.8, category: "Dairy", bio: "Excellent" },
    { food: "Fortified Cow Milk / Soy Milk", serving: "1 glass (250 ml)", calciumMg: 300, proteinG: 8.2, category: "Dairy / Alt", bio: "Excellent" },
    { food: "Tofu (Calcium-set)", serving: "100 g", calciumMg: 350, proteinG: 14.0, category: "Plant", bio: "High" },
    { food: "Moringa / Drumstick Leaves", serving: "1 cooked cup (100 g)", calciumMg: 185, proteinG: 6.7, category: "Greens", bio: "Moderate" },
    { food: "Canned Sardines / Small Fish with Bones", serving: "85 g", calciumMg: 325, proteinG: 21.0, category: "Seafood", bio: "Maximum" }
  ],

  absorptionRules: [
    {
      title: "Calcium Absorption Boosters",
      type: "booster",
      icon: "fa-circle-check",
      points: [
        "Vitamin D3: Essential for intestinal calcium transport channels.",
        "Adequate Stomach Acid: Consume calcium with meals to optimize solubility.",
        "Vitamin K2: Directs calcium specifically into bone crystals and away from arteries."
      ]
    },
    {
      title: "Calcium Absorption Blockers",
      type: "blocker",
      icon: "fa-circle-xmark",
      points: [
        "Phytates & Oxalates: Raw spinach and unsoaked bran bind calcium (soak/cook greens well).",
        "Excess Caffeine & Tannins: Space strong tea and coffee at least 1 hour away from dairy/calcium meals.",
        "High Sodium Diets: Excess dietary salt triggers calcium excretion through kidneys."
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 7: BUILD: AI DIET QUESTIONNAIRE (6 INPUT PARAMETERS)
  // --------------------------------------------------------------------------
  dietQuestionnaireParams: [
    {
      id: "param_stage",
      label: "1. Age & Biological Stage",
      hint: "Hormonal milestones strongly impact bone resorption rates",
      options: [
        { value: "under_40", label: "Under 40 Years (Peak Bone Maintenance)" },
        { value: "peri_40_50", label: "40 – 50 Years (Perimenopause / Early Transition)" },
        { value: "post_50_65", label: "50 – 65 Years (Post-Menopausal / Accelerated Bone Loss)" },
        { value: "senior_65_plus", label: "65+ Years (Senior High Fracture Vulnerability)" }
      ]
    },
    {
      id: "param_diet",
      label: "2. Dietary Preference",
      hint: "Calibrates plant vs dairy vs animal protein bioavailability",
      options: [
        { value: "vegetarian", label: "Vegetarian (Dairy, Grains, Dals, Nuts)" },
        { value: "eggetarian", label: "Eggetarian (Vegetarian + Eggs)" },
        { value: "non_vegetarian", label: "Non-Vegetarian (Poultry, Fish, Eggs, Dairy)" },
        { value: "vegan", label: "Vegan (100% Plant-Based & Fortified Foods)" },
        { value: "jain", label: "Jain Vegetarian (No Root Veggies, High Dairy/Seeds)" }
      ]
    },
    {
      id: "param_sun",
      label: "3. Daily Outdoor Sunlight Exposure",
      hint: "Synthesizes endogenous Vitamin D3 in the skin",
      options: [
        { value: "sun_low", label: "Less than 15 minutes daily (Mostly Indoors)" },
        { value: "sun_med", label: "15 – 30 minutes midday sun exposure" },
        { value: "sun_high", label: "More than 30 minutes regular outdoor exposure" }
      ]
    },
    {
      id: "param_activity",
      label: "4. Physical Activity & Muscle Loading",
      hint: "Determines mechanical osteoblast stimulation",
      options: [
        { value: "sedentary", label: "Sedentary (Desk work, little walking)" },
        { value: "light_walk", label: "Light Walking (20–30 mins easy strolls)" },
        { value: "moderate_active", label: "Moderate Exercise (Brisk walks, Yoga, Stairs)" },
        { value: "strength_trained", label: "Regular Strength Training / Resistance Workouts" }
      ]
    },
    {
      id: "param_dairy",
      label: "5. Dairy & Lactose Tolerance",
      hint: "Calibrates dairy vs sesame/tofu/ragi calcium sources",
      options: [
        { value: "full_dairy", label: "Fully Tolerant (Drink milk, curd, paneer freely)" },
        { value: "mild_lactose", label: "Mild Sensitivity (Prefer curd, paneer over pure milk)" },
        { value: "strictly_non_dairy", label: "Strictly Non-Dairy / Lactose Intolerant" }
      ]
    },
    {
      id: "param_fracture",
      label: "6. Fracture & Bone Loss History",
      hint: "Key clinical predictor of future fracture events",
      options: [
        { value: "none", label: "No prior fractures or known bone issues" },
        { value: "stiffness", label: "Joint stiffness or family history of osteoporosis" },
        { value: "past_fracture", label: "Experienced a low-trauma fracture after age 40" }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 9: AI DIET PLAN GENERATOR + 7-DAY CALENDAR VIEW (SWAPPABLE MEALS)
  // --------------------------------------------------------------------------
  weeklyDietCalendar: [
    {
      day: "Monday",
      theme: "Sesame & Ragi Foundation Day",
      targetCalcium: 1200,
      targetProtein: 70,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "2 Ragi Dosas + Coconut Chutney + 1 Cup Curd", calcium: 380, protein: 18, desc: "Rich in mineral finger millet and probiotic live cultures" },
            { name: "Fortified Oats Porridge with Chia Seeds & Almonds", calcium: 340, protein: 16, desc: "Soluble beta-glucans with bone-protective healthy fats" },
            { name: "2 Boiled Eggs with 2 Slices Whole Grain Toast + Milk", calcium: 320, protein: 22, desc: "High biological value complete albumin protein" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Thick Toor Dal + Palak Paneer + 2 Multigrain Rotis", calcium: 420, protein: 24, desc: "Synergy of dairy calcium, iron, and legume protein" },
            { name: "Spiced Chickpea (Chole) Bowl + Cucumber Sesame Salad + Rice", calcium: 360, protein: 20, desc: "High plant fiber and concentrated calcium seeds" },
            { name: "Grilled Fish / Chicken Curry + 2 Phulkas + Spiced Chaas", calcium: 390, protein: 30, desc: "Maximum muscle protein synthesis for fall resistance" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "1 Handful Roasted Chana + 1 Glass Spiced Chaas", calcium: 180, protein: 12, desc: "Light low-glycemic crunch with dairy electrolytes" },
            { name: "Handful Almonds & Walnuts + 2 Dried Figs (Anjeer)", calcium: 190, protein: 8, desc: "Concentrated calcium-dense dried figs and magnesium" },
            { name: "Greek Yogurt Cup with Roasted Pumpkin Seeds", calcium: 210, protein: 15, desc: "Ultra-concentrated calcium and zinc for bone repair" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Mixed Vegetable Khichdi + Roasted Til Papad + Curd", calcium: 310, protein: 16, desc: "Gentle restorative digestion before sleep" },
            { name: "Paneer Tikka / Tofu Stir-Fry with Broccoli & Capsicum", calcium: 380, protein: 22, desc: "Cruciferous vitamin K with bioavailable calcium" },
            { name: "Egg Bhurji (2 Eggs) + 2 Soft Phulkas + Warm Tomato Soup", calcium: 290, protein: 20, desc: "High satiety and gentle nighttime muscle feeding" }
          ]
        }
      }
    },
    {
      day: "Tuesday",
      theme: "High-Protein Scaffolding Day",
      targetCalcium: 1180,
      targetProtein: 75,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "Moong Dal Cheela with Grated Paneer + Mint Chutney", calcium: 360, protein: 22, desc: "Sprouted legume protein and bioavailable dairy" },
            { name: "Vegetable Poha with Roasted Peanuts + Warm Milk", calcium: 310, protein: 14, desc: "Easy morning carbohydrates and gentle protein" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Rajma (Kidney Bean) Curry + Brown Rice + Flaxseed Raita", calcium: 390, protein: 22, desc: "Rich in magnesium, potassium, and plant protein" },
            { name: "Tofu Vegetable Stir-Fry + 2 Jowar Rotis + Spiced Curd", calcium: 440, protein: 26, desc: "Calcium-set tofu with gluten-free millet" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "Fresh Fruit Bowl (Papaya/Guava) + 1 tbsp Chia Seeds", calcium: 160, protein: 6, desc: "Vitamin C to stimulate bone collagen synthesis" },
            { name: "1 Cup Warm Fortified Soy Milk + Roasted Makhana", calcium: 220, protein: 10, desc: "Low-calorie crunchy calcium power snack" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Methi (Fenugreek) Thepla (2 pcs) + Dal Tadka + 1 Glass Chaas", calcium: 320, protein: 18, desc: "Green leafy minerals combined with digestive spices" },
            { name: "Grilled Herb Fish Fillet with Steamed Beans & Carrots", calcium: 350, protein: 28, desc: "Lean marine protein with anti-inflammatory omega-3s" }
          ]
        }
      }
    },
    {
      day: "Wednesday",
      theme: "Curd & Green Leafy Synergy Day",
      targetCalcium: 1220,
      targetProtein: 72,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "Idli (3 pcs) + Drumstick Sambar + Thick Curd", calcium: 370, protein: 17, desc: "Fermented batter and drumstick pod calcium" },
            { name: "2 Egg Omelette with Mushrooms & Spinach + Multigrain Toast", calcium: 340, protein: 24, desc: "Choline, lutein, and high bioavailability albumin" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Moringa / Drumstick Leaf Dal + 2 Phulkas + Paneer Bhurji", calcium: 450, protein: 26, desc: "Highest botanical calcium paired with cottage cheese" },
            { name: "Soy Chunks Vegetable Curry + Rice + Cucumber Raita", calcium: 410, protein: 28, desc: "Dense isoflavones to support bone mineral retention" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "Handful Roasted Sesame Chikki / Til Ladoo", calcium: 210, protein: 7, desc: "Traditional concentrated calcium treat" },
            { name: "Greek Yogurt with Blueberries & Flaxseed", calcium: 230, protein: 14, desc: "Polyphenol antioxidants paired with dairy calcium" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Lauki (Bottle Gourd) Chana Dal + 2 Multigrain Rotis + Salad", calcium: 290, protein: 18, desc: "High hydration, light glycemic index, gentle digestion" },
            { name: "Egg Curry with Steamed Rice + Beetroot Salad", calcium: 320, protein: 22, desc: "Nitric oxide rich beetroot and complete egg protein" }
          ]
        }
      }
    },
    {
      day: "Thursday",
      theme: "Millet & Seed Matrix Day",
      targetCalcium: 1210,
      targetProtein: 74,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "Bajra (Pearl Millet) Khichdi with Curd & Sesame Sprinkle", calcium: 380, protein: 18, desc: "Iron, magnesium, and slow-release millet energy" },
            { name: "Fortified Almond Milk Smoothie with Protein Powder & Banana", calcium: 390, protein: 25, desc: "Quick liquid nutrition for active mornings" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Paneer Pulao with Mixed Sprouts Salad + Spiced Chaas", calcium: 430, protein: 25, desc: "Sprouted enzymes and dairy calcium" },
            { name: "Lentil Soup with Roasted Pumpkin + 2 Jowar Rotis", calcium: 370, protein: 19, desc: "Carotenoids and dense plant protein" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "Sprouts Chaat with Lime, Tomatoes & Roasted Peanuts", calcium: 170, protein: 12, desc: "Vitamin C dressed live enzymes" },
            { name: "1 Cup Warm Haldi (Turmeric) Fortified Milk", calcium: 290, protein: 9, desc: "Anti-inflammatory curcumin paired with milk lipids" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Moong Dal with Palak + 2 Phulkas + Cucumber Salad", calcium: 300, protein: 20, desc: "Light, digestible protein for restful sleep" },
            { name: "Grilled Chicken Breast with Steamed Broccoli & Mash", calcium: 360, protein: 32, desc: "Maximum biological protein for muscle remodeling" }
          ]
        }
      }
    },
    {
      day: "Friday",
      theme: "Bioavailable Calcium Boost Day",
      targetCalcium: 1240,
      targetProtein: 76,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "Ragi Malt with Warm Milk & Jaggery + 10 Soaked Almonds", calcium: 410, protein: 16, desc: "Gentle warm traditional calcium elixir" },
            { name: "Scrambled Eggs with Tomatoes, Spinach & Toast", calcium: 330, protein: 22, desc: "Antioxidant lycopene with egg albumin" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Soya Chunk Curry + 2 Multigrain Rotis + Curd Salad", calcium: 420, protein: 28, desc: "Highest plant-source protein density" },
            { name: "Macher Jhol (Fish Curry with Bones) + Rice + Greens", calcium: 460, protein: 30, desc: "Direct natural hydroxyapatite bone minerals" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "Roasted Makhana (Foxnuts) with Turmeric & Olive Oil", calcium: 160, protein: 6, desc: "Low glycemic crunch rich in bone minerals" },
            { name: "1 Cup Curd with Honey & Sunflower Seeds", calcium: 240, protein: 11, desc: "Probiotic calcium with zinc & selenium" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Paneer Bhurji + 2 Whole Wheat Rotis + Green Salad", calcium: 370, protein: 24, desc: "Overnight continuous amino acid supply" },
            { name: "Tofu Sesame Stir-fry with Brown Rice", calcium: 390, protein: 22, desc: "Double plant calcium powerhouse" }
          ]
        }
      }
    },
    {
      day: "Saturday",
      theme: "Weekend Vitality & Balance Day",
      targetCalcium: 1200,
      targetProtein: 72,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "Paneer Paratha (1 medium) with Fresh Mint Curd", calcium: 390, protein: 20, desc: "Satiating whole grain with rich dairy calcium" },
            { name: "Banana Peanut Butter Toast + 1 Glass Fortified Milk", calcium: 340, protein: 18, desc: "Potassium, healthy fats, and liquid calcium" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Mixed Dal with Drumstick + 2 Jowar Rotis + Spiced Buttermilk", calcium: 410, protein: 23, desc: "Alkaline millet paired with legumes" },
            { name: "Grilled Fish / Chicken Wrap with Greens & Yogurt Dressing", calcium: 380, protein: 29, desc: "Convenient lean protein on the go" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "Mixed Dry Fruit Trail Mix (Almonds, Walnuts, Figs, Til)", calcium: 210, protein: 9, desc: "Pocket-sized mineral powerhouse" },
            { name: "Fresh Coconut Water + Handful Roasted Peanuts", calcium: 140, protein: 8, desc: "Natural electrolyte hydration" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Dal Khichdi with Ghee + Roasted Sesame Papad + Curd", calcium: 320, protein: 17, desc: "Comforting, nutrient-dense digestion" },
            { name: "Egg Fried Rice with Extra Veggies & Sesame Oil", calcium: 290, protein: 20, desc: "Light, clean weekend evening supper" }
          ]
        }
      }
    },
    {
      day: "Sunday",
      theme: "Sunlight & Recovery Day",
      targetCalcium: 1250,
      targetProtein: 78,
      meals: {
        breakfast: {
          slot: "Breakfast",
          time: "7:30 AM – 8:30 AM",
          currentOption: 0,
          options: [
            { name: "Masala Dosa + Sambhar + 1 Glass Fortified Badam Milk", calcium: 420, protein: 19, desc: "Traditional South Indian breakfast with fortified nuts" },
            { name: "2 Poached Eggs on Avocado Sourdough + Warm Milk", calcium: 350, protein: 24, desc: "Monounsaturated fats and high biological protein" }
          ]
        },
        lunch: {
          slot: "Lunch",
          time: "12:30 PM – 1:30 PM",
          currentOption: 0,
          options: [
            { name: "Royal Shahi Paneer (low cream) + 2 Multigrain Rotis + Salad", calcium: 460, protein: 27, desc: "Celebratory Sunday lunch rich in bioavailable calcium" },
            { name: "Home-style Chicken / Mutton Bone Broth + Rice + Veggies", calcium: 440, protein: 32, desc: "Natural collagen, glycine, and bio-identical minerals" }
          ]
        },
        snack: {
          slot: "Evening Snack",
          time: "4:30 PM – 5:30 PM",
          currentOption: 0,
          options: [
            { name: "1 Cup Warm Spiced Haldi Milk with Crushed Almonds", calcium: 290, protein: 10, desc: "Calming anti-inflammatory evening ritual" },
            { name: "Fruit Salad with Chia Seeds & Fresh Mint", calcium: 150, protein: 5, desc: "Refreshing enzymes and hydration" }
          ]
        },
        dinner: {
          slot: "Dinner",
          time: "7:30 PM – 8:30 PM",
          currentOption: 0,
          options: [
            { name: "Yellow Moong Dal Soup + 2 Soft Phulkas + Cucumber Raita", calcium: 300, protein: 18, desc: "Light Sunday night reset for the week ahead" },
            { name: "Grilled Paneer & Veg Skewers with Mint Yogurt Dip", calcium: 380, protein: 24, desc: "High protein, zero heaviness" }
          ]
        }
      }
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 10: SIP INFORMATIONAL CARDS (MORNING / MIDDAY / EVENING / NIGHT)
  // --------------------------------------------------------------------------
  dailySipRoutine: [
    {
      id: "sip_morning",
      time: "07:00 AM – 08:30 AM",
      phase: "Morning Activation",
      icon: "fa-sun",
      headline: "Sunlight, Hydration & Balance Warm-Up",
      description: "Trigger cutaneous Vitamin D3 synthesis and prime neurological balance circuits.",
      color: "blue",
      items: [
        { id: "m_sun", text: "15 mins safe morning sunlight exposure (arms & legs unshielded)" },
        { id: "m_calcium", text: "1 glass warm water + 1 tbsp soaked sesame seeds (Til) or D3 supplement" },
        { id: "m_balance", text: "1 minute Tandem Balance stand while brushing teeth" }
      ]
    },
    {
      id: "sip_midday",
      time: "12:30 PM – 02:00 PM",
      phase: "Midday Nourishment",
      icon: "fa-utensils",
      headline: "3-2-1 Calcium & Protein Power Meal",
      description: "Deliver peak amino acids and 400mg+ calcium during optimal metabolic digestion window.",
      color: "pink",
      items: [
        { id: "md_diet", text: "Consume 3-2-1 lunch (Dal/Paneer/Fish + Green Veggies + 1 Bowl Curd)" },
        { id: "md_water", text: "Drink 500ml water (spaced 30 mins after meal to aid absorption)" },
        { id: "md_caffeine", text: "Avoid tea/coffee within 60 minutes of calcium intake" }
      ]
    },
    {
      id: "sip_evening",
      time: "05:00 PM – 06:30 PM",
      phase: "Evening Loading",
      icon: "fa-dumbbell",
      headline: "Weight-Bearing Strength & Bone Loading",
      description: "Mechanical load stimulates osteoblasts to lay down fresh bone mineral matrix.",
      color: "blue",
      items: [
        { id: "ev_exercise", text: "10-15 mins guided Sit-to-Stand chair squats + Heel-to-Toe walking" },
        { id: "ev_snack", text: "Post-workout high-protein snack (Roasted Chana / Greek Yogurt / Almonds)" },
        { id: "ev_posture", text: "Wall push-ups to decompress thoracic spine posture" }
      ]
    },
    {
      id: "sip_night",
      time: "09:00 PM – 10:30 PM",
      phase: "Night Defense",
      icon: "fa-moon",
      headline: "Restoration & Home Fall-Proof Check",
      description: "Support nocturnal bone remodeling while securing home environment against midnight slips.",
      color: "pink",
      items: [
        { id: "nt_milk", text: "1 glass warm fortified milk or calcium-magnesium night drink" },
        { id: "nt_safety", text: "Clear all pathway obstacles and ensure bathroom nightlight is active" },
        { id: "nt_sleep", text: "Aim for 7–8 hours restorative sleep (GH release for bone repair)" }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 11: EXERCISE LIBRARY + STEP-GUIDE + TRACKING
  // --------------------------------------------------------------------------
  exerciseLibrary: [
    {
      id: "ex_sit_to_stand",
      name: "Sit to Stand (Chair Squats)",
      category: "Lower Body Strength",
      targetMuscles: "Quadriceps, Glutes, Hamstrings",
      animType: "squat",
      femaleImg: "assets/exercises/female_chair_sit_down_up.mp4",
      maleImg: "assets/exercises/male_chair_sit_down_up.mp4",
      femalePoster: "assets/exercises/female_squat.gif",
      malePoster: "assets/exercises/male_squat.gif",
      biomechanics: "90° Knee Flexion · Hip Hinge · Upright Spine",
      why: "Builds functional leg power needed to rise independently without arm support and prevent collapsing during a trip.",
      reps: "10–12 Repetitions · 3 Sets",
      durationSec: 45,
      how: [
        "Sit on a sturdy dining chair with feet flat, hip-width apart.",
        "Cross arms over chest. Lean slightly forward from hips.",
        "Push down through your heels to stand completely upright without using hands.",
        "Pause for 1 second, then slowly lower yourself back down under control (3 seconds)."
      ]
    },
    {
      id: "ex_tandem_stand",
      name: "Tandem Stance (Heel-to-Toe Balance)",
      category: "Fall-Prevention Balance",
      targetMuscles: "Ankle Stabilizers, Proprioception, Core",
      animType: "balance",
      femaleImg: "assets/exercises/female_one_leg_balance.mp4",
      maleImg: "assets/exercises/male_one_leg_balance.mp4",
      femalePoster: "assets/exercises/female_balance.gif",
      malePoster: "assets/exercises/male_balance.gif",
      biomechanics: "Narrow Base of Support · Center of Gravity Alignment",
      why: "Narrows base of support to train vestibular and proprioceptive balance systems against unexpected tripping.",
      reps: "Hold 30s per leg · 2 Sets",
      durationSec: 60,
      how: [
        "Stand near a wall or kitchen counter for safety support if needed.",
        "Place your right foot directly in front of your left foot, touching right heel to left toes.",
        "Distribute weight evenly between both feet. Look forward at eye level.",
        "Hold steady for 30 seconds, then switch left foot in front."
      ]
    },
    {
      id: "ex_heel_toe_walk",
      name: "Heel-to-Toe Dynamic Walking",
      category: "Gait & Coordination",
      targetMuscles: "Tibialis Anterior, Calves, Pelvic Stabilizers",
      animType: "walk",
      femaleImg: "assets/exercises/female_stair_climbing.mp4",
      maleImg: "assets/exercises/male_stair_climbing.mp4",
      femalePoster: "assets/exercises/female_walk.gif",
      malePoster: "assets/exercises/male_walk.gif",
      biomechanics: "Dorsiflexion · Heel Strike · Ground Clearance",
      why: "Improves dynamic gait clearance so feet don't drag or catch on rugs, thresholds, and stairs.",
      reps: "20 Steps Forward & Back · 2 Sets",
      durationSec: 45,
      how: [
        "Pick an open hallway or unobstructed room pathway.",
        "Walk forward in a straight line, placing the heel of the front foot touching the toes of the back foot.",
        "Keep eyes looking ahead and posture tall.",
        "Take 10 steps forward, turn around carefully, and take 10 steps back."
      ]
    },
    {
      id: "ex_wall_pushups",
      name: "Wall Push-Ups & Spinal Extension",
      category: "Upper Body & Vertebral Defense",
      targetMuscles: "Pectorals, Triceps, Upper Back Extensors",
      animType: "pushup",
      femaleImg: "assets/exercises/female_band_pull.mp4",
      maleImg: "assets/exercises/male_band_pull.mp4",
      femalePoster: "assets/exercises/female_pushup.gif",
      malePoster: "assets/exercises/male_pushup.gif",
      biomechanics: "45° Elbow Tuck · Scapular Retraction · Core Plank",
      why: "Strengthens upper body to cushion falls and counteracts forward stoop (kyphosis) that strains thoracic vertebrae.",
      reps: "12–15 Repetitions · 2 Sets",
      durationSec: 45,
      how: [
        "Stand arm-length away facing a solid wall.",
        "Place palms flat on the wall at shoulder height and shoulder-width apart.",
        "Slowly bend elbows to bring chest towards the wall while keeping body in a straight plank.",
        "Push firmly back to starting position, squeezing shoulder blades together at the top."
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 12: PROTECT: THE ECONOMICS OF FALL PREVENTION
  // --------------------------------------------------------------------------
  protectNarrative: {
    headline: "The Economics of Fall Prevention",
    subtitle: "A 10-second fall can erase 10 years of bone building.",
    statHighlight: "95% of hip fractures result directly from a standing-height fall.",
    equation: "Fragile Bones (Osteoporosis) + Muscle Weakness (Sarcopenia) + Hazard = Fracture Disaster."
  },

  // --------------------------------------------------------------------------
  // MODULE 12B: PROTECT ASSESSMENT SCREENS (MATCHING IMAGES 2, 3, 4)
  // --------------------------------------------------------------------------
  protectPortfolioCards: [
    { title: "Balance", desc: "Strong legs, steady steps", img: "lotus" },
    { title: "Safe home", desc: "No rugs, clutter or dark corners", img: "house" },
    { title: "Good shoes", desc: "Grip soles, no loose slippers", img: "shoe" },
    { title: "Eyes & ears", desc: "Regular vision & hearing checks", img: "glasses" }
  ],

  boneRiskAuditFactors: [
    { id: "risk_fall", text: "Fell in the last year", img: "warning" },
    { id: "risk_unsteady", text: "Unsteady walking", img: "cane" },
    { id: "risk_dizziness", text: "Dizziness", img: "dizzy" },
    { id: "risk_fear", text: "Fear of falling", img: "fearful" },
    { id: "risk_vision", text: "Vision problems", img: "glasses" },
    { id: "risk_meds", text: "4+ daily medicines", img: "pill" }
  ],

  protectHomeAuditRooms: [
    {
      id: "room_bathroom",
      name: "Bathroom",
      img: "bathtub",
      icon: "fa-bath",
      headline: "The highest-risk room deserves the highest attention.",
      questions: [
        { id: "bath_grab", text: "Grab bars near toilet & shower?", tip: "Fit grab bars", fix: "Install wall-anchored grab bars inside the shower stall and next to the toilet (avoid holding towel racks)." },
        { id: "bath_mats", text: "Non-slip mats on the floor?", tip: "Use non-slip mats", fix: "Place heavy-duty suction rubber mats inside the bathing area and non-skid absorbent mats outside." },
        { id: "bath_light", text: "Bright light, even at night?", tip: "Add a night light", fix: "Install bright shadow-free lighting and a plug-in motion sensor night light for late-night bathroom trips." }
      ]
    },
    {
      id: "room_bedroom",
      name: "Bedroom",
      img: "bed",
      icon: "fa-bed",
      headline: "Clear pathways and immediate bedside visibility prevent morning and midnight falls.",
      questions: [
        { id: "bed_path", text: "Bed-to-door path free of rugs & cables?", tip: "Clear rugs & cables", fix: "Remove loose throw rugs, secure electrical cables with cord organizers, and keep a wide unobstructed walkway from bed to door." },
        { id: "bed_lamp", text: "Bedside light within reach?", tip: "Keep a lamp by your bed", fix: "Place a touch lamp or nightlight within easy arm's reach from the pillow to avoid walking in the dark." },
        { id: "bed_height", text: "Feet flat on floor when sitting on bed?", tip: "Adjust the bed height", fix: "Adjust bed height or mattress thickness so both feet rest flat and firmly on the floor when seated." }
      ]
    },
    {
      id: "room_stairs",
      name: "Stairs",
      img: "ladder",
      icon: "fa-stairs",
      headline: "Stairs require continuous grip and zero-shadow visibility.",
      questions: [
        { id: "stairs_rail", text: "Handrails on both sides?", tip: "Fit handrails on both sides", fix: "Mount sturdy, continuous handrails on both sides of the staircase extending beyond the top and bottom steps." },
        { id: "stairs_tread", text: "Non-slip, clutter-free steps?", tip: "Add non-slip strips to steps", fix: "Apply high-contrast non-slip adhesive treads on step edges and keep staircase fully free of clutter." },
        { id: "stairs_light", text: "Light switches at top & bottom?", tip: "Light switch at top & bottom", fix: "Install dual two-way light switches at both top and bottom landings so stairs are never used in darkness." }
      ]
    },
    {
      id: "room_kitchen",
      name: "Kitchen",
      img: "cooking",
      icon: "fa-kitchen-set",
      headline: "Keep frequently used items within natural arm reach.",
      questions: [
        { id: "kit_reach", text: "Daily items between waist & shoulder?", tip: "Keep daily items at waist height", fix: "Rearrange cabinets to store heavy cookware, dishes, and daily spices between waist and shoulder height." },
        { id: "kit_mats", text: "Non-skid mat near the sink?", tip: "Non-skid mat by the sink", fix: "Place cushioned rubber-backed non-skid floor mats directly in front of the sink and cooking stove." },
        { id: "kit_spills", text: "Spills wiped up right away?", tip: "Wipe spills at once", fix: "Keep a microfiber mop or cloth within reach to wipe water or oil spills immediately before stepping." }
      ]
    },
    {
      id: "room_living",
      name: "Living room",
      img: "couch",
      icon: "fa-couch",
      headline: "Wide unobstructed corridors allow relaxed, surefooted movement.",
      questions: [
        { id: "liv_rugs", text: "Loose rugs removed or taped?", tip: "Tape or remove loose rugs", fix: "Apply double-sided carpet tape to anchor all rug edges securely, or remove loose area rugs completely." },
        { id: "liv_cords", text: "Wires tucked along walls?", tip: "Tuck wires along walls", fix: "Route lamp and electronics cables behind furniture or fasten them neatly along baseboards." },
        { id: "liv_corridor", text: "Clear paths between furniture?", tip: "Clear the walking paths", fix: "Arrange coffee tables, chairs, and footrests to maintain wide unobstructed walking corridors." }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 15B: STRENGTHEN CLINICAL MEDICAL & BONE CARE DATA
  // --------------------------------------------------------------------------
  doctorReviewChecklist: [
    { id: "doc_risk", img: "target", text: "What is my fracture risk?", checked: true },
    { id: "doc_dxa", img: "xray", text: "What does my DXA score mean?", checked: true },
    { id: "doc_loss", img: "chart", text: "Am I losing bone faster than expected?", checked: true },
    { id: "doc_fracture", img: "bandage", text: "Have previous fractures changed my future risk?", checked: true },
    { id: "doc_strengthen", img: "biceps", text: "What can I do to strengthen my bones?", checked: true },
    { id: "doc_treatment", img: "pill", text: "Are additional treatment options right for me?", checked: false }
  ],

  dxaInterpretationGuide: {
    ranges: [
      { category: "Normal Bone Density", score: "T-Score above -1.0", minT: -1.0, maxT: 5.0, meaning: "Healthy bone mineral density. Maintain with daily 3-2-1 nutrition and progressive loading exercises.", color: "#1E9E62", icon: "shield", advice: "Continue routine diet and exercise. Rescan in 2 to 3 years." },
      { category: "Osteopenia (Low Bone Mass)", score: "T-Score between -1.0 and -2.5", minT: -2.5, maxT: -1.0, meaning: "Accelerated bone thinning detected. High responsiveness to proactive nutrition, Vitamin D3, and impact loading.", color: "#D97706", icon: "scale", advice: "Target 1,200 mg daily calcium + 1,000 IU D3. Repeat scan in 18 to 24 months." },
      { category: "Osteoporosis (High Fragility)", score: "T-Score below -2.5", minT: -5.0, maxT: -2.5, meaning: "Elevated fragility fracture state. Requires clinical physician partnership, fall-proofing, and targeted therapeutics.", color: "#B1315D", icon: "warning", advice: "Consult your doctor for prescription bone-sparing therapy. Rescan in 12 months." }
    ],
    scanSites: [
      { id: "spine", name: "Lumbar Spine (L1-L4)", desc: "Key indicator for trabecular bone loss and early post-menopausal thinning." },
      { id: "neck", name: "Femoral Neck", desc: "Gold standard site used in FRAX 10-year hip fracture risk calculation." },
      { id: "hip", name: "Total Hip", desc: "Reflects overall cortical and trabecular strength supporting body weight." }
    ]
  },

  fraxRiskFactorsCatalog: [
    { id: "prior_fracture", short: "Broke a bone before", text: "Prior Fragility Fracture (Adult)", weight: 1.85, img: "bandage", desc: "Any fracture from standing height or minor slip after age 40." },
    { id: "parent_hip", short: "Parent broke a hip", text: "Parental Hip Fracture History", weight: 1.60, img: "hearts", desc: "Mother or father suffered a broken hip." },
    { id: "steroid_use", short: "Steroid tablets", text: "Oral Steroids / Glucocorticoids", weight: 1.75, img: "pill", desc: "Prednisolone or similar steroids taken for more than 3 months." },
    { id: "rheumatoid", short: "Arthritis (RA)", text: "Rheumatoid Arthritis / Autoimmune", weight: 1.45, img: "stethoscope", desc: "Inflammatory joint conditions that accelerate bone resorption." }
  ],

  boneBiomarkersCatalog: [
    {
      id: "vit_d",
      short: "Vitamin D",
      img: "sun",
      name: "25-OH Vitamin D3",
      unit: "ng/mL",
      defaultVal: 24,
      min: 5,
      max: 100,
      ranges: [
        { label: "Deficient", status: "low", short: "Very low. Ask your doctor about D3 doses.", max: 20, color: "#DC2626", tip: "Requires 60,000 IU weekly clinical loading dose with milk for 8 weeks." },
        { label: "Suboptimal", status: "low", short: "A bit low. Get more sun and D3.", min: 20, max: 30, color: "#D97706", tip: "Increase daily D3 intake to 1,000–2,000 IU or take 60,000 IU every 2 weeks." },
        { label: "Optimal", status: "good", short: "Great level. Keep it up.", min: 30, max: 60, color: "#1E9E62", tip: "Ideal range for gut calcium absorption. Maintain with daily sun & maintenance dose." },
        { label: "Excess", status: "high", short: "Too high. Ask your doctor to lower the dose.", min: 60, color: "#8E2C6A", tip: "High blood level. Consult doctor to taper down high-dose supplements." }
      ]
    },
    {
      id: "calcium",
      short: "Calcium",
      img: "milk",
      name: "Serum Total Calcium",
      unit: "mg/dL",
      defaultVal: 9.4,
      min: 7.0,
      max: 12.0,
      ranges: [
        { label: "Low", status: "low", short: "Low. Check vitamin D and diet.", max: 8.5, color: "#D97706", tip: "Low serum calcium. Verify Vitamin D3, albumin, and daily dietary calcium intake." },
        { label: "Normal", status: "good", short: "Normal. Keep your 3-2-1 diet.", min: 8.5, max: 10.2, color: "#1E9E62", tip: "Normal circulating calcium equilibrium. Continue balanced 3-2-1 diet." },
        { label: "Elevated", status: "high", short: "High. Stop calcium tablets and see your doctor.", min: 10.2, color: "#DC2626", tip: "High calcium. Check Parathyroid Hormone (PTH) and avoid calcium supplements." }
      ]
    },
    {
      id: "alp",
      short: "ALP (bone turnover)",
      img: "barchart",
      name: "Serum Alkaline Phosphatase (ALP)",
      unit: "IU/L",
      defaultVal: 85,
      min: 30,
      max: 200,
      ranges: [
        { label: "Normal", status: "good", short: "Normal bone turnover.", min: 40, max: 129, color: "#1E9E62", tip: "Healthy baseline bone turnover." },
        { label: "Elevated", status: "high", short: "High. Your doctor should check it.", min: 130, color: "#D97706", tip: "High bone remodeling or liver activity. Correlate with bone-specific ALP & vitamin D." }
      ]
    },
    {
      id: "egfr",
      short: "Kidney (eGFR)",
      img: "kidney",
      name: "Kidney eGFR Filtration",
      unit: "mL/min",
      defaultVal: 75,
      min: 15,
      max: 120,
      ranges: [
        { label: "Reduced (<35)", status: "low", short: "Weak kidneys. Doctor must adjust bone medicines.", max: 35, color: "#DC2626", tip: "Impaired filtration. Bisphosphonates require doctor adjustment; evaluate Denosumab." },
        { label: "Moderate (35-59)", status: "low", short: "Slightly low. Drink enough water with medicines.", min: 35, max: 59, color: "#D97706", tip: "Mild-moderate reduction. Ensure adequate hydration with medications." },
        { label: "Normal (60+)", status: "good", short: "Kidneys are fine for bone medicines.", min: 60, color: "#1E9E62", tip: "Full renal clearance. Safe for standard oral or IV bone medications." }
      ]
    }
  ],

  supplementProtocolsCatalog: [
    {
      id: "thyroid_timing",
      title: "Thyroid & Calcium 4-Hour Spacing Rule",
      icon: "fa-clock",
      desc: "Levothyroxine / Thyroxine binds to calcium tablets and dairy products in the stomach, reducing thyroid medicine absorption by up to 50%.",
      rule: "Take thyroid medicine with plain water on an empty stomach at morning waking. Wait strictly AT LEAST 4 HOURS before taking any calcium tablet, milk, curd, or paneer."
    },
    {
      id: "calcium_types",
      title: "Calcium Citrate Malate (CCM) vs Calcium Carbonate",
      icon: "fa-pills",
      desc: "Choose the calcium formulation best suited for your stomach and digestion.",
      options: [
        { name: "Calcium Citrate Malate (CCM)", pros: "Highest bioavailability; gentle on stomach; does not require stomach acid; minimal constipation or gas; can be taken before or after food." },
        { name: "Calcium Carbonate", pros: "Highest elemental calcium per tablet (40%); requires stomach acid (must be taken with full meals); may cause mild constipation in sensitive individuals." }
      ]
    },
    {
      id: "d3_protocol",
      title: "Vitamin D3 Loading vs Maintenance Protocol",
      icon: "fa-sun",
      desc: "Vitamin D3 is fat-soluble and requires dietary lipids for absorption.",
      rule: "For deficiency (<20 ng/mL): 60,000 IU weekly sachet or capsule taken with milk or fatty meal for 8 consecutive weeks, followed by 60,000 IU once every month as maintenance."
    }
  ],

  prescriptionTherapiesCatalog: [
    {
      id: "antiresorptives",
      short: "Stops bone loss",
      img: "shield",
      rulesShort: [
        { icon: "💧", text: "Full glass of plain water" },
        { icon: "🧍", text: "Stay upright for 30 min" },
        { icon: "⏰", text: "Eat after 30–60 min" }
      ],
      category: "Antiresorptive Agents (Bone Preservation)",
      badge: "Slows Bone Breakdown",
      medicines: "Alendronate (70mg weekly), Risedronate, Zoledronic Acid (5mg yearly IV infusion), Denosumab (60mg 6-monthly subQ)",
      howItWorks: "Inhibits osteoclast cells to prevent rapid bone resorption, stabilizing bone mineral density and cutting spine/hip fracture risk.",
      goldenRules: [
        "Take oral weekly bisphosphonates first thing in the morning with a full 250ml glass of plain water.",
        "Stay strictly upright (sitting or standing) for at least 30 minutes. Never lie down to prevent heartburn.",
        "Wait 30 to 60 minutes before having morning tea, breakfast, or any other supplements."
      ]
    },
    {
      id: "anabolics",
      short: "Builds new bone",
      img: "seedling",
      rulesShort: [
        { icon: "💉", text: "One shot daily, same time" },
        { icon: "❄️", text: "Keep the pen in the fridge" }
      ],
      category: "Anabolic Bone Builders (New Bone Formation)",
      badge: "Builds Brand New Bone",
      medicines: "Teriparatide (recombinant human PTH 1-34 daily subcutaneous injection)",
      howItWorks: "Directly stimulates osteoblasts to generate new trabecular bone architecture. Indicated for severe osteoporosis or recurrent fractures.",
      goldenRules: [
        "Administer once daily at the same time into thigh or abdominal subcutaneous tissue.",
        "Store pen in refrigerator (2°C to 8°C). Keep adequate calcium and vitamin D intake during course."
      ]
    }
  ],

  safeMovementFlashcards: [
    {
      id: "lift",
      title: "Picking things up",
      dont: "Bend at the waist",
      do: "Bend knees, back straight",
      activity: "Picking Objects From Floor",
      danger: "Bending forward from waist with straight knees (creates massive compressive torque on lumbar vertebrae).",
      safe: "Use the Hip-Hinge or Golfer's Lift — bend hips and knees while keeping spine elongated and straight.",
      img: "biceps"
    },
    {
      id: "bed",
      title: "Getting out of bed",
      dont: "Sit straight up",
      do: "Roll to your side, push up",
      activity: "Getting In & Out of Bed",
      danger: "Sitting straight up like a crunch (flexes fragile vertebrae under morning body weight).",
      safe: "Use the Log-Roll technique — roll onto your side first, swing legs off edge, and push torso up with arms.",
      img: "bed"
    },
    {
      id: "reach",
      title: "Reaching up high",
      dont: "Stretch on tiptoes",
      do: "Use a sturdy step-stool",
      activity: "Reaching Overhead Items",
      danger: "Stretching on tiptoes with hyperextended lower back while holding heavy objects.",
      safe: "Use a wide sturdy step-stool so the item stays between chest and eye level before gripping.",
      img: "ladder"
    },
    {
      id: "twist",
      title: "Sweeping & chores",
      dont: "Twist your back",
      do: "Turn with your feet",
      activity: "Sweeping & House Chores",
      danger: "Rapid spinal twisting while leaning forward with a broom or mop.",
      safe: "Step with your feet to turn the entire body facing the direction of movement instead of twisting the spine.",
      img: "house"
    }
  ],

  emergencyFallSteps: [
    { step: 1, icon: "😮‍💨", short: "Stay calm. Breathe and check for pain.", title: "Stay Calm & Assess", desc: "Do not rush to stand up. Take deep breaths for 60 seconds and check for severe hip, groin, or wrist pain." },
    { step: 2, icon: "🦵", short: "Leg looks short or turned out? Don’t move. Call for help.", title: "Check Leg Alignment", desc: "Look at your legs. If one leg appears noticeably shorter or turned outward with sharp hip pain, do not force movement." },
    { step: 3, icon: "🔄", short: "Roll to your side, then onto hands and knees.", title: "Roll to Hands & Knees", desc: "If uninjured, slowly roll onto your side, bend your knees, and push up onto your hands and knees." },
    { step: 4, icon: "🪑", short: "Crawl to a sturdy chair and push up to sit.", title: "Crawl to Sturdy Support", desc: "Crawl to a heavy chair or bed, place both hands on the seat, bring one foot flat on floor, and push up to sit." }
  ],

  // --------------------------------------------------------------------------
  // MODULE 13: HOME SAFETY AUDIT (5 ROOMS, MULTI-QUESTION)
  // --------------------------------------------------------------------------
  homeSafetyAuditRooms: [
    {
      id: "room_bathroom",
      name: "Bathroom",
      img: "bathtub",
      icon: "fa-bath",
      weight: 25,
      questions: [
        { id: "bath_1", text: "Are non-slip rubber mats installed inside the shower/tub and outside on the floor?" },
        { id: "bath_2", text: "Are securely anchored grab bars mounted near the toilet and inside shower area?" },
        { id: "bath_3", text: "Is there a nightlight or illuminated switch so you never walk in darkness?" },
        { id: "bath_4", text: "Is the bathroom floor kept completely dry and free from puddles or soap slick?" }
      ]
    },
    {
      id: "room_bedroom",
      name: "Bedroom",
      img: "bed",
      icon: "fa-bed",
      weight: 20,
      questions: [
        { id: "bed_1", text: "Is the pathway from bed to bathroom completely clear of wires, clothes, and shoes?" },
        { id: "bed_2", text: "Can you reach a bedside lamp without twisting or getting out of bed in the dark?" },
        { id: "bed_3", text: "Is bed height set so your feet touch the floor flat when sitting on the edge?" }
      ]
    },
    {
      id: "room_stairs",
      name: "Stairs & Hallways",
      icon: "fa-stairs",
      weight: 25,
      questions: [
        { id: "stairs_1", text: "Are sturdy handrails installed on both sides of every staircase?" },
        { id: "stairs_2", text: "Are stair treads uniform, non-slip, and free from clutter or stored items?" },
        { id: "stairs_3", text: "Is the entire staircase brightly lit with zero-shadow illumination at top and bottom?" }
      ]
    },
    {
      id: "room_kitchen",
      name: "Kitchen",
      img: "cooking",
      icon: "fa-kitchen-set",
      weight: 15,
      questions: [
        { id: "kitchen_1", text: "Are frequently used pans, plates, and groceries stored between waist and eye level?" },
        { id: "kitchen_2", text: "Is a non-skid anti-fatigue mat placed near the sink and prep counter?" },
        { id: "kitchen_3", text: "Are liquid spills and oil drops wiped up immediately with a dry mop?" }
      ]
    },
    {
      id: "room_living",
      name: "Living Room",
      icon: "fa-couch",
      weight: 15,
      questions: [
        { id: "living_1", text: "Are all electrical cords, chargers, and TV cables tucked firmly against walls?" },
        { id: "living_2", text: "Are loose throw rugs removed or taped down with heavy-duty double-sided backing?" },
        { id: "living_3", text: "Is furniture arranged to provide wide, unobstructed walking corridors?" }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 15: STRENGTHEN: INFORMATIONAL CONTENT (DXA/BMD & DOCTOR CHECKLIST)
  // --------------------------------------------------------------------------
  dxaInterpretationGuide: {
    title: "Understanding Your DXA Bone Mineral Density (BMD) T-Score",
    description: "A DXA scan measures grams of calcium mineral per square centimeter of bone compared to a healthy 30-year-old reference standard.",
    ranges: [
      { score: "T-Score > -1.0", category: "Normal Bone Density", meaning: "Healthy bone bank. Continue daily 3-2-1 nutrition and strength maintenance.", badge: "badge-blue" },
      { score: "T-Score between -1.0 and -2.5", category: "Osteopenia (Low Bone Mass)", meaning: "Accelerated bone thinning detected. High responsiveness to daily BONE SIP lifestyle and D3 intervention.", badge: "badge-blue" },
      { score: "T-Score < -2.5", category: "Osteoporosis", meaning: "Fragility state with elevated fracture risk. Requires clinical physician partnership, fall-proofing, and targeted therapeutics.", badge: "badge-pink" }
    ]
  },

  doctorReviewQuestions: [
    {
      id: "doc_1",
      question: "“Based on my age, lifestyle, and risk profile, is it time for a baseline DXA scan?”",
      clinicalRationale: "A dual-energy X-ray absorptiometry (DXA) scan is the gold standard for measuring spine and hip bone mineral density before a fracture occurs."
    },
    {
      id: "doc_2",
      question: "“What is my FRAX 10-year probability of suffering a major osteoporotic fracture?”",
      clinicalRationale: "The FRAX tool integrates clinical risk factors (age, family history, smoking, steroids) with BMD to compute exact 10-year fracture probabilities."
    },
    {
      id: "doc_3",
      question: "“Could any of my current medications (e.g., antacids, steroids) be depleting my bone density?”",
      clinicalRationale: "Long-term proton pump inhibitors (PPIs) and corticosteroids can silently decrease calcium absorption and accelerate osteoclast resorption."
    },
    {
      id: "doc_4",
      question: "“What are my current serum 25(OH) Vitamin D and Calcium levels?”",
      clinicalRationale: "Clinical blood work ensures accurate dosage adjustments for Vitamin D3 and dietary calcium absorption."
    },
    {
      id: "doc_5",
      question: "“Do any of my medications cause dizziness, orthostatic hypotension, or increase fall risk?”",
      clinicalRationale: "Blood pressure medications and sedatives can cause sudden balance loss when standing up quickly."
    },
    {
      id: "doc_6",
      question: "“Are lifestyle modifications sufficient right now, or do I require bone-preserving prescription therapies?”",
      clinicalRationale: "For high-risk osteoporotic patients, antiresorptive or anabolic bone agents may be necessary alongside BONE SIP."
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 16: WHATSAPP/EMAIL REMINDER ENGINE (SKIP DETECTION + TRIGGERS)
  // --------------------------------------------------------------------------
  whatsappTemplates: [
    {
      id: "rem_morning",
      time: "07:00 AM",
      title: "Morning Sun & Hydration Trigger",
      text: "☀️ *Good Morning from BONE SIP!*\n\nYour bones are ready for their morning deposit. Step into 15 minutes of safe sunlight, take your sesame seeds/Vitamin D, and do your 1-minute tandem balance stance while brushing teeth.\n\n👉 Open Daily SIP: https://bonesip.app/tracker",
      channel: "WhatsApp & Push"
    },
    {
      id: "rem_skip_morning",
      time: "11:00 AM",
      title: "Smart Skip-Detection Nudge",
      text: "⚠️ *BONE SIP Habit Check-in*\n\nWe noticed you haven't checked off your Morning Activation yet. Don't let your bone bank miss today's deposit! Even a quick 5-minute stretch and water break counts.\n\n👉 Mark Morning SIP Done: https://bonesip.app/tracker",
      channel: "Smart Skip Alert"
    },
    {
      id: "rem_midday",
      time: "12:45 PM",
      title: "3-2-1 Nutrition Reminder",
      text: "🥗 *Lunchtime Bone Deposit Alert!*\n\nRemember the 3-2-1 rule for lunch: Aim for a calcium-rich serving (curd/paneer) and solid protein (dal/egg/fish). Space tea and coffee at least 1 hour away for optimal calcium absorption!\n\n👉 View Today's Menu: https://bonesip.app/nutrition",
      channel: "WhatsApp & Push"
    },
    {
      id: "rem_evening",
      time: "05:15 PM",
      title: "Evening Loading Workout",
      text: "🏋️ *Time for 10 Minutes of Bone Loading!*\n\nKeep your legs strong and fall-resistant. Complete your 3 sets of Sit-to-Stand squats and Heel-to-Toe walking today.\n\n👉 Start Guided Workout: https://bonesip.app/exercises",
      channel: "WhatsApp & Push"
    },
    {
      id: "rem_night",
      time: "09:15 PM",
      title: "Nighttime Recovery & Hazard Check",
      text: "🌙 *Night SIP & Home Safety*\n\nWind down with warm milk or calcium snack. Before heading to sleep, make sure the pathway to the bathroom is completely clear and the nightlight is ON.\n\nStay safe and independent tomorrow!\n👉 Check Off Today's Streak: https://bonesip.app/tracker",
      channel: "WhatsApp & Email"
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 17: EXPANDED 100+ REGIONAL & DIETARY FOOD REPERTOIRE WITH MEAL SWAPS
  // Covers: North, South, West, East, Coastal/Global across Veg, Egg, Non-Veg, Vegan
  // --------------------------------------------------------------------------
  fullDietCatalog: [
    // --- NORTH INDIAN VEGETARIAN ---
    { id: "fd_n_v_1", name: "Paneer Paratha (1 whole wheat) + Fresh Mint Curd (1 bowl)", region: "north", diet: "veg", slot: "breakfast", calcium: 390, protein: 20, desc: "Dense bioavailable milk calcium with complex whole-wheat carbs" },
    { id: "fd_n_v_2", name: "Ragi-Atta (50:50) Methi Missi Roti + 1 Bowl Spiced Curd", region: "north", diet: "veg", slot: "breakfast", calcium: 360, protein: 17, desc: "Fenugreek greens rich in trace minerals paired with finger millet" },
    { id: "fd_n_v_3", name: "Besan Chilla stuffed with Crumbled Cottage Cheese & Spinach", region: "north", diet: "veg", slot: "breakfast", calcium: 340, protein: 21, desc: "Gram flour lysine and paneer calcium synergy" },
    { id: "fd_n_v_4", name: "Moong Dal & Vegetable Khichdi + Roasted Sesame Curd", region: "north", diet: "veg", slot: "breakfast", calcium: 310, protein: 16, desc: "Easily digestible gut-friendly breakfast with sesame seed boost" },
    { id: "fd_n_v_5", name: "Palak Paneer (High Spinach & Cottage Cheese) + 2 Phulkas", region: "north", diet: "veg", slot: "lunch", calcium: 460, protein: 25, desc: "Spinach carotenoids blended with calcium-dense curd paneer" },
    { id: "fd_n_v_6", name: "Rajma (Red Kidney Beans) Curry + Jeera Rice + Cucumber Raita", region: "north", diet: "veg", slot: "lunch", calcium: 380, protein: 22, desc: "Slow-digestible plant protein and probiotic raita" },
    { id: "fd_n_v_7", name: "Sarson Ka Saag (Mustard Greens) + 1 Makki Roti + White Butter", region: "north", diet: "veg", slot: "lunch", calcium: 420, protein: 16, desc: "Classic winter calcium powerhouse from brassica greens" },
    { id: "fd_n_v_8", name: "Chana Dal Tadka with Drumstick Pods + 2 Multigrain Rotis", region: "north", diet: "veg", slot: "lunch", calcium: 390, protein: 23, desc: "High fiber and bone-building magnesium and potassium" },
    { id: "fd_n_v_9", name: "Roasted White Sesame (Til) Chikki with Jaggery (2 squares)", region: "north", diet: "veg", slot: "snack", calcium: 230, protein: 7, desc: "Traditional Indian superfood with 975mg Ca per 100g density" },
    { id: "fd_n_v_10", name: "Roasted Makhana (Foxnuts) with Turmeric & Himalayan Pink Salt", region: "north", diet: "veg", slot: "snack", calcium: 180, protein: 8, desc: "Zero cholesterol, high magnesium snack to activate bone enzymes" },
    { id: "fd_n_v_11", name: "Warm Badam (Almond) Kesar Milk with 10 Crushed Soaked Almonds", region: "north", diet: "veg", slot: "snack", calcium: 310, protein: 11, desc: "Natural vitamin E and liquid calcium before evening routine" },
    { id: "fd_n_v_12", name: "Spiced Masala Chaas (Buttermilk) with Roasted Cumin & Mint", region: "north", diet: "veg", slot: "snack", calcium: 220, protein: 7, desc: "Hydrating probiotic electrolyte drink to boost gut absorption" },
    { id: "fd_n_v_13", name: "Methi Paneer Bhurji + 2 Whole Wheat Phulkas + Sprouted Salad", region: "north", diet: "veg", slot: "dinner", calcium: 410, protein: 26, desc: "Nighttime continuous casein release to support nocturnal bone repair" },
    { id: "fd_n_v_14", name: "Lauki (Bottle Gourd) Chana Dal + 2 Multigrain Rotis", region: "north", diet: "veg", slot: "dinner", calcium: 290, protein: 18, desc: "Alkaline hydration paired with pulse protein" },
    { id: "fd_n_v_15", name: "Kadhi Pakora (Gram Flour Dumplings in Curd Curry) + Rice", region: "north", diet: "veg", slot: "dinner", calcium: 350, protein: 17, desc: "Rich sour curd calcium base with turmeric digestive aid" },

    // --- NORTH INDIAN EGGETARIAN & NON-VEG ---
    { id: "fd_n_nv_1", name: "2 Whole Boiled Eggs + Whole Wheat Toast + 1 Glass Cow Milk", region: "north", diet: "eggetarian", slot: "breakfast", calcium: 360, protein: 23, desc: "Complete amino acid profile with bioavailable yolk Vitamin D" },
    { id: "fd_n_nv_2", name: "Anda Bhurji (Scrambled Spiced Eggs with Onions & Spinach) + Toast", region: "north", diet: "eggetarian", slot: "breakfast", calcium: 320, protein: 21, desc: "High biological value egg albumin paired with leafy greens" },
    { id: "fd_n_nv_3", name: "Tariwali Desi Chicken Curry + 2 Phulkas + Onion Salad", region: "north", diet: "non_veg", slot: "lunch", calcium: 310, protein: 32, desc: "Lean poultry protein essential for collagen scaffolding" },
    { id: "fd_n_nv_4", name: "Slow-Simmered Mutton Nalli Nihari Bone Broth + 1 Roti", region: "north", diet: "non_veg", slot: "dinner", calcium: 380, protein: 34, desc: "Natural Type-I collagen, hyaluronic acid and bone gelatin" },
    { id: "fd_n_nv_5", name: "Punjabi Egg Curry + 2 Whole Wheat Rotis + Kachumber Salad", region: "north", diet: "eggetarian", slot: "dinner", calcium: 330, protein: 22, desc: "Balanced evening protein with egg yolk choline and phosphorus" },

    // --- SOUTH INDIAN VEGETARIAN ---
    { id: "fd_s_v_1", name: "Ragi Dosa (Finger Millet Crepe) + Drumstick Sambar + Coconut Chutney", region: "south", diet: "veg", slot: "breakfast", calcium: 420, protein: 16, desc: "Ragi contains over 340mg calcium per 100g, highest among all grains" },
    { id: "fd_s_v_2", name: "Steamed Idlis (3 pcs) with Drumstick Pod Sambar + Flaxseed Podi", region: "south", diet: "veg", slot: "breakfast", calcium: 370, protein: 17, desc: "Naturally fermented batter improves bioavailability of bone minerals" },
    { id: "fd_s_v_3", name: "Pesarattu (Whole Green Moong Dosa) with Thick Ginger Curd", region: "south", diet: "veg", slot: "breakfast", calcium: 340, protein: 20, desc: "Unpolished green gram providing zinc, folate, and calcium" },
    { id: "fd_s_v_4", name: "Ragi Mudde (Steamed Millet Ball) + Drumstick Keerai (Moringa) Sambar", region: "south", diet: "veg", slot: "lunch", calcium: 520, protein: 22, desc: "The ultimate traditional South Indian bone capital powerhouse" },
    { id: "fd_s_v_5", name: "Curd Rice with Pomegranate Seeds, Curry Leaves & Mustard Tempering", region: "south", diet: "veg", slot: "lunch", calcium: 410, protein: 15, desc: "High gut microbiome diversity to maximize intestinal calcium transport" },
    { id: "fd_s_v_6", name: "Vazhaipoo (Banana Flower) & Chana Dal Poriyal + Rice + Rasam", region: "south", diet: "veg", slot: "lunch", calcium: 340, protein: 18, desc: "Rich in plant lignans and polyphenols that slow bone resorption" },
    { id: "fd_s_v_7", name: "Sundal (Tempered Boiled White Peas / Kabuli Chana with Coconut)", region: "south", diet: "veg", slot: "snack", calcium: 190, protein: 12, desc: "Oil-free protein snack packed with magnesium and potassium" },
    { id: "fd_s_v_8", name: "Ragi Kanji (Warm Porridge with Buttermilk, Curry Leaves & Shallots)", region: "south", diet: "veg", slot: "snack", calcium: 380, protein: 11, desc: "Cooling afternoon elixir with 400mg natural bone-building minerals" },
    { id: "fd_s_v_9", name: "Roasted White Sesame & Jaggery Urundai (Ladoo)", region: "south", diet: "veg", slot: "snack", calcium: 240, protein: 7, desc: "Traditional South Indian festive treat high in concentrated calcium" },
    { id: "fd_s_v_10", name: "Horsegram (Kollu) Rasam + Rice + Cabbage & Coconut Poriyal", region: "south", diet: "veg", slot: "dinner", calcium: 360, protein: 18, desc: "Highest calcium among all pulses with warm winter thermogenic warmth" },
    { id: "fd_s_v_11", name: "Adai (Multi-Lentil Protein Pancake) with Avial (Veg Yogurt Stew)", region: "south", diet: "veg", slot: "dinner", calcium: 410, protein: 24, desc: "Four-dal protein foundation with coconut curd vegetable medley" },

    // --- SOUTH INDIAN EGGETARIAN & NON-VEG ---
    { id: "fd_s_nv_1", name: "Egg Dosa with Drumstick Sambar & Tomato Chutney", region: "south", diet: "eggetarian", slot: "breakfast", calcium: 340, protein: 20, desc: "Fermented rice-dal crepe layered with whole egg protein" },
    { id: "fd_s_nv_2", name: "Chettinad Fish Curry with Small Steamed Fish + Red Rice", region: "south", diet: "non_veg", slot: "lunch", calcium: 480, protein: 32, desc: "Small sea fish eaten with soft bones deliver direct natural calcium" },
    { id: "fd_s_nv_3", name: "Nethili Meen (Anchovy) Pepper Fry with Rasam Rice", region: "south", diet: "non_veg", slot: "lunch", calcium: 530, protein: 34, desc: "Anchovies are nature's densest edible bone mineral source" },
    { id: "fd_s_nv_4", name: "Kerala Style Chicken Stew with Coconut Milk & Appams", region: "south", diet: "non_veg", slot: "dinner", calcium: 310, protein: 28, desc: "Gentle lean protein stew supporting overnight collagen rebuilding" },

    // --- WEST & CENTRAL INDIAN (MAHARASHTRIAN & GUJARATI) ---
    { id: "fd_w_v_1", name: "Bajra (Pearl Millet) Bhakri + Methi Pithla (Gram Flour Curry)", region: "west", diet: "veg", slot: "breakfast", calcium: 410, protein: 18, desc: "Millet iron and chickpea flour magnesium to balance calcium uptake" },
    { id: "fd_w_v_2", name: "Methi Thepla (2 pcs) with Fresh Yogurt & Chhundo", region: "west", diet: "veg", slot: "breakfast", calcium: 360, protein: 15, desc: "Fenugreek greens baked into whole wheat with probiotic curd" },
    { id: "fd_w_v_3", name: "Khaman Dhokla with Mint Chaas & Roasted Mustard Tempering", region: "west", diet: "veg", slot: "breakfast", calcium: 290, protein: 16, desc: "Steamed fermented legume snack, zero trans fat, gut soothing" },
    { id: "fd_w_v_4", name: "Jowar (Sorghum) Bhakri + Sprouted Moong Matki Usal + Chaas", region: "west", diet: "veg", slot: "lunch", calcium: 430, protein: 24, desc: "Bioavailable sprouted pulse enzymes with high potassium sorghum" },
    { id: "fd_w_v_5", name: "Gujarati Dal with Drumsticks & Peanuts + Rice + Palak Sabzi", region: "west", diet: "veg", slot: "lunch", calcium: 390, protein: 21, desc: "Tangy sweet toor dal enhanced with drumstick pod marrow" },
    { id: "fd_w_v_6", name: "Maharashtrian Til-Gul Ladoo with Roasted Peanuts & Jaggery", region: "west", diet: "veg", slot: "snack", calcium: 260, protein: 8, desc: "Traditional bone-dense winter staple honoring sesame mineral power" },
    { id: "fd_w_v_7", name: "Nachni (Finger Millet) Satva Porridge with Nutmeg & Warm Milk", region: "west", diet: "veg", slot: "snack", calcium: 370, protein: 13, desc: "Gentle digestive comfort drink with deep mineral density" },
    { id: "fd_w_v_8", name: "Spiced Masala Peanut Chaat with Lemon Juice & Coriander", region: "west", diet: "veg", slot: "snack", calcium: 150, protein: 11, desc: "High arginine protein snack supporting human growth hormone release" },
    { id: "fd_w_v_9", name: "Moong Dal Khichdi + Roasted Papad + Curd + Dudhi Kheer", region: "west", diet: "veg", slot: "dinner", calcium: 350, protein: 19, desc: "Comforting evening dinner supporting peaceful rest and bone repair" },
    { id: "fd_w_v_10", name: "Paneer & Green Pea Bhurji + 2 Jowar Rotis + Tomato Salad", region: "west", diet: "veg", slot: "dinner", calcium: 420, protein: 25, desc: "Sorghum fiber paired with dairy calcium for slow overnight release" },

    // --- WEST & CENTRAL INDIAN NON-VEG ---
    { id: "fd_w_nv_1", name: "Kolhapuri Style Egg Curry with Bajra Bhakri", region: "west", diet: "eggetarian", slot: "dinner", calcium: 380, protein: 26, desc: "Robust rustic spices paired with pearl millet calcium" },
    { id: "fd_w_nv_2", name: "Malvani Fish Curry (Pomfret / Surmai) with Steamed Rice", region: "west", diet: "non_veg", slot: "lunch", calcium: 420, protein: 32, desc: "Omega-3 fatty acids lower systemic inflammatory osteoclast activity" },

    // --- EAST & NORTH-EAST INDIAN ---
    { id: "fd_e_v_1", name: "Chhena (Fresh Cow Milk Cottage Cheese) with Wild Honey & Almonds", region: "east", diet: "veg", slot: "breakfast", calcium: 380, protein: 19, desc: "Pure fresh casein curd with highest biological availability" },
    { id: "fd_e_v_2", name: "Sattu (Roasted Gram Flour) Sherbet with Cumin, Lemon & Mint", region: "east", diet: "veg", slot: "breakfast", calcium: 210, protein: 18, desc: "Instant cooling superfood packed with insoluble fiber and plant protein" },
    { id: "fd_e_v_3", name: "Dalma (Lentil stew with Raw Papaya, Pumpkin & Drumstick) + Rice", region: "east", diet: "veg", slot: "lunch", calcium: 390, protein: 20, desc: "Traditional Odia medicinal stew packed with vegetable minerals" },
    { id: "fd_e_v_4", name: "Posto Bora (Poppy Seed Fritters) + Biulir (Urad) Dal + Rice", region: "east", diet: "veg", slot: "lunch", calcium: 490, protein: 22, desc: "Poppy seeds are the world's richest plant calcium source (1400mg/100g)" },
    { id: "fd_e_v_5", name: "Shorshe Palak & Chana Dal (Spinach with Mustard Paste)", region: "east", diet: "veg", slot: "dinner", calcium: 360, protein: 18, desc: "Isothiocyanates from mustard seed pair with spinach folate" },
    { id: "fd_e_v_6", name: "Soyabean & Black Sesame Tarkari + 2 Rotis", region: "east", diet: "veg", slot: "dinner", calcium: 440, protein: 27, desc: "Dual plant calcium synergy popular across Assam & Manipur" },

    // --- EAST & NORTH-EAST NON-VEG ---
    { id: "fd_e_nv_1", name: "Macher Jhol (Small Mourala / Rohu Fish with Bones) + Rice", region: "east", diet: "non_veg", slot: "lunch", calcium: 510, protein: 34, desc: "Whole small freshwater fish eaten with soft bones provides complete hydroxyapatite" },
    { id: "fd_e_nv_2", name: "Dim Shorshe (Egg Curry in Pungent Mustard Gravy) + Rice", region: "east", diet: "eggetarian", slot: "dinner", calcium: 350, protein: 23, desc: "Mustard calcium combined with high albumin egg protein" },

    // --- COASTAL & CONTINENTAL / GLOBAL ---
    { id: "fd_c_v_1", name: "Greek Yogurt Bowl with Chia Seeds, Walnuts & Sliced Figs", region: "continental", diet: "veg", slot: "breakfast", calcium: 440, protein: 22, desc: "Double strained Greek yogurt with concentrated mineral solids" },
    { id: "fd_c_v_2", name: "Tofu Scramble with Bell Peppers, Baby Spinach & Multigrain Toast", region: "continental", diet: "vegan", slot: "breakfast", calcium: 410, protein: 24, desc: "Calcium sulfate set tofu delivers equal calcium to dairy paneer" },
    { id: "fd_c_v_3", name: "Chia Seed Overnight Pudding in Fortified Almond Milk with Berries", region: "continental", diet: "vegan", slot: "breakfast", calcium: 380, protein: 14, desc: "Chia seeds expand with mucilage and absorb 600mg plant calcium" },
    { id: "fd_c_v_4", name: "Mediterranean Hummus Bowl with Roasted Chickpeas & Tahini Sesame", region: "continental", diet: "vegan", slot: "lunch", calcium: 390, protein: 21, desc: "Tahini sesame paste is dense in bone-mineralizing copper and calcium" },
    { id: "fd_c_v_5", name: "Warm Edamame & Steamed Broccoli Salad with Roasted Sesame Oil", region: "continental", diet: "vegan", slot: "lunch", calcium: 370, protein: 23, desc: "Phytoestrogen isoflavones that support osteoblast bone formation" },
    { id: "fd_c_v_6", name: "Fortified Soy Milk Golden Turmeric Latte", region: "continental", diet: "vegan", slot: "snack", calcium: 320, protein: 10, desc: "Fortified with Vitamin D2 and tricalcium phosphate" },
    { id: "fd_c_v_7", name: "Handful Raw Brazil Nuts, Almonds & Dried Black Raisins", region: "continental", diet: "vegan", slot: "snack", calcium: 210, protein: 8, desc: "High selenium to protect bone marrow cells from oxidative stress" },
    { id: "fd_c_v_8", name: "Grilled Herb Salmon Fillet with Asparagus & Mashed Sweet Potato", region: "continental", diet: "non_veg", slot: "dinner", calcium: 420, protein: 36, desc: "Natural marine Vitamin D3 and long-chain EPA/DHA" },
    { id: "fd_c_v_9", name: "Canned Sardines in Tomato Gravy on Sourdough (Eaten with soft bones)", region: "continental", diet: "non_veg", slot: "dinner", calcium: 540, protein: 38, desc: "Single highest calcium seafood portion in global clinical literature" },


    // --- ADDITIONAL NORTH INDIAN POWER DISHES ---
    { id: "fd_n_v_16", name: "Soya Chaap Tikka in Low-Fat Yogurt Gravy + 2 Whole Wheat Rotis", region: "north", diet: "veg", slot: "dinner", calcium: 390, protein: 28, desc: "High density phytoestrogens that bond onto bone estrogen receptors" },
    { id: "fd_n_v_17", name: "Bathua (Chenopodium) Raita + Sprouted Kala Chana Chaat", region: "north", diet: "veg", slot: "snack", calcium: 280, protein: 14, desc: "Ancient leafy green exceptionally concentrated in iron, magnesium, and calcium" },
    { id: "fd_n_v_18", name: "Methi Matar Malai (Low Cream Curd Base) + Multigrain Phulkas", region: "north", diet: "veg", slot: "lunch", calcium: 410, protein: 19, desc: "Bitter fenugreek minerals tempered with green pea plant protein" },
    { id: "fd_n_v_19", name: "Dry Roasted White Til (Sesame) & Jaggery Ladoo (2 pcs)", region: "north", diet: "veg", slot: "snack", calcium: 240, protein: 7, desc: "Fast afternoon mineral boost providing bioavailable zinc and calcium" },
    { id: "fd_n_v_20", name: "Shalgam (Turnip Greens) Saag + 2 Makki Roti + Chaas", region: "north", diet: "veg", slot: "lunch", calcium: 390, protein: 15, desc: "Brassica family glucosinolates paired with maize calcium" },
    { id: "fd_n_nv_6", name: "Desi Chicken Saagwala (Chicken simmered in Spinach & Mustard Greens)", region: "north", diet: "non_veg", slot: "dinner", calcium: 420, protein: 35, desc: "Synergy of poultry collagen building blocks and leafy carotenoid antioxidants" },
    { id: "fd_n_nv_7", name: "Spicy Egg Curry with 2 Hard Boiled Eggs + Steamed Brown Rice", region: "north", diet: "eggetarian", slot: "lunch", calcium: 320, protein: 22, desc: "Bioavailable egg yolk lutein and phosphorus supporting mineral bone matrix" },

    // --- ADDITIONAL SOUTH INDIAN POWER DISHES ---
    { id: "fd_s_v_12", name: "Murungai Keerai (Moringa Leaf) Kootu with Moong Dal + Brown Rice", region: "south", diet: "veg", slot: "lunch", calcium: 490, protein: 21, desc: "Moringa leaves carry 4x more calcium than cow milk gram-for-gram" },
    { id: "fd_s_v_13", name: "Kollu (Horsegram) Thogayal + Steamed Red Rice + Ghee", region: "south", diet: "veg", slot: "lunch", calcium: 380, protein: 19, desc: "Ancient Tamil Siddha legume known as the strongest bone-densifying pulse" },
    { id: "fd_s_v_14", name: "Ragi Idiyappam (String Hoppers) with Coconut Podi & Warm Almond Milk", region: "south", diet: "veg", slot: "breakfast", calcium: 370, protein: 12, desc: "Steamed finger millet noodles with easily absorbable morning calcium" },
    { id: "fd_s_v_15", name: "Pasi Paruppu (Yellow Moong) Payasam with Jaggery & Cashews", region: "south", diet: "veg", slot: "snack", calcium: 230, protein: 10, desc: "Nutrient-dense post-workout recovery dish rich in potassium" },
    { id: "fd_s_nv_5", name: "Crab Pepper Soup (Nandu Rasam) with soft shell crab marrow", region: "south", diet: "non_veg", slot: "snack", calcium: 430, protein: 22, desc: "Crab shell and cartilage naturally release chondroitin and bioavailable calcium" },
    { id: "fd_s_nv_6", name: "Prawn Pepper Roast with Curry Leaves & 2 Multi-Lentil Adais", region: "south", diet: "non_veg", slot: "dinner", calcium: 390, protein: 32, desc: "High zinc crustaceans support osteoblastic alkaline phosphatase activity" },
    { id: "fd_s_nv_7", name: "Muttai Poriyal (Egg Scramble with Curry Leaves & Onions) + 2 Dosa", region: "south", diet: "eggetarian", slot: "breakfast", calcium: 330, protein: 21, desc: "Fermented rice batter paired with high biological value egg protein" },

    // --- ADDITIONAL WEST INDIAN POWER DISHES ---
    { id: "fd_w_v_11", name: "Suran (Elephant Foot Yam) Roast with Roasted Peanuts & Curd", region: "west", diet: "veg", slot: "dinner", calcium: 340, protein: 14, desc: "Root tuber dense in diosgenin and trace minerals protecting bone mass" },
    { id: "fd_w_v_12", name: "Methi Muthiya (Steamed Fenugreek & Gram Flour Dumplings) + Mint Chaas", region: "west", diet: "veg", slot: "snack", calcium: 280, protein: 13, desc: "Steamed Gujarati specialty maximizing mineral absorption through low phytates" },
    { id: "fd_w_v_13", name: "Kanda Batata Poha with Extra Roasted Peanuts & Lemon", region: "west", diet: "veg", slot: "breakfast", calcium: 220, protein: 11, desc: "Flattened whole rice with vitamin C lemon juice ensuring iron and calcium bio-uptake" },
    { id: "fd_w_v_14", name: "Chawli (Black Eyed Peas) Usal + 2 Bajra Bhakris + Tomato Salad", region: "west", diet: "veg", slot: "lunch", calcium: 440, protein: 23, desc: "High copper and manganese legumes essential for bone lysyl oxidase enzyme" },
    { id: "fd_w_v_15", name: "Shengdana (Peanut) Garlic Chutney + Jowar Roti + Curd", region: "west", diet: "veg", slot: "lunch", calcium: 370, protein: 18, desc: "Monounsaturated healthy fats facilitating fat-soluble Vitamin D absorption" },
    { id: "fd_w_nv_3", name: "Fish Koliwada (Baked Fish in Ajwain & Gram Flour Batter)", region: "west", diet: "non_veg", slot: "dinner", calcium: 390, protein: 34, desc: "Ajwain thymol aids gut assimilation of fish bone minerals" },
    { id: "fd_w_nv_4", name: "Egg Thepla Wrap (Spiced Scrambled Egg rolled in Fenugreek Roti)", region: "west", diet: "eggetarian", slot: "breakfast", calcium: 350, protein: 22, desc: "Portable morning protein delivering egg yolk choline and fenugreek calcium" },

    // --- ADDITIONAL EAST INDIAN POWER DISHES ---
    { id: "fd_e_v_7", name: "Chhena Poda (Odia Baked Cottage Cheese Cake, Low Jaggery)", region: "east", diet: "veg", slot: "snack", calcium: 380, protein: 16, desc: "Slow baked caramelized milk solids packed with natural dairy calcium" },
    { id: "fd_e_v_8", name: "Kumro Phooler Bora (Pumpkin Blossom Fritters) + Musur Dal + Rice", region: "east", diet: "veg", slot: "lunch", calcium: 310, protein: 17, desc: "Edible flowers high in antioxidant flavonoids preventing osteoclast activation" },
    { id: "fd_e_v_9", name: "Manipuri Kanghou (Stir-fried Sprouted Peas, Black Sesame & Greens)", region: "east", diet: "veg", slot: "dinner", calcium: 410, protein: 20, desc: "High mineral black sesame seed crust delivers over 400mg natural calcium" },
    { id: "fd_e_v_10", name: "Chak-Hao (Manipuri Black Rice) Kheer with Almonds & Milk", region: "east", diet: "veg", slot: "snack", calcium: 290, protein: 11, desc: "Anthocyanin-dense black rice supporting microvascular capillary flow to bone" },
    { id: "fd_e_nv_3", name: "Chingri Malai Curry (Prawns in Coconut Milk & Cinnamon Gravy)", region: "east", diet: "non_veg", slot: "dinner", calcium: 380, protein: 30, desc: "Natural trace copper and selenium from coastal prawns paired with coconut MCTs" },
    { id: "fd_e_nv_4", name: "Ilish (Hilsa) Bhapa (Steamed Mustard Fish with Soft Edible Bones)", region: "east", diet: "non_veg", slot: "lunch", calcium: 520, protein: 35, desc: "One of the richest natural sources of Vitamin D and long-chain Omega-3s in South Asia" },

    // --- ADDITIONAL CONTINENTAL & VEGAN SPECIALTIES ---
    { id: "fd_c_v_10", name: "Tuscan White Bean & Curly Kale Stew with Extra Virgin Olive Oil", region: "continental", diet: "vegan", slot: "lunch", calcium: 410, protein: 20, desc: "Kale calcium has a 50% bioavailability rate, even higher than dairy milk" },
    { id: "fd_c_v_11", name: "Creamy Polenta with Sautéed Garlic Mushrooms & Parmesan Cheese", region: "continental", diet: "veg", slot: "dinner", calcium: 430, protein: 18, desc: "Aged parmesan contains 1100mg calcium per 100g with complex cornmeal carbs" },
    { id: "fd_c_v_12", name: "Chia & Hemp Seed Warm Oatmeal in Fortified Oat Milk", region: "continental", diet: "vegan", slot: "breakfast", calcium: 390, protein: 19, desc: "Complete amino acid profile from hemp hearts paired with chia soluble fiber" },
    { id: "fd_c_v_13", name: "Steamed Bok Choy & Edamame with Sesame-Ginger Glaze + Quinoa", region: "continental", diet: "vegan", slot: "dinner", calcium: 380, protein: 22, desc: "Cruciferous greens with very low oxalic acid ensuring 54% calcium bioavailability" },
    { id: "fd_c_v_14", name: "Cottage Cheese & Spinach Folded Herb Omelette with Sourdough", region: "continental", diet: "eggetarian", slot: "breakfast", calcium: 450, protein: 28, desc: "Triple protein and calcium synergy from whole eggs, cottage cheese, and spinach" },
    { id: "fd_c_v_15", name: "Pan-Seared Rainbow Trout with Almond Flakes & Steamed Green Beans", region: "continental", diet: "non_veg", slot: "dinner", calcium: 440, protein: 36, desc: "Freshwater fish packed with bioavailable collagen peptides and Vitamin D3" },
    { id: "fd_c_v_16", name: "Matcha Soy Milk Latte with Fortified Calcium Carbonate", region: "continental", diet: "vegan", slot: "snack", calcium: 330, protein: 11, desc: "EGCG polyphenols in ceremonial matcha have been shown to stimulate bone formation" },
    { id: "fd_c_v_17", name: "Baked Sweet Potato topped with Spiced Black Beans & Guacamole", region: "continental", diet: "vegan", slot: "lunch", calcium: 260, protein: 15, desc: "High potassium and magnesium reduce urinary calcium excretion" },
    { id: "fd_c_v_18", name: "Ricotta Cheese on Multigrain Toast drizzled with Thyme Honey", region: "continental", diet: "veg", slot: "snack", calcium: 350, protein: 15, desc: "Whey protein byproduct ricotta delivers easily digestible calcium and casein" },
    { id: "fd_c_v_19", name: "Grilled Herb Chicken Breast with Broccoli Mash & Roasted Garlic", region: "continental", diet: "non_veg", slot: "lunch", calcium: 330, protein: 38, desc: "Lean poultry protein essential for collagen scaffolding" },


    // --- AUTHENTIC REGIONAL VEGAN & METABOLIC POWER DISHES ---
    // North Indian Vegan
    { id: "fd_n_vg_1", name: "Tofu Methi Bhurji + 2 Whole Wheat Phulkas + Sprouted Salad", region: "north", diet: "vegan", slot: "breakfast", calcium: 390, protein: 22, desc: "Calcium-set tofu with fenugreek greens: low glycemic, diabetes & hypertension safe", conditions: ["diabetes", "hypertension", "obesity", "dyslipidemia"] },
    { id: "fd_n_vg_2", name: "Besan Chilla with Spinach & Flaxseed Podi + Mint Chutney", region: "north", diet: "vegan", slot: "breakfast", calcium: 320, protein: 18, desc: "Gram flour lysine with spinach minerals; dairy-free, heart-healthy soluble fiber", conditions: ["diabetes", "dyslipidemia", "obesity"] },
    { id: "fd_n_vg_3", name: "Sarson Ka Saag (Mustard Greens in Cold-Pressed Mustard Oil) + 1 Makki Roti", region: "north", diet: "vegan", slot: "lunch", calcium: 410, protein: 15, desc: "Classic North Indian winter calcium powerhouse from brassica greens, zero dairy", conditions: ["diabetes", "hypertension", "dyslipidemia"] },
    { id: "fd_n_vg_4", name: "Rajma (Red Kidney Bean) Curry + Jeera Brown Rice + Kachumber Salad", region: "north", diet: "vegan", slot: "lunch", calcium: 360, protein: 20, desc: "High fiber slow-release legume carbs with potassium-rich cucumber", conditions: ["diabetes", "hypertension", "obesity"] },
    { id: "fd_n_vg_5", name: "Sprouted Kala Chana Chaat with Lemon Juice & Roasted White Sesame", region: "north", diet: "vegan", slot: "snack", calcium: 260, protein: 14, desc: "Dense bioavailable sesame calcium (975mg/100g) paired with sprouted pulse enzymes", conditions: ["diabetes", "hypertension", "obesity", "dyslipidemia", "thyroid"] },
    { id: "fd_n_vg_6", name: "Roasted Makhana (Foxnuts) with Turmeric & Crushed Almonds", region: "north", diet: "vegan", slot: "snack", calcium: 210, protein: 9, desc: "Unsalted magnesium and trace zinc snack; protects vascular endothelium and bone matrix", conditions: ["hypertension", "dyslipidemia", "kidney", "obesity"] },
    { id: "fd_n_vg_7", name: "Lauki (Bottle Gourd) Chana Dal + 2 Multigrain Rotis + Green Salad", region: "north", diet: "vegan", slot: "dinner", calcium: 310, protein: 18, desc: "Alkaline hydration with high fiber; gentle on kidneys and optimal for blood pressure", conditions: ["hypertension", "kidney", "diabetes", "obesity"] },
    { id: "fd_n_vg_8", name: "Soya Chaap Matar Curry + 2 Whole Wheat Phulkas", region: "north", diet: "vegan", slot: "dinner", calcium: 420, protein: 27, desc: "Phytoestrogens that bond onto osteoblast receptors for nighttime bone remodeling", conditions: ["diabetes", "dyslipidemia", "obesity"] },

    // South Indian Vegan
    { id: "fd_s_vg_1", name: "Ragi Dosa (Finger Millet Crepe) + Drumstick Sambar + Tomato Chutney", region: "south", diet: "vegan", slot: "breakfast", calcium: 410, protein: 15, desc: "Finger millet provides 340mg Ca/100g with low glycemic index for steady insulin response", conditions: ["diabetes", "hypertension", "dyslipidemia", "obesity"] },
    { id: "fd_s_vg_2", name: "Pesarattu (Whole Green Moong Crepe) with Ginger-Tomato Chutney", region: "south", diet: "vegan", slot: "breakfast", calcium: 330, protein: 19, desc: "Unpolished green moong pulse protein with digestive ginger; gentle on blood sugar", conditions: ["diabetes", "obesity", "hypertension"] },
    { id: "fd_s_vg_3", name: "Ragi Mudde (Steamed Millet Ball) + Drumstick Keerai (Moringa) Sambar", region: "south", diet: "vegan", slot: "lunch", calcium: 510, protein: 21, desc: "Traditional South Indian bone capital meal: moringa leaves carry 4x milk calcium", conditions: ["diabetes", "hypertension", "obesity", "dyslipidemia"] },
    { id: "fd_s_vg_4", name: "Murungai Keerai (Moringa) Kootu with Yellow Moong Dal + Brown Rice", region: "south", diet: "vegan", slot: "lunch", calcium: 480, protein: 20, desc: "Ultra-concentrated plant calcium and potassium; ideal for blood pressure regulation", conditions: ["hypertension", "diabetes", "dyslipidemia"] },
    { id: "fd_s_vg_5", name: "Sundal (Tempered Boiled White Peas with Mustard Seeds, Curry Leaves & Coconut)", region: "south", diet: "vegan", slot: "snack", calcium: 210, protein: 12, desc: "Oil-free protein snack packed with magnesium and potassium to slow bone resorption", conditions: ["hypertension", "diabetes", "obesity", "kidney"] },
    { id: "fd_s_vg_6", name: "Roasted Sesame (Til) & Flaxseed Podi with Warm Water & 1 Apple", region: "south", diet: "vegan", slot: "snack", calcium: 250, protein: 8, desc: "Plant lignans and concentrated calcium without dairy or saturated fats", conditions: ["dyslipidemia", "hypertension", "diabetes"] },
    { id: "fd_s_vg_7", name: "Horsegram (Kollu) Rasam + Steamed Red Rice + Cabbage-Carrot Poriyal", region: "south", diet: "vegan", slot: "dinner", calcium: 370, protein: 17, desc: "Ancient Tamil Siddha legume known as highest calcium pulse; warm thermogenic support", conditions: ["obesity", "diabetes", "hypertension"] },
    { id: "fd_s_vg_8", name: "Adai (Four-Lentil Pancake) with Coconut-Tomato Chutney + Steamed Beans", region: "south", diet: "vegan", slot: "dinner", calcium: 390, protein: 23, desc: "Four-dal protein foundation providing complete essential amino acids for collagen", conditions: ["diabetes", "obesity", "dyslipidemia"] },

    // West Indian Vegan
    { id: "fd_w_vg_1", name: "Bajra (Pearl Millet) Bhakri + Methi Pithla (Gram Flour Stew in Peanut Oil)", region: "west", diet: "vegan", slot: "breakfast", calcium: 390, protein: 17, desc: "Pearl millet iron and chickpea flour magnesium balance calcium uptake; low glycemic", conditions: ["diabetes", "hypertension", "obesity"] },
    { id: "fd_w_vg_2", name: "Kanda Poha with Double Roasted Peanuts & Lemon Juice", region: "west", diet: "vegan", slot: "breakfast", calcium: 230, protein: 12, desc: "Flattened rice with vitamin C lemon juice ensuring iron and calcium bio-uptake", conditions: ["hypertension", "kidney", "thyroid"] },
    { id: "fd_w_vg_3", name: "Jowar (Sorghum) Bhakri + Sprouted Moong-Matki Usal + Kachumber Salad", region: "west", diet: "vegan", slot: "lunch", calcium: 420, protein: 23, desc: "Bioavailable sprouted pulse enzymes with high potassium sorghum; excellent for BP and glucose", conditions: ["diabetes", "hypertension", "obesity", "dyslipidemia"] },
    { id: "fd_w_vg_4", name: "Chawli (Black Eyed Peas) Usal + 2 Bajra Bhakris + Tomato-Coriander Salad", region: "west", diet: "vegan", slot: "lunch", calcium: 430, protein: 22, desc: "High copper and manganese legumes essential for bone collagen lysyl oxidase enzyme", conditions: ["diabetes", "dyslipidemia", "obesity"] },
    { id: "fd_w_vg_5", name: "Methi Muthiya (Steamed Fenugreek & Gram Flour Dumplings) + Mint Chaat", region: "west", diet: "vegan", slot: "snack", calcium: 270, protein: 12, desc: "Steamed Gujarati specialty maximizing mineral absorption through low phytates", conditions: ["diabetes", "hypertension", "obesity"] },
    { id: "fd_w_vg_6", name: "Shengdana (Peanut) Garlic Chutney + Jowar Bhakri Slice + Cucumber", region: "west", diet: "vegan", slot: "snack", calcium: 220, protein: 10, desc: "Monounsaturated healthy fats facilitating fat-soluble Vitamin D absorption", conditions: ["dyslipidemia", "diabetes", "thyroid"] },
    { id: "fd_w_vg_7", name: "Moong Dal Khichdi (Prepared in Sesame Oil) + Roasted Papad + Tomato Salad", region: "west", diet: "vegan", slot: "dinner", calcium: 320, protein: 18, desc: "Gentle comforting evening dinner supporting restful sleep and bone repair; renal friendly", conditions: ["kidney", "hypertension", "diabetes"] },
    { id: "fd_w_vg_8", name: "Tofu & Green Pea Bhurji + 2 Jowar Rotis + Cucumber Salad", region: "west", diet: "vegan", slot: "dinner", calcium: 410, protein: 24, desc: "Sorghum fiber paired with calcium-set tofu for slow overnight mineral release", conditions: ["diabetes", "obesity", "dyslipidemia", "hypertension"] },

    // East Indian Vegan
    { id: "fd_e_vg_1", name: "Sattu (Roasted Gram Flour) Sherbet with Cumin, Lemon, Mint & Black Salt", region: "east", diet: "vegan", slot: "breakfast", calcium: 220, protein: 19, desc: "Instant cooling superfood packed with insoluble fiber and plant protein; low GI", conditions: ["diabetes", "obesity", "hypertension"] },
    { id: "fd_e_vg_2", name: "Chuda (Poha) with Crushed Sesame, Roasted Peanuts & Banana", region: "east", diet: "vegan", slot: "breakfast", calcium: 280, protein: 11, desc: "Traditional mineral energy with bioavailable sesame calcium and potassium", conditions: ["hypertension", "kidney", "thyroid"] },
    { id: "fd_e_vg_3", name: "Dalma (Odia Lentil Stew with Raw Papaya, Drumstick & Pumpkin) + Brown Rice", region: "east", diet: "vegan", slot: "lunch", calcium: 390, protein: 20, desc: "Traditional Odia medicinal stew packed with vegetable minerals; renal and cardiac safe", conditions: ["hypertension", "kidney", "diabetes", "obesity"] },
    { id: "fd_e_vg_4", name: "Posto Bora (Poppy Seed Patties in Cold-Pressed Mustard Oil) + Biulir Dal + Rice", region: "east", diet: "vegan", slot: "lunch", calcium: 470, protein: 21, desc: "Poppy seeds are nature's densest plant calcium source (1400mg/100g)", conditions: ["diabetes", "hypertension", "dyslipidemia"] },
    { id: "fd_e_vg_5", name: "Manipuri Kanghou (Stir-fried Sprouted Peas, Black Sesame & Greens)", region: "east", diet: "vegan", slot: "snack", calcium: 410, protein: 19, desc: "High mineral black sesame seed crust delivers over 400mg natural calcium", conditions: ["diabetes", "hypertension", "dyslipidemia", "obesity"] },
    { id: "fd_e_vg_6", name: "Ghugni (Spiced Yellow Pea Stew with Ginger, Cumin & Lemon)", region: "east", diet: "vegan", slot: "snack", calcium: 200, protein: 13, desc: "Fiber-rich legume snack with anti-inflammatory ginger and lemon", conditions: ["diabetes", "obesity", "kidney"] },
    { id: "fd_e_vg_7", name: "Soyabean & Black Sesame Tarkari + 2 Multigrain Rotis", region: "east", diet: "vegan", slot: "dinner", calcium: 430, protein: 26, desc: "Dual plant calcium synergy popular across Assam & Manipur for bone density", conditions: ["diabetes", "dyslipidemia", "obesity"] },
    { id: "fd_e_vg_8", name: "Shorshe Palak & Chana Dal (Spinach Mustard Lentils) + Brown Rice", region: "east", diet: "vegan", slot: "dinner", calcium: 350, protein: 18, desc: "Isothiocyanates from mustard seed pair with spinach folate and calcium", conditions: ["diabetes", "hypertension", "dyslipidemia"] },

    // --- D3 / SUNLIGHT & HYDRATION BOOSTERS (DAILY 5TH MILESTONE) ---
    { id: "fd_d3_1", name: "15 mins Safe Midday Sunlight Exposure + 2.5L Hydration", region: "north", diet: "veg", slot: "sun_d3", calcium: 200, protein: 5, desc: "Triggers natural skin synthesis of cholecalciferol (D3)" },
    { id: "fd_d3_1b", name: "Early Morning Sun Walk (20 mins) + Lemon Methi Water", region: "north", diet: "veg", slot: "sun_d3", calcium: 220, protein: 6, desc: "Gentle UVB sun rays paired with electrolyte hydration" },
    { id: "fd_d3_1c", name: "Balcony Sun Stretch (15 mins) + Soaked Almonds & Water", region: "north", diet: "veg", slot: "sun_d3", calcium: 240, protein: 7, desc: "Natural sunlight absorption with vitamin E and healthy fats" },
    { id: "fd_d3_2", name: "Morning Sun Walk (Face & Arms exposed) + 1 Glass Fortified D3 Milk", region: "south", diet: "veg", slot: "sun_d3", calcium: 280, protein: 9, desc: "Sun ultraviolet-B activation paired with digestive milk lipids" },
    { id: "fd_d3_2b", name: "Balcony Morning Sunlight (15 mins) + Tender Coconut Water & Chia Seeds", region: "south", diet: "veg", slot: "sun_d3", calcium: 240, protein: 5, desc: "Natural sun absorption and mineral-rich electrolyte balance" },
    { id: "fd_d3_3", name: "Midday Balcony Sunlight Break + Soaked Sesame Seeds & Water", region: "west", diet: "veg", slot: "sun_d3", calcium: 250, protein: 6, desc: "Combined dermal D3 synthesis and plant calcium catalyst" },
    { id: "fd_d3_3b", name: "Morning Terrace Sun Walk (15 mins) + Soaked Flaxseed Water", region: "west", diet: "veg", slot: "sun_d3", calcium: 230, protein: 6, desc: "Sunlight D3 synthesis with omega-3 fatty acid absorption" },
    { id: "fd_d3_4", name: "Natural Sunlight Exposure + Vitamin D3 Drops as Doctor Advised", region: "east", diet: "veg", slot: "sun_d3", calcium: 200, protein: 5, desc: "Clinical guideline maintenance for indoor workers" },
    { id: "fd_d3_4b", name: "Morning Rooftop Sun Soak (15 mins) + Fresh Coconut Water", region: "east", diet: "veg", slot: "sun_d3", calcium: 210, protein: 4, desc: "Gentle sunlight exposure and natural hydration" },
    { id: "fd_d3_5", name: "Outdoor Brisk Walk + Fortified Plant Milk with Vitamin D2/D3", region: "continental", diet: "vegan", slot: "sun_d3", calcium: 260, protein: 8, desc: "100% plant-based bone catalyst routine" },
    { id: "fd_d3_5b", name: "Park Sun & Deep Breathing (20 mins) + Chia Seed Infused Water", region: "continental", diet: "vegan", slot: "sun_d3", calcium: 220, protein: 5, desc: "Energizing morning sun routine with antioxidant hydration" }
  ],

  // --------------------------------------------------------------------------
  // GUIDED WORKOUTS FOR OLDER ADULTS (Exercise tab)
  // Every move here has a filmed coach video that matches the movement.
  // Content should be reviewed by a physiotherapist before launch.
  // --------------------------------------------------------------------------
  exerciseGroups: [
    { id: "strength", label: "Strength", img: "biceps", blurb: "Stronger legs, hips & arms" },
    { id: "balance", label: "Balance", img: "flamingo", blurb: "Steadier on your feet" },
    { id: "posture", label: "Posture", img: "standing", blurb: "Stand tall, protect your spine" }
  ],

  workoutLibrary: [
    {
      id: "ex_sit_to_stand", group: "strength", name: "Chair Sit-to-Stand", level: "Easy",
      durationSec: 41, reps: "10 slow reps", img: "chair",
      video: { male: "assets/exercises/male_chair_sit_down_up.mp4", female: "assets/exercises/female_chair_sit_down_up.mp4" },
      focus: ["thighs", "hips"], focus2: ["core", "calves"],
      bones: ["Hip", "Thigh bone", "Lower spine"],
      benefits: ["Get up from a chair without help", "Stronger hips help prevent hip fracture", "Steadier when you stand up"],
      how: ["Sit near the front of a sturdy chair, feet flat and hip-width apart.", "Cross your arms over your chest, or hold the armrests if you need to.", "Lean slightly forward and push through your heels to stand up tall.", "Pause, then sit back down slowly while you count to 3."],
      safety: "Use a chair that won't slide. Keep a table or wall within reach."
    },
    {
      id: "ex_step_ups", group: "strength", name: "Step-Ups", level: "Moderate",
      durationSec: 41, reps: "10 per leg", img: "ladder",
      video: { male: "assets/exercises/male_stair_climbing.mp4", female: "assets/exercises/female_stair_climbing.mp4" },
      focus: ["thighs", "hips"], focus2: ["calves", "core"],
      bones: ["Hip", "Thigh bone", "Knee"],
      benefits: ["Climb stairs with confidence", "Builds leg power", "Weight-bearing loads the hip"],
      how: ["Stand at the bottom stair, holding the handrail.", "Step up with your right foot, then bring the left foot up.", "Step down slowly: right foot first, then left.", "Halfway through, switch to leading with the other leg."],
      safety: "Always hold the handrail and use a low step."
    },
    {
      id: "ex_leg_side_raise", group: "strength", name: "Side Leg Raise", level: "Easy",
      durationSec: 33, reps: "12 per leg", img: "leg",
      video: { male: "assets/exercises/male_legsideraise.mp4", female: "assets/exercises/female_legsideraise.mp4" },
      focus: ["hips", "thighs"], focus2: ["core", "ankles"],
      bones: ["Hip", "Thigh bone", "Pelvis"],
      benefits: ["Directly loads the hip bone and femoral neck", "Steadies hips to prevent side trips and falls", "Improves walking balance"],
      how: ["Stand tall next to a sturdy chair or wall for balance.", "Keep your toes pointed forward and lift your outer leg sideways.", "Hold for 1–2 seconds at the top without leaning.", "Lower slowly and switch legs after your set."],
      safety: "Keep your torso upright and do not swing your leg."
    },
    {
      id: "ex_calf_raises", group: "balance", name: "Heel Raises", level: "Easy",
      durationSec: 45, reps: "15 reps", img: "shoe",
      video: { male: "assets/exercises/male_rise_heels.mp4", female: "assets/exercises/female_rise_heels.mp4" },
      focus: ["calves", "ankles"], focus2: ["thighs"],
      bones: ["Ankle", "Shin bone", "Heel"],
      benefits: ["Stronger push-off when walking", "Steadier ankles", "Loads the lower-leg bones"],
      how: ["Stand behind a chair and hold the back lightly.", "Slowly rise up onto your toes.", "Hold for 2 seconds at the top.", "Lower your heels slowly back to the floor."],
      safety: "Keep holding the chair the whole time."
    },
    {
      id: "ex_one_leg_balance", group: "balance", name: "One-Leg Stand", level: "Easy",
      durationSec: 95, reps: "10 s each leg (3 times)", img: "flamingo",
      video: { male: "assets/exercises/male_one_leg_balance.mp4", female: "assets/exercises/female_one_leg_balance.mp4" },
      focus: ["ankles", "hips"], focus2: ["core", "thighs"],
      bones: ["Hip", "Ankle"],
      benefits: ["Fewer falls", "Steadier walking", "More confidence on uneven ground"],
      how: ["Stand behind a chair and hold it lightly.", "Lift one foot just off the floor.", "Hold for 10 seconds, then switch legs.", "Repeat 3 times on each leg."],
      safety: "Keep support within reach. Stop if you feel dizzy."
    },
    {
      id: "ex_dumbell_pull", group: "posture", name: "Dumbbell Pull", level: "Moderate",
      durationSec: 41, reps: "10 per arm", img: "weights",
      video: { male: "assets/exercises/male_dumbellpull.mp4", female: "assets/exercises/female_dumbellpull.mp4" },
      focus: ["upperBack", "arms"], focus2: ["core", "shoulders"],
      bones: ["Upper spine", "Forearm", "Wrist"],
      benefits: ["Builds back & arm strength", "Loads the spine extensors to prevent stoop", "Improves grip and forearm density"],
      how: ["Hinge forward slightly at your hips with a straight back and soft knees.", "Hold a light weight in one hand with your arm extended downward.", "Pull your elbow upward along your ribs, squeezing your back.", "Lower with control and repeat on both sides."],
      safety: "Keep your spine straight and core engaged throughout."
    },
    {
      id: "ex_band_pull", group: "posture", name: "Band Pull-Apart", level: "Easy",
      durationSec: 45, reps: "12 reps", img: "standing",
      video: { male: "assets/exercises/male_band_pull.mp4", female: "assets/exercises/female_band_pull.mp4" },
      focus: ["upperBack", "shoulders"], focus2: ["arms"],
      bones: ["Upper spine", "Shoulder blades"],
      benefits: ["Stand taller and stoop less", "Protects the spine from compression fractures"],
      how: ["Hold a light band at chest height, arms straight.", "Pull the band apart, squeezing your shoulder blades together.", "Return slowly to the start.", "No band? Use a towel and squeeze the same way."],
      safety: "Use a light band and keep your neck relaxed."
    },
    {
      id: "ex_chest_stretch", group: "posture", name: "Chest Stretch", level: "Easy",
      durationSec: 41, reps: "10 reps", img: "hug",
      video: { male: "assets/exercises/male_cheststretch.mp4", female: "assets/exercises/female_cheststretch.mp4" },
      focus: ["chest", "shoulders"], focus2: ["upperBack", "neck"],
      bones: ["Collarbone", "Upper spine", "Ribs"],
      benefits: ["Opens tight chest muscles that pull shoulders forward", "Restores upright posture and deep breathing", "Relieves neck and upper back strain"],
      how: [
        "Stand facing a wall or doorway with your feet hip-width apart.",
        "Place your hands or forearms flat against the wall at shoulder height.",
        "Step one foot forward and gently lean your chest forward to feel a mild stretch.",
        "Press gently back through your hands like a wall pushup to return to the start.",
        "Repeat for 10 slow, controlled reps with smooth, steady breathing."
      ],
      safety: "Press gently against the wall without straining, and avoid arching your lower back."
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 18: COMPREHENSIVE 12-EXERCISE EVIDENCE-BASED BONE LOADING LIBRARY
  // --------------------------------------------------------------------------
  fullExerciseCatalog: [
    {
      id: "ex_sit_to_stand",
      name: "Chair Sit Down & Up",
      category: "Lower Body Strength",
      targetBones: "Femoral Neck, Hip Joint, Lumbar Spine",
      targetMuscles: "Quadriceps, Glutes, Hamstrings",
      reps: "10–12 Reps · 3 Sets",
      durationSec: 41,
      impactLevel: "Low Impact / High Load",
      why: "Builds functional leg power needed to rise independently without arm support and prevent collapsing during a trip.",
      biomechanics: "90° Knee Flexion · Hip Hinge · Upright Spine",
      femaleImg: "assets/exercises/female_chair_sit_down_up.mp4",
      maleImg: "assets/exercises/male_chair_sit_down_up.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_one_leg_balance",
      name: "One Leg Balance",
      category: "Fall-Prevention Balance",
      targetBones: "Femoral Head, Acetabulum, Ankles",
      targetMuscles: "Gluteus Medius, Core Stabilizers, Ankle Stabilizers",
      reps: "Hold 10s each leg (3 times)",
      durationSec: 95,
      impactLevel: "Unilateral Balance",
      why: "Forces the hip abductor (gluteus medius) to clamp the pelvis level, preventing hip drop and sideways sway.",
      biomechanics: "Unilateral Pelvic Leveling · Core Bracing · Fix Gaze Ahead",
      femaleImg: "assets/exercises/female_one_leg_balance.mp4",
      maleImg: "assets/exercises/male_one_leg_balance.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_calf_raises",
      name: "Standing Rise on Heels",
      category: "Lower Body & Ankle Power",
      targetBones: "Calcaneus, Tibia, Fibula",
      targetMuscles: "Gastrocnemius, Soleus, Plantar Flexors",
      reps: "15 Reps · 3 Sets",
      durationSec: 45,
      impactLevel: "Mechanical Loading",
      why: "Controlled heel lifts and controlled descents stimulate bone density along the tibia and calcaneus while building ankle defense.",
      biomechanics: "Triple Extension · Ankle Plantarflexion · Controlled Eccentric Drop",
      femaleImg: "assets/exercises/female_rise_heels.mp4",
      maleImg: "assets/exercises/male_rise_heels.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_step_ups",
      name: "Stair Climbing & Step-Ups",
      category: "Functional Loading",
      targetBones: "Hip, Tibial Plateau, Patella",
      targetMuscles: "Gluteus Maximus, Quads, Hamstrings",
      reps: "10–12 Reps per leg · 2 Sets",
      durationSec: 41,
      impactLevel: "Moderate Step Impact",
      why: "Replicates stair climbing with safe impact that signals bone-forming osteoblasts to deposit hydroxyapatite mineral.",
      biomechanics: "Hip Extension Drive · Knee Tracking Over Second Toe · Handrail Guidance",
      femaleImg: "assets/exercises/female_stair_climbing.mp4",
      maleImg: "assets/exercises/male_stair_climbing.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_band_pull",
      name: "Resistance Band Pull",
      category: "Upper Body & Vertebral Defense",
      targetBones: "Thoracic Spine, Ribs, Clavicle, Scapula",
      targetMuscles: "Rhomboids, Latissimus, Posterior Deltoids, Rotator Cuff",
      reps: "12–15 Reps · 3 Sets",
      durationSec: 45,
      impactLevel: "Upper Body Elastic Resistance",
      why: "Retracts the scapulae and loads the mid-thoracic spine to counteract osteoporotic forward stoop (kyphosis).",
      biomechanics: "Scapular Retraction · Neutral Cervical Spine · Controlled Elastic Tension",
      femaleImg: "assets/exercises/female_band_pull.mp4",
      maleImg: "assets/exercises/male_band_pull.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_dumbell_pull",
      name: "Dumbbell Pull & Back Row",
      category: "Upper Body & Spine Strength",
      targetBones: "Upper Spine, Ribs, Wrists, Forearm Bones",
      targetMuscles: "Latissimus Dorsi, Rhomboids, Biceps, Core",
      reps: "10–12 Reps per arm · 3 Sets",
      durationSec: 41,
      impactLevel: "Moderate Upper Load",
      why: "Strengthens upper back extensors to anchor upright posture and stimulates bone density across wrists and arms.",
      biomechanics: "Neutral Spine · Scapular Retraction · Controlled Elbow Drive",
      femaleImg: "assets/exercises/female_dumbellpull.mp4",
      maleImg: "assets/exercises/male_dumbellpull.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_leg_side_raise",
      name: "Standing Side Leg Raise",
      category: "Hip & Lateral Stability",
      targetBones: "Greater Trochanter, Femoral Neck, Pelvis",
      targetMuscles: "Gluteus Medius, Tensor Fasciae Latae, Abductors",
      reps: "12 Reps per leg · 3 Sets",
      durationSec: 33,
      impactLevel: "Hip Abduction Loading",
      why: "Directly loads the hip bone and femoral neck while building side hip stabilizers for trip prevention.",
      biomechanics: "Hip Abduction · Neutral Pelvis · Core Bracing",
      femaleImg: "assets/exercises/female_legsideraise.mp4",
      maleImg: "assets/exercises/male_legsideraise.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_chest_stretch",
      name: "Chest Opener & Stretch",
      category: "Chest Opening & Posture",
      targetBones: "Sternum, Clavicle, Thoracic Spine",
      targetMuscles: "Pectoralis Major/Minor, Anterior Deltoids",
      reps: "10 Reps · 2 Sets",
      durationSec: 41,
      impactLevel: "Postural Flexibility & Wall Press",
      why: "Opens tight anterior chest musculature to reverse rounding shoulders and take pressure off vertebral bodies.",
      biomechanics: "Thoracic Extension · Scapular Retraction · Doorway Wall Press",
      femaleImg: "assets/exercises/female_cheststretch.mp4",
      maleImg: "assets/exercises/male_cheststretch.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_tandem_stand",
      name: "Tandem Stance (Heel-to-Toe Balance)",
      category: "Fall-Prevention Balance",
      targetBones: "Ankles, Subtalar Joint, Tibia",
      targetMuscles: "Ankle Stabilizers, Proprioception, Core",
      reps: "Hold 30s per leg · 2 Sets",
      durationSec: 60,
      impactLevel: "Balance Stability",
      why: "Narrows base of support to train vestibular and proprioceptive balance systems against unexpected tripping.",
      biomechanics: "Narrow Base of Support · Center of Gravity Alignment",
      femaleImg: "assets/exercises/female_one_leg_balance.mp4",
      maleImg: "assets/exercises/male_one_leg_balance.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_heel_toe_walk",
      name: "Heel-to-Toe Dynamic Walking",
      category: "Gait & Coordination",
      targetBones: "Metatarsals, Calcaneus, Tibia",
      targetMuscles: "Tibialis Anterior, Calves, Pelvic Stabilizers",
      reps: "20 Steps Forward & Back · 2 Sets",
      durationSec: 45,
      impactLevel: "Dynamic Neuromuscular",
      why: "Improves dynamic gait clearance so feet don't drag or catch on rugs, thresholds, and stairs.",
      biomechanics: "Dorsiflexion · Heel Strike · Ground Clearance",
      femaleImg: "assets/exercises/female_stair_climbing.mp4",
      maleImg: "assets/exercises/male_stair_climbing.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_wall_pushups",
      name: "Wall Push-Ups & Spinal Extension",
      category: "Upper Body & Vertebral Defense",
      targetBones: "Thoracic Spine, Ribs, Wrists (Distal Radius)",
      targetMuscles: "Pectorals, Triceps, Upper Back Extensors",
      reps: "12–15 Reps · 2 Sets",
      durationSec: 45,
      impactLevel: "Upper Body Resistance",
      why: "Strengthens upper body to cushion falls and counteracts forward stoop (kyphosis) that strains thoracic vertebrae.",
      biomechanics: "45° Elbow Tuck · Scapular Retraction · Core Plank",
      femaleImg: "assets/exercises/female_band_pull.mp4",
      maleImg: "assets/exercises/male_band_pull.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_prone_cobra",
      name: "Prone Cobra (Spine Extensor Shield)",
      category: "Vertebral Bone Density",
      targetBones: "Thoracic & Lumbar Spine Vertebrae",
      targetMuscles: "Erector Spinae, Rhomboids, Latissimus",
      reps: "8 Reps (5s hold each) · 2 Sets",
      durationSec: 50,
      impactLevel: "Postural Spine Density",
      why: "Stronger back extensor muscles have been clinically proven to reduce vertebral compression fracture incidence.",
      biomechanics: "Thoracic Extension · External Shoulder Rotation",
      femaleImg: "assets/exercises/female_band_pull.mp4",
      maleImg: "assets/exercises/male_band_pull.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_wall_sit",
      name: "Isometric Wall Sit Hold",
      category: "Lower Body Strength",
      targetBones: "Femur, Patella, Pelvis",
      targetMuscles: "Quadriceps, Adductors",
      reps: "Hold 30–45s · 2 Sets",
      durationSec: 45,
      impactLevel: "Isometric Resistance",
      why: "Continuous isometric muscle contraction drives rich blood circulation and piezo-electric bone remodeling.",
      biomechanics: "90° Hip & Knee Hold · Flat Back to Wall",
      femaleImg: "assets/exercises/female_chair_sit_down_up.mp4",
      maleImg: "assets/exercises/male_chair_sit_down_up.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_bird_dog",
      name: "Bird-Dog Cross-Body Balance",
      category: "Spinal Stability & Core",
      targetBones: "Lumbar Spine, Sacrum, Pelvis",
      targetMuscles: "Multifidus, Core, Glutes, Deltoid",
      reps: "10 Alternate Reps (3s hold) · 2 Sets",
      durationSec: 60,
      impactLevel: "Core Stability",
      why: "Stabilizes rotational spine stiffness without risky flexion or spinal twisting.",
      biomechanics: "Neutral Spine · Quadruped Cross-Sling Tension",
      femaleImg: "assets/exercises/female_band_pull.mp4",
      maleImg: "assets/exercises/male_band_pull.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    },
    {
      id: "ex_heel_drops",
      name: "Gentle Stomp & Heel Drops",
      category: "Bone Piezo-Electric Impact",
      targetBones: "Femoral Neck, Hip, Calcaneus",
      targetMuscles: "Plantar Flexors, Core",
      reps: "20 Drops · 2 Sets",
      durationSec: 40,
      impactLevel: "Safe Impact Stimulus",
      why: "Creates a gentle vertical shockwave through long leg bones that activates mechanoreceptors to absorb calcium.",
      biomechanics: "Rise on Toes · Controlled Drop on Heels",
      femaleImg: "assets/exercises/female_rise_heels.mp4",
      maleImg: "assets/exercises/male_rise_heels.mp4",
      femaleVideoWidth: 1080,
      femaleVideoHeight: 1440,
      femaleAspectRatio: "3 / 4",
      videoWidth: 1080,
      videoHeight: 1440,
      aspectRatio: "3 / 4"
    }
  ],

  // --------------------------------------------------------------------------
  // MODULE 19: BONE SIP AI CHATBOT KNOWLEDGE BASE & INTENT ENGINE
  // --------------------------------------------------------------------------
  botKnowledge: {
    // Offline answers + quick-question chips. The live AI prompt is built in server/assistant.js.
    quickSuggestions: [
      { text: "🍽️ What should I eat today?", query: "meal_suggestion" },
      { text: "🏃 Today's exercises", query: "exercise_advice" },
      { text: "📊 Explain my score", query: "streak_score" },
      { text: "🥛 Reach 1,200 mg calcium", query: "calcium_gap" },
      { text: "🦴 What is a DXA T-score?", query: "dxa_explanation" },
      { text: "🛡️ Prevent falls at home", query: "fall_prevention" }
    ],
    topicAnswers: {
      "3-2-1 rule": "The BONE SIP 3-2-1 Rule is our core daily nutritional deposit:\n• 3 servings of Calcium-rich foods (~1000–1200 mg/day: Milk, Curd, Paneer, Ragi, Sesame, Moringa)\n• 2 servings of Protein (~60–80 g/day: Dal, Soya, Eggs, Fish, Sprouts)\n• 1 Vitamin D3 source (15 mins safe morning sunlight or clinical D3 supplement).",
      "calcium": "Adults need approximately 1,000–1,200 mg of calcium daily. Best sources:\n• Dairy: Milk (300mg/cup), Curd (300mg/bowl), Paneer (200mg/100g)\n• Millets & Seeds: Ragi (344mg/100g), White Sesame/Til (975mg/100g), Poppy Seeds (1400mg/100g)\n• Green Leafy: Moringa/Drumstick leaves (440mg/100g), Methi/Fenugreek leaves.",
      "protein": "50% of your bone volume is collagen protein! Calcium crystals bind directly onto this protein framework. Without adequate protein (1g per kg body weight), bones turn brittle like chalk. Always pair calcium with dal, eggs, fish, tofu, or paneer.",
      "vitamin d": "Without Vitamin D3, your body absorbs less than 15% of the calcium you consume. 15 minutes of safe sunlight exposure between 10 AM and 2 PM (arms and legs unshielded) stimulates natural cutaneous synthesis. If working indoors, ask your physician for a 25-OH Vitamin D blood test and routine D3 drops.",
      "exercise": "Bones remodel through 'piezo-electric loading'—meaning mechanical tension forces osteoblasts to lay down fresh bone mineral. The 3 essential movements are:\n1. Resistance squats (Sit-to-Stand)\n2. Postural spine extension (Wall push-ups, Prone cobra)\n3. Fall-prevention balance (Tandem stance, Stork stand).",
      "dxa": "A DXA scan measures your Bone Mineral Density (BMD) in grams of calcium per cm².\n• Normal: T-Score above -1.0\n• Osteopenia (Mild bone thinning): T-Score between -1.0 and -2.5\n• Osteoporosis (Fragile bone risk): T-Score at or below -2.5.\nTake your results to your physician to review alongside FRAX 10-year fracture risk.",
      "fall prevention": "95% of hip fractures occur from simple standing-height falls. Protect your bone wealth:\n• Bathroom: Install sturdy grab bars and non-slip rubber mats\n• Bedroom: Remove loose throw rugs and keep clear bedside nightlights\n• Footwear: Wear supportive, non-skid rubber soled footwear; avoid loose open slippers."
    }
  }
};

// Ensure node environment compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BONE_SIP_DATA;
}
