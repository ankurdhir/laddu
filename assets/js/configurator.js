import { ingredients, GOALS, GOAL_STARTER_KITS } from './data.js';

export class Configurator {
    constructor() {
        this.state = {
            goal: null,
            base: 'besan',
            fat: 'ghee',
            sweetener: 'jaggery',
            selected: {}, // id -> true
            quantityKg: 1
        };

        this.init();
    }

    init() {
        this.renderControls();
        this.updateFeedback();
        
        // Ensure buttons are wired correctly after first render
        this.state.goal = null; // Ensure no goal is forced initially, but interactions work
    }

    // Load from old preset config: any ingredient with value > 0 becomes selected
    loadPreset(presetConfig) {
        if (!presetConfig) return;

        // Update basic selections
        if (presetConfig.base) this.state.base = presetConfig.base;
        if (presetConfig.fat) this.state.fat = presetConfig.fat;
        if (presetConfig.sweetener) this.state.sweetener = presetConfig.sweetener;

        // Update selected ingredients
        this.state.selected = {};
        if (presetConfig.ingredients) {
            for (const [id, value] of Object.entries(presetConfig.ingredients)) {
                if (value > 0) {
                    this.state.selected[id] = true;
                }
            }
        }

        // Re-render controls to reflect new state
        this.renderControls();
        this.updateFeedback();

        // Optional: Scroll to builder (handled by anchor tag, but we can animate/highlight)
        const builderSection = document.getElementById('builder');
        if (builderSection) {
            builderSection.scrollIntoView({ behavior: 'smooth' });
            // Add a flash effect to visualizer
            const visualizer = document.querySelector('.relative.w-48.h-48');
            if(visualizer) {
                visualizer.classList.add('animate-pulse');
                setTimeout(() => visualizer.classList.remove('animate-pulse'), 500);
            }
        }
    }

    renderControls() {
        const container = document.getElementById('configurator-controls');
        if (!container) return;

        const goalsHtml = GOALS.map(goal => {
            const active = this.state.goal === goal;
            return `
                <button type="button"
                    class="px-4 py-2 rounded-full text-sm font-bold border transition-colors ${active ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'}"
                    data-goal="${goal}">
                    ${goal}
                </button>
            `;
        }).join('');

        const allPickables = [
            ...ingredients.nuts,
            ...ingredients.seeds,
            ...ingredients.boosters,
        ];

        // Search + ingredient grid container (filtered in JS)
        container.innerHTML = `
            <div class="mb-6">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-1">1. Choose your goal</h3>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">We’ll auto-pick a starter kit. You can adjust anytime.</p>
                <div class="flex flex-wrap gap-2" id="goal-chips">${goalsHtml}</div>
            </div>

            <div class="mb-6">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-1">2. Pick ingredients</h3>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Tap to add/remove. Benefits show instantly.</p>
                <input id="ingredient-search" type="text" placeholder="Search ingredients (e.g., Vitamin E, joints, omega-3)…"
                    class="w-full rounded-xl border border-amber-100 px-3 py-2 md:px-4 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-cream"/>
                <div class="mt-4 grid grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-2" id="ingredient-grid"></div>
            </div>

            <div class="mb-6">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-1">3. Base, fat & sweetener</h3>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">These help bind and balance taste.</p>

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Base</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
                        ${ingredients.bases.map(base => this.renderRadioCard('base', base)).join('')}
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Fat</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        ${ingredients.fats.map(fat => this.renderRadioCard('fat', fat)).join('')}
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Sweetener</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-3">
                        ${ingredients.sweeteners.map(sw => this.renderRadioCard('sweetener', sw)).join('')}
                    </div>
                </div>
            </div>

            <div class="mb-2">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-1">4. Quantity</h3>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">How much do you need?</p>
                <div class="flex items-center gap-2 md:gap-4 bg-amber-50 p-2 md:p-4 rounded-xl border border-amber-100">
                    <button class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-amber-200 text-amber-700 font-bold hover:bg-amber-100" onclick="configurator.updateQuantity(-0.5)">-</button>
                    <span class="text-lg md:text-xl font-bold text-gray-900 w-16 md:w-24 text-center" id="qty-display">${this.state.quantityKg.toFixed(1)} kg</span>
                    <button class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-amber-200 text-amber-700 font-bold hover:bg-amber-100" onclick="configurator.updateQuantity(0.5)">+</button>
                </div>
            </div>
        `;

        // Render ingredient cards initially
        this.renderIngredientGrid(allPickables, '');
        
        // Re-bind inputs after rendering
        this.bindEvents();
    }

    renderSectionHeader(title, subtitle) {
        return `
            <div class="mb-4">
                <h3 class="font-serif text-xl font-bold text-amber-900">${title}</h3>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">${subtitle}</p>
            </div>
        `;
    }

