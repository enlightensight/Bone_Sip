const fs = require('fs');

let dataContent = fs.readFileSync('js/data.js', 'utf8');

const additionalMeals = `
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
    { id: "fd_c_v_19", name: "Grilled Herb Chicken Breast with Broccoli Mash & Roasted Garlic", region: "continental", diet: "non_veg", slot: "lunch", calcium: 330, protein: 38, desc: "Lean poultry protein essential for collagen scaffolding" }
`;

const targetIndex = dataContent.indexOf('    // --- D3 / SUNLIGHT & HYDRATION BOOSTERS (DAILY 5TH MILESTONE) ---');

if (targetIndex !== -1) {
  dataContent = dataContent.slice(0, targetIndex) + additionalMeals + '\n' + dataContent.slice(targetIndex);
  fs.writeFileSync('js/data.js', dataContent, 'utf8');
  console.log('Successfully expanded fullDietCatalog in js/data.js!');
} else {
  console.error('Target comment for insertion not found');
}
