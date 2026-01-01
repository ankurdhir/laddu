// Product Data - Protein & Fitness Laddoo

export const ingredients = {
    nuts: [
        {
            id: 'badam',
            name: 'Badam (Almonds)',
            benefit: 'Steady energy and antioxidant support',
            vitaminsMinerals: ['Vitamin E', 'Magnesium'],
            fitnessTags: ['Brain', 'Recovery', 'Skin'],
            allergens: ['Tree nuts'],
            pricePer100g: 120,
            type: 'nut',
        },
        {
            id: 'kaju',
            name: 'Kaju (Cashews)',
            benefit: 'Supports muscle function and recovery',
            vitaminsMinerals: ['Magnesium', 'Iron', 'Zinc'],
            fitnessTags: ['Muscle', 'Recovery'],
            allergens: ['Tree nuts'],
            pricePer100g: 140,
            type: 'nut',
        },
        {
            id: 'akhrot',
            name: 'Akhrot (Walnuts)',
            benefit: 'Healthy fats for brain and recovery',
            vitaminsMinerals: ['Omega-3 (ALA)', 'Copper'],
            fitnessTags: ['Brain', 'Joints', 'Recovery'],
            allergens: ['Tree nuts'],
            pricePer100g: 160,
            type: 'nut',
        },
        {
            id: 'kishmish',
            name: 'Kishmish (Raisins)',
            benefit: 'Quick energy for workouts',
            vitaminsMinerals: ['Iron', 'Potassium'],
            fitnessTags: ['Energy', 'Endurance'],
            allergens: [],
            pricePer100g: 60,
            type: 'nut',
        },
        {
            id: 'gond',
            name: 'Goond (Edible Gum)',
            benefit: 'Traditional warmth and joint support',
            vitaminsMinerals: ['Trace minerals'],
            fitnessTags: ['Joints', 'Recovery', 'Energy'],
            allergens: [],
            pricePer100g: 150,
            type: 'nut',
        },
    ],
    seeds: [
        {
            id: 'makhana',
            name: 'Makhana (Fox Nuts)',
            benefit: 'Clean, light energy',
            vitaminsMinerals: ['Magnesium', 'Potassium'],
            fitnessTags: ['Energy', 'Low Fat'],
            allergens: [],
            pricePer100g: 80,
            type: 'seed',
        },
        {
            id: 'flax',
            name: 'Flax Seeds (Alsi)',
            benefit: 'Recovery-friendly fats + fiber',
            vitaminsMinerals: ['Omega-3 (ALA)', 'Magnesium', 'Fiber'],
            fitnessTags: ['Omega', 'Recovery', 'Gut', 'Joints'],
            allergens: [],
            pricePer100g: 40,
            type: 'seed',
        },
        {
            id: 'chia',
            name: 'Chia Seeds',
            benefit: 'Fiber for endurance and digestion support',
            vitaminsMinerals: ['Omega-3 (ALA)', 'Calcium', 'Fiber'],
            fitnessTags: ['Endurance', 'Gut', 'Bone'],
            allergens: [],
            pricePer100g: 120,
            type: 'seed',
        },
        {
            id: 'pumpkin',
            name: 'Pumpkin Seeds',
            benefit: 'Minerals that support strength',
            vitaminsMinerals: ['Magnesium', 'Zinc', 'Iron'],
            fitnessTags: ['Muscle', 'Bone'],
            allergens: [],
            pricePer100g: 90,
            type: 'seed',
        },
        {
            id: 'muskmelon',
            name: 'Kharbuja Beej (Muskmelon Seeds)',
            benefit: 'Plant protein + minerals for recovery',
            vitaminsMinerals: ['Magnesium', 'Zinc', 'Iron'],
            fitnessTags: ['Muscle', 'Recovery'],
            allergens: [],
            pricePer100g: 110,
            type: 'seed',
        },
    ],
    bases: [
        {
            id: 'besan',
            name: 'Besan (Gram Flour)',
            benefit: 'Great binding with plant protein',
            vitaminsMinerals: ['B-vitamins', 'Iron'],
            fitnessTags: ['Muscle'],
            allergens: [],
            pricePer100g: 20,
            type: 'base',
        },
        {
            id: 'aata',
            name: 'Aata (Whole Wheat)',
            benefit: 'Sustained energy with fiber',
            vitaminsMinerals: ['B-vitamins', 'Fiber'],
            fitnessTags: ['Energy', 'Endurance'],
            allergens: ['Gluten'],
            pricePer100g: 10,
            type: 'base',
        },
    ],
    sweeteners: [
        {
            id: 'honey',
            name: 'Honey',
            benefit: 'Natural sweetness with quick energy',
            vitaminsMinerals: ['Antioxidants (trace)'],
            fitnessTags: ['Energy'],
            allergens: [],
            pricePer100g: 60,
            type: 'sweetener',
        },
        {
            id: 'jaggery',
            name: 'Jaggery (Gud)',
            benefit: 'Unrefined sweetness with trace minerals',
            vitaminsMinerals: ['Iron (trace)', 'Potassium (trace)'],
            fitnessTags: ['Energy'],
            allergens: [],
            pricePer100g: 15,
            type: 'sweetener',
        },
        {
            id: 'sugar',
            name: 'Shakkar (Sugar)',
            benefit: 'Quick sweetness',
            vitaminsMinerals: [],
            fitnessTags: [],
            allergens: [],
            pricePer100g: 5,
            type: 'sweetener',
        },
        {
            id: 'sugarfree',
            name: 'Sugar-Free Sweetener',
            benefit: 'Low-sugar option',
            vitaminsMinerals: [],
            fitnessTags: ['Low Sugar'],
            allergens: [],
            pricePer100g: 100,
            type: 'sweetener',
        },
    ],
    fats: [
        {
            id: 'ghee',
            name: 'Desi Ghee',
            benefit: 'Rich mouthfeel and satiety',
            vitaminsMinerals: ['Vitamins A/E/K (trace)'],
            fitnessTags: ['Recovery'],
            allergens: ['Dairy'],
            pricePer100g: 60,
            type: 'fat',
        },
        {
            id: 'oil',
            name: 'Neutral Oil',
            benefit: 'Dairy-free fat source',
            vitaminsMinerals: ['Varies by oil'],
            fitnessTags: ['Low Sugar'],
            allergens: [],
            pricePer100g: 20,
            type: 'fat',
        },
    ],
    boosters: [
        {
            id: 'whey',
            name: 'Whey Protein',
            benefit: 'High-quality protein boost',
            vitaminsMinerals: ['BCAAs (varies)', 'Calcium (varies)'],
            fitnessTags: ['Muscle', 'Recovery', 'High Protein'],
            allergens: ['Dairy'],
            pricePer100g: 300,
            type: 'booster',
        },
    ]
};