    renderRadioCard(group, item) {
        const isSelected = this.state[group] === item.id;
        return `
            <label class="cursor-pointer group relative">
                <input type="radio" name="${group}" value="${item.id}" class="peer sr-only" ${isSelected ? 'checked' : ''}>
                <div class="p-3 rounded-xl border-2 transition-all text-center h-full flex flex-col justify-center
                    peer-checked:border-amber-600 peer-checked:bg-amber-50 peer-checked:text-amber-900
                    border-gray-200 hover:border-amber-300 text-gray-600">
                    <div class="font-bold text-sm mb-1">${item.name.split(' ')[0]}</div>
                    <div class="text-[10px] leading-tight opacity-80">${item.benefit}</div>
                </div>
                <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-600 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
            </label>
        `;
    }

    renderIngredientCard(item) {
        const isSelected = !!this.state.selected[item.id];
        const vitamins = (item.vitaminsMinerals || []).slice(0, 3);
        const tags = (item.fitnessTags || []).slice(0, 3);
        const allergen = (item.allergens || []).length ? `<span class="px-1 py-0.5 rounded bg-red-50 text-red-700 text-[8px] md:text-[10px] font-bold border border-red-100">!</span>` : '';

        return `
            <button type="button"
                class="text-left p-2 md:p-5 rounded-xl md:rounded-2xl border transition-all h-full flex flex-col justify-between ${isSelected ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-amber-100 hover:border-amber-200'}"
                data-ingredient="${item.id}">
                <div class="flex flex-col md:flex-row items-start justify-between gap-1 md:gap-3 w-full">
                    <div class="w-full">
                        <div class="font-bold text-gray-900 text-xs md:text-base leading-tight">${item.name}</div>
                        <div class="text-[10px] md:text-sm text-gray-600 mt-1 hidden md:block">${item.benefit}</div>
                    </div>
                    <div class="shrink-0 mt-1 md:mt-0">
                        <span class="px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold ${isSelected ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}">
                            ${isSelected ? '✓' : '+'}
                        </span>
                    </div>
                </div>

                <div class="mt-2 flex flex-wrap gap-1 md:gap-2 hidden md:flex">
                    ${vitamins.map(v => `<span class="px-2 py-1 rounded-md bg-white text-amber-800 text-[10px] font-bold border border-amber-100">${v}</span>`).join('')}
                    ${tags.map(t => `<span class="px-2 py-1 rounded-md bg-white text-gray-700 text-[10px] font-bold border border-gray-100">${t}</span>`).join('')}
                    ${allergen}
                </div>
            </button>
        `;
    }

    renderIngredientGrid(allPickables, query) {
        const grid = document.getElementById('ingredient-grid');
        if (!grid) return;

        const q = (query || '').trim().toLowerCase();
        let items = allPickables;

        // If goal selected: show goal-matching items first (but keep all visible)
        if (this.state.goal) {
            const goal = this.state.goal.toLowerCase();
            items = [...items].sort((a, b) => {
                const aHit = (a.fitnessTags || []).some(t => t.toLowerCase() === goal) ? 1 : 0;
                const bHit = (b.fitnessTags || []).some(t => t.toLowerCase() === goal) ? 1 : 0;
                return bHit - aHit;
            });
        }

        if (q) {
            items = items.filter(it => {
                const hay = [
                    it.name,
                    it.benefit,
                    ...(it.vitaminsMinerals || []),
                    ...(it.fitnessTags || []),
                ].join(' ').toLowerCase();
                return hay.includes(q);
            });
        }

        // Selected items first
        items = [...items].sort((a, b) => (this.state.selected[b.id] ? 1 : 0) - (this.state.selected[a.id] ? 1 : 0));

        grid.innerHTML = items.map(it => this.renderIngredientCard(it)).join('');
    }