export const GOALS = ['Muscle', 'Recovery', 'Endurance', 'Energy', 'Brain', 'Joints', 'Skin', 'Low Sugar'];

// Auto-select starter kits (no quantities; just Add/Remove selection)
export const GOAL_STARTER_KITS = {
    Muscle: { selected: ['whey', 'pumpkin', 'muskmelon', 'kaju'], base: 'besan', fat: 'ghee', sweetener: 'jaggery' },
    Recovery: { selected: ['kaju', 'badam', 'flax', 'akhrot'], base: 'besan', fat: 'ghee', sweetener: 'jaggery' },
    Endurance: { selected: ['chia', 'flax', 'pumpkin', 'kishmish'], base: 'aata', fat: 'oil', sweetener: 'jaggery' },
    Energy: { selected: ['makhana', 'kishmish', 'honey', 'badam'], base: 'aata', fat: 'oil', sweetener: 'honey' },
    Brain: { selected: ['akhrot', 'badam', 'flax'], base: 'aata', fat: 'ghee', sweetener: 'honey' },
    Joints: { selected: ['gond', 'akhrot', 'flax'], base: 'gond', fat: 'ghee', sweetener: 'jaggery' },
    Skin: { selected: ['badam', 'akhrot', 'honey'], base: 'aata', fat: 'ghee', sweetener: 'honey' },
    'Low Sugar': { selected: ['makhana', 'pumpkin', 'flax'], base: 'aata', fat: 'oil', sweetener: 'sugarfree' },
};

export const presets = [
    {
        id: 'mix-dry-fruit',
        name: 'Mix Dry Fruit Laddoo',
        tagline: 'Everyday Strength',
        description: 'Balanced nutrition for the whole family.',
        primaryIngredient: 'Mixed Dry Fruits',
        keyIngredients: ['Badam', 'Kaju', 'Akhrot', 'Kishmish', 'Flax', 'Pumpkin seeds'],
        tags: ['Protein', 'Energy', 'Family', 'Joints', 'Skin'],
        price: 850, // Per kg (approx)
        image: 'assets/images/preset-mix-dryfruit.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: {
                badam: 20,
                kaju: 20,
                akhrot: 10,
                makhana: 0,
                flax: 5,
                pumpkin: 5,
                whey: 0
            }
        }
    },
    {
        id: 'badam-energy',
        name: 'Badam Energy Laddoo',
        tagline: 'Mind & Focus',
        description: 'Almond-rich for brain power and steady energy.',
        primaryIngredient: 'Badam (Almond)',
        keyIngredients: ['Badam', 'Kaju', 'Akhrot'],
        tags: ['Vitamin E', 'Brain', 'Focus', 'Skin'],
        price: 1100,
        image: 'assets/images/preset-badam.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: {
                badam: 50,
                kaju: 5,
                akhrot: 5,
                makhana: 0,
                flax: 0,
                pumpkin: 0,
                whey: 0
            }
        }
    },
    {
        id: 'protein-power',
        name: 'Gym Fuel Laddoo',
        tagline: 'High Protein',
        description: 'Whey protein infused for serious muscle recovery.',
        primaryIngredient: 'Whey (Optimum Nutrition)',
        keyIngredients: ['Whey', 'Badam', 'Kaju', 'Flax', 'Pumpkin seeds'],
        tags: ['High Protein', 'Muscle', 'Recovery', 'Energy'],
        price: 1400,
        image: 'assets/images/preset-protein.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: {
                badam: 10,
                kaju: 10,
                akhrot: 0,
                makhana: 0,
                flax: 10,
                pumpkin: 10,
                whey: 35 // High whey focus
            }
        }
    }
];

// Expand to full PRD list (v1 presets)
presets.push(
    {
        id: 'kaju-recovery',
        name: 'Kaju-Dominant Laddoo',
        tagline: 'Muscle & Recovery',
        description: 'Cashew-dominant laddoo for calorie-dense recovery fuel.',
        primaryIngredient: 'Kaju (Cashew)',
        keyIngredients: ['Kaju', 'Badam', 'Kishmish'],
        tags: ['Muscle', 'Recovery', 'Energy'],
        price: 1150,
        image: 'assets/images/preset-kaju.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: { badam: 5, kaju: 50, akhrot: 0, kishmish: 5, makhana: 0, flax: 0, pumpkin: 0, chia: 0, muskmelon: 0, whey: 0 }
        }
    },
    {
        id: 'gond-joints',
        name: 'Gond Laddoo',
        tagline: 'Joint & Warmth',
        description: 'Traditional gond laddoo with a warm, comforting profile.',
        primaryIngredient: 'Goond (Edible Gum)',
        keyIngredients: ['Goond', 'Badam', 'Kaju', 'Akhrot', 'Kishmish'],
        tags: ['Joints', 'Energy', 'Recovery'],
        price: 1200,
        image: '', // add an image later (e.g. assets/images/preset-gond.png)
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: { gond: 25, badam: 15, kaju: 10, akhrot: 5, kishmish: 5, makhana: 0, flax: 0, pumpkin: 0, chia: 0, muskmelon: 0, whey: 0 }
        }
    },
    {
        id: 'omega-recovery',
        name: 'Omega Recovery Laddoo',
        tagline: 'Omega-3 Focus',
        description: 'Walnut + flax + chia focused for recovery-friendly fats.',
        primaryIngredient: 'Akhrot (Walnut)',
        keyIngredients: ['Akhrot', 'Flax', 'Chia'],
        tags: ['Omega', 'Recovery', 'Brain', 'Joints'],
        price: 1350,
        image: 'assets/images/preset-omega.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: { badam: 5, kaju: 0, akhrot: 30, kishmish: 0, makhana: 0, flax: 15, pumpkin: 0, chia: 10, muskmelon: 0, whey: 0 }
        }
    },
    {
        id: 'endurance-seed',
        name: 'Endurance Seed Laddoo',
        tagline: 'Fiber & Slow Energy',
        description: 'Seed-forward laddoo designed for sustained energy.',
        primaryIngredient: 'Seeds Blend',
        keyIngredients: ['Chia', 'Flax', 'Pumpkin seeds', 'Muskmelon seeds', 'Kishmish'],
        tags: ['Endurance', 'Energy', 'Gut'],
        price: 1250,
        image: 'assets/images/preset-endurance.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: { badam: 0, kaju: 0, akhrot: 0, kishmish: 10, makhana: 0, flax: 15, pumpkin: 15, chia: 15, muskmelon: 5, whey: 0 }
        }
    },
    {
        id: 'makhana-light',
        name: 'Light Energy Makhana Laddoo',
        tagline: 'Low-Fat',
        description: 'Makhana-dominant laddoo for light, clean energy.',
        primaryIngredient: 'Makhana (Fox Nuts)',
        keyIngredients: ['Makhana', 'Badam'],
        tags: ['Energy', 'Low Fat', 'Low Sugar'],
        price: 950,
        image: 'assets/images/preset-makhana.png',
        config: {
            base: 'aata',
            fat: 'ghee',
            sweetener: 'jaggery',
            ingredients: { badam: 5, kaju: 0, akhrot: 0, kishmish: 0, makhana: 45, flax: 0, pumpkin: 0, chia: 0, muskmelon: 0, whey: 0 }
        }
    }
);