    bindEvents() {
        // Radio buttons
        const radioGroups = document.querySelectorAll('#configurator-controls input[type="radio"]');
        radioGroups.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.state[e.target.name] = e.target.value;
                this.updateFeedback();
                // Update order summary if open
            });
        });

        // Goal chips
        document.querySelectorAll('#goal-chips [data-goal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const goal = btn.getAttribute('data-goal');
                this.applyGoalStarterKit(goal);
            });
        });

        // Search
        const allPickables = [...ingredients.nuts, ...ingredients.seeds, ...ingredients.boosters];
        const search = document.getElementById('ingredient-search');
        if (search) {
            search.addEventListener('input', () => {
                this.renderIngredientGrid(allPickables, search.value);
            });
        }

        // Ingredient cards (delegated)
        const grid = document.getElementById('ingredient-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-ingredient]');
                if (!btn) return;
                const id = btn.getAttribute('data-ingredient');
                this.toggleIngredient(id);
                this.renderIngredientGrid(allPickables, search ? search.value : '');
                this.updateFeedback();
            });
        }
    }

    updateQuantity(change) {
        let newQty = this.state.quantityKg + change;
        if (newQty < 0.5) newQty = 0.5;
        if (newQty > 10) newQty = 10;
        this.state.quantityKg = newQty;
        
        const display = document.getElementById('qty-display');
        if(display) display.innerText = `${newQty.toFixed(1)} kg`;
        
        this.updateFeedback();
    }

    toggleIngredient(id) {
        if (this.state.selected[id]) delete this.state.selected[id];
        else this.state.selected[id] = true;
        this.validateSelection();
    }

    applyGoalStarterKit(goal) {
        this.state.goal = goal;
        const kit = GOAL_STARTER_KITS[goal];
        if (kit) {
            this.state.selected = {};
            kit.selected.forEach(id => (this.state.selected[id] = true));
            if (kit.base) this.state.base = kit.base;
            if (kit.fat) this.state.fat = kit.fat;
            if (kit.sweetener) this.state.sweetener = kit.sweetener;
        }
        this.validateSelection();
        this.renderControls();
        this.updateFeedback();
    }

    validateSelection() {
        const warningEl = document.getElementById('configurator-warning');
        const selectedCount = Object.keys(this.state.selected).length;
        if (selectedCount < 2) {
            if (warningEl) {
                warningEl.classList.remove('hidden');
                warningEl.innerText = 'Pick at least 2 ingredients for the best taste and texture.';
            }
            return false;
        }
        if (warningEl) warningEl.classList.add('hidden');
        return true;
    }

    calculatePricePerKg() {
        // Benefits-first builder: use a simple pricing model.
        // Assume "mix" portion is 60% of the laddoo and is evenly split between selected ingredients.
        // Remaining 40% is base/fat/sweetener split 50/25/25.
        const prepFeePerKg = 300;

        const selectedIds = Object.keys(this.state.selected);
        const allPickables = [...ingredients.nuts, ...ingredients.seeds, ...ingredients.boosters];
        const byId = Object.fromEntries(allPickables.map(i => [i.id, i]));

        const mixPortion = 0.60;
        const binderPortion = 0.40;

        let costPer100g = 0;
        if (selectedIds.length > 0) {
            const each = (mixPortion * 100) / selectedIds.length; // grams per 100g
            selectedIds.forEach(id => {
                const item = byId[id];
                if (!item) return;
                costPer100g += (item.pricePer100g || 0) * (each / 100);
            });
        }

        const base = ingredients.bases.find(b => b.id === this.state.base);
        const fat = ingredients.fats.find(f => f.id === this.state.fat);
        const sweet = ingredients.sweeteners.find(s => s.id === this.state.sweetener);

        const baseRatio = 0.5;
        const fatRatio = 0.25;
        const sweetRatio = 0.25;

        const baseG = binderPortion * 100 * baseRatio;
        const fatG = binderPortion * 100 * fatRatio;
        const sweetG = binderPortion * 100 * sweetRatio;

        if (base) costPer100g += (base.pricePer100g || 0) * (baseG / 100);
        if (fat) costPer100g += (fat.pricePer100g || 0) * (fatG / 100);
        if (sweet) costPer100g += (sweet.pricePer100g || 0) * (sweetG / 100);

        return Math.round(costPer100g * 10 + prepFeePerKg);
    }

    getHighlights() {
        const selectedIds = Object.keys(this.state.selected);
        const allPickables = [...ingredients.nuts, ...ingredients.seeds, ...ingredients.boosters];
        const byId = Object.fromEntries(allPickables.map(i => [i.id, i]));

        const vitCount = new Map();
        const tagCount = new Map();

        selectedIds.forEach(id => {
            const it = byId[id];
            if (!it) return;
            (it.vitaminsMinerals || []).forEach(v => vitCount.set(v, (vitCount.get(v) || 0) + 1));
            (it.fitnessTags || []).forEach(t => tagCount.set(t, (tagCount.get(t) || 0) + 1));
        });

        const topVits = [...vitCount.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]).slice(0, 6);
        const topTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]).slice(0, 6);

        return {
            richIn: topVits,
            goodFor: topTags,
            selectedNames: selectedIds.map(id => byId[id]?.name || id),
            selectedIds,
        };
    }

    updateFeedback() {
        const unitPrice = this.calculatePricePerKg();
        const totalPrice = Math.round(unitPrice * this.state.quantityKg);

        const priceEl = document.getElementById('total-price');
        if (priceEl) priceEl.innerText = `₹${totalPrice}`;
        
        const unitPriceEl = document.getElementById('unit-price');
        if (unitPriceEl) unitPriceEl.innerText = `(₹${unitPrice}/kg)`;

        const highlights = this.getHighlights();

        const richEl = document.getElementById('rich-in-chips');
        if (richEl) {
            richEl.innerHTML = (highlights.richIn.length ? highlights.richIn : ['—']).map(t =>
                `<span class="px-3 py-1 rounded-full bg-white border border-amber-100 text-amber-800 text-xs font-bold">${t}</span>`
            ).join('');
        }

        const goodEl = document.getElementById('good-for-chips');
        if (goodEl) {
            goodEl.innerHTML = (highlights.goodFor.length ? highlights.goodFor : ['—']).map(t =>
                `<span class="px-3 py-1 rounded-full bg-white border border-gray-100 text-gray-800 text-xs font-bold">${t}</span>`
            ).join('');
        }

        const selEl = document.getElementById('selected-ingredients');
        if (selEl) {
            const names = highlights.selectedNames;
            selEl.innerHTML = (names.length ? names : ['—']).map(n =>
                `<span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">${n}</span>`
            ).join('');
        }
    }
}
