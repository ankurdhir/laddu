// Main Application Logic

import { ingredients, presets } from './data.js';
import { Configurator } from './configurator.js';
import { OrderManager } from './order.js';
import { Visualizer } from './visualizer.js';
import { Cart } from './cart.js';

// Used by index.html to detect "modules failed to load" cases (e.g. file://).
window.__APP_BOOTED__ = true;

// DOM Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

// Mobile Menu Toggle
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// Function to render Presets
function renderPresets(filterTag = null) {
    const container = document.getElementById('preset-container');
    const titleEl = document.getElementById('presets-title');
    const resetBtn = document.getElementById('reset-filter');
    
    if (!container) return;

    // Filter Logic
    let displayPresets = presets;
    if (filterTag) {
        // Simple case-insensitive partial match
        displayPresets = presets.filter(p => 
            p.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())) ||
            p.name.toLowerCase().includes(filterTag.toLowerCase())
        );
        
        // Update UI
        if(titleEl) titleEl.innerText = `${filterTag} Laddoos`;
        if(resetBtn) resetBtn.classList.remove('hidden');
    } else {
        if(titleEl) titleEl.innerText = 'Signature Laddoos';
        if(resetBtn) resetBtn.classList.add('hidden');
    }

    // Handle No Results
    if (displayPresets.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">No predefined laddoos found for "${filterTag}".</p>
                <a href="#builder" class="text-amber-600 font-bold hover:underline mt-2 inline-block">Build your own instead!</a>
            </div>
        `;
        return;
    }

    container.innerHTML = displayPresets.map(product => `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 border border-amber-100 h-full flex flex-col">
            <div class="bg-amber-200 relative overflow-hidden group aspect-[3/4]">
                ${product.image
                    ? `
                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            loading="eager"
                            decoding="async"
                            class="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-500 group-hover:scale-105"
                            onerror="this.style.display='none'"
                        >
                        <div class="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent z-20"></div>
                    `
                    : `
                        <div class="absolute inset-0 bg-amber-300 flex items-center justify-center text-amber-800 font-serif text-2xl opacity-50">
                            ${product.name.charAt(0)}
                        </div>
                    `
                }
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-amber-800 uppercase tracking-wider shadow-sm z-30">
                    ${product.tagline}
                </div>
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex flex-wrap gap-2 mb-3">
                    ${product.tags.map(tag => `
                        <span class="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md font-medium">${tag}</span>
                    `).join('')}
                </div>
                <h3 class="font-serif text-xl font-bold text-gray-900 mb-1">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">${product.description}</p>
                ${product.primaryIngredient ? `
                    <div class="text-xs text-gray-700 mb-3">
                        <div class="font-bold text-amber-900 mb-2">Primary ingredients</div>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-1 bg-white border border-amber-100 text-amber-800 text-xs rounded-md font-semibold">${product.primaryIngredient}</span>
                            <span class="px-2 py-1 bg-white border border-amber-100 text-amber-800 text-xs rounded-md font-semibold">Aata</span>
                            <span class="px-2 py-1 bg-white border border-amber-100 text-amber-800 text-xs rounded-md font-semibold">Jaggery</span>
                        </div>
                    </div>
                ` : ''}
                ${Array.isArray(product.keyIngredients) && product.keyIngredients.length
                    ? `<div class="flex flex-wrap gap-2 mb-3">
                        ${product.keyIngredients.slice(0, 5).map(i => `<span class="px-2 py-1 bg-white border border-amber-100 text-amber-800 text-xs rounded-md font-semibold">${i}</span>`).join('')}
                      </div>`
                    : ''
                }
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-amber-50">
                    <span class="text-lg font-bold text-amber-700">₹${product.price}<span class="text-sm text-gray-500 font-normal">/kg</span></span>
                    <button type="button" data-add-preset="${product.id}" class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Wire up "Add to Cart" buttons after render
    container.querySelectorAll('[data-add-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetId = btn.getAttribute('data-add-preset');
            const preset = presets.find(p => p.id === presetId);
            if (!preset || !window.cart) return;
            window.cart.addPreset(preset, 1);
            
            // Visual feedback
            const originalText = btn.innerText;
            btn.innerText = 'Added ✓';
            btn.classList.add('bg-green-600', 'hover:bg-green-700');
            btn.classList.remove('bg-amber-600', 'hover:bg-amber-700');
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                btn.classList.add('bg-amber-600', 'hover:bg-amber-700');
            }, 2000);
        });
    });
}

function renderIngredients() {
    const sectionsEl = document.getElementById('ingredient-sections');
    if (!sectionsEl) return;

    const groups = [
        { key: 'nuts', title: 'Nuts & Dry Fruits', items: ingredients.nuts },
        { key: 'seeds', title: 'Seeds', items: ingredients.seeds },
        { key: 'bases', title: 'Bases / Binders', items: ingredients.bases },
        { key: 'fats', title: 'Fats', items: ingredients.fats },
        { key: 'sweeteners', title: 'Sweeteners', items: ingredients.sweeteners },
        { key: 'boosters', title: 'Protein Add-ons', items: ingredients.boosters },
    ];

    const sourceNoteByGroup = {
        nuts: 'Suggested source: <a class="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4" href="https://happilo.com/" target="_blank" rel="noopener">Happilo</a>',
        seeds: 'Suggested source: <a class="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4" href="https://happilo.com/" target="_blank" rel="noopener">Happilo</a>',
        boosters: 'Suggested source: <a class="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4" href="https://www.optimumnutrition.com/" target="_blank" rel="noopener">Optimum Nutrition</a>',
        sweeteners: 'Suggested source: <a class="font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4" href="https://kapiva.in/" target="_blank" rel="noopener">Kapiva Honey</a> (for Honey)',
    };

    sectionsEl.innerHTML = groups.map((g, index) => `
        <div class="border border-amber-100 rounded-xl overflow-hidden bg-amber-50/50 mb-4">
            <button class="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-amber-50 transition-colors" onclick="toggleAccordion(this)">
                <div class="flex items-baseline gap-3">
                    <h3 class="font-serif text-xl font-bold text-amber-900">${g.title}</h3>
                    <span class="text-xs text-gray-500">${g.items.length} items</span>
                </div>
                <i data-lucide="chevron-down" class="w-5 h-5 text-amber-400 transition-transform duration-300"></i>
            </button>
            
            <div class="hidden accordion-content border-t border-amber-100 p-5 bg-white">
                ${sourceNoteByGroup[g.key] ? `<div class="text-sm text-gray-600 mb-4">${sourceNoteByGroup[g.key]}</div>` : ''}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${g.items.map(it => `
                        <div class="p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                            <div class="font-bold text-amber-900">${it.name}</div>
                            <div class="text-sm text-gray-700 mt-1">${it.benefit}</div>
                            <div class="flex flex-wrap gap-2 mt-3">
                                ${(it.vitaminsMinerals || []).map(v => `<span class="px-2 py-1 rounded-md bg-white text-amber-800 text-[10px] font-bold border border-amber-100">${v}</span>`).join('')}
                            </div>
                            <div class="flex flex-wrap gap-2 mt-2">
                                ${(it.fitnessTags || []).map(t => `<span class="px-2 py-1 rounded-md bg-white text-gray-700 text-[10px] font-bold border border-gray-100">${t}</span>`).join('')}
                                ${(it.allergens || []).length ? `<span class="px-2 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">Allergen</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Re-initialize icons for the new content
    if (window.lucide) lucide.createIcons();
}

// Accordion Toggle Helper (Global)
window.toggleAccordion = (btn) => {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('[data-lucide="chevron-down"]');
    
    content.classList.toggle('hidden');
    if (icon) {
        icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

// Global Configurator Instance
window.configurator = null;
window.cart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
    renderIngredients();
    renderPresets();
    
    // Initialize Configurator if element exists
    if (document.getElementById('configurator-controls')) {
        window.configurator = new Configurator();
        window.visualizer = new Visualizer(window.configurator);
        window.orderManager = new OrderManager(window.configurator, presets, window.cart);
    }

    // My Orders (Main Page) modal wiring
    const myOrdersModal = document.getElementById('my-orders-modal');
    const myOrdersBtn = document.getElementById('my-orders-btn');
    const myOrdersBtnMobile = document.getElementById('my-orders-btn-mobile');
    const closeMyOrders = document.getElementById('close-my-orders');
    const myOrdersPhone = document.getElementById('my-orders-phone');
    const myOrdersSendOtp = document.getElementById('my-orders-send-otp');
    const myOrdersVerifyOtp = document.getElementById('my-orders-verify-otp');
    const myOrdersOtp = document.getElementById('my-orders-otp');
    const myOrdersOtpStatus = document.getElementById('my-orders-otp-status');
    const myOrdersFetch = document.getElementById('my-orders-fetch');
    const myOrdersResults = document.getElementById('my-orders-results');
    const myOrdersList = document.getElementById('my-orders-list-main');

    let myOrdersSessionId = null;
    let myOrdersVerified = false;

    const setMyOrdersStatus = (text, type) => {
        if (!myOrdersOtpStatus) return;
        myOrdersOtpStatus.innerText = text || '';
        myOrdersOtpStatus.className = 'text-xs mb-3 ' + (
            type === 'success' ? 'text-green-700' :
            type === 'error' ? 'text-red-700' :
            'text-gray-600'
        );
    };

    const openMyOrders = () => {
        if (!myOrdersModal) return;
        myOrdersModal.classList.remove('hidden');
        // reset state
        myOrdersSessionId = null;
        myOrdersVerified = false;
        if (myOrdersOtp) { myOrdersOtp.value = ''; myOrdersOtp.disabled = false; }
        if (myOrdersSendOtp) myOrdersSendOtp.disabled = false;
        if (myOrdersVerifyOtp) myOrdersVerifyOtp.disabled = false;
        if (myOrdersFetch) myOrdersFetch.disabled = true;
        if (myOrdersResults) myOrdersResults.classList.add('hidden');
        setMyOrdersStatus('Verify your phone to fetch your orders.', 'info');
        if (window.lucide) lucide.createIcons();
    };
    const closeMyOrdersModal = () => {
        if (!myOrdersModal) return;
        myOrdersModal.classList.add('hidden');
    };

    if (myOrdersBtn) myOrdersBtn.addEventListener('click', openMyOrders);
    if (myOrdersBtnMobile) myOrdersBtnMobile.addEventListener('click', () => {
        openMyOrders();
        const mm = document.getElementById('mobile-menu');
        if (mm) mm.classList.add('hidden');
    });
    if (closeMyOrders) closeMyOrders.addEventListener('click', closeMyOrdersModal);
    if (myOrdersModal) {
        myOrdersModal.addEventListener('click', (e) => {
            if (e.target === myOrdersModal.firstElementChild) closeMyOrdersModal();
        });
    }

    const jsonpAction = (action, params = {}) => {
        // Reuse the same Apps Script URL as OrderManager
        const urlBase = window.orderManager?.googleSheetsWebhookUrl;
        if (!urlBase) return Promise.reject(new Error('Missing Apps Script URL'));
        return new Promise((resolve, reject) => {
            const cbName = `__laddoo_mo_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
            const url = new URL(urlBase);
            url.searchParams.set('action', action);
            url.searchParams.set('callback', cbName);
            Object.entries(params).forEach(([k, v]) => {
                if (v === undefined || v === null) return;
                url.searchParams.set(k, String(v));
            });
            const script = document.createElement('script');
            script.src = url.toString();
            script.async = true;
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('Request timed out'));
            }, 12000);
            const cleanup = () => {
                clearTimeout(timeout);
                delete window[cbName];
                script.remove();
            };
            window[cbName] = (data) => {
                cleanup();
                resolve(data);
            };
            script.onerror = () => {
                cleanup();
                reject(new Error('Network error'));
            };
            document.head.appendChild(script);
        });
    };

    if (myOrdersSendOtp) {
        myOrdersSendOtp.addEventListener('click', async () => {
            const phone = (myOrdersPhone?.value || '').trim();
            if (!phone) return alert('Enter your phone number first.');
            setMyOrdersStatus('Sending OTP…', 'info');
            myOrdersSendOtp.disabled = true;
            try {
                const res = await jsonpAction('sendOtp', { phone });
                if (!res.ok) throw new Error(res.error || 'Failed to send OTP');
                myOrdersSessionId = res.sessionId || null;
                myOrdersVerified = false;
                if (res.testOtp) setMyOrdersStatus(`OTP sent (TEST MODE): ${res.testOtp}`, 'info');
                else setMyOrdersStatus('OTP sent. Please enter the 6-digit code.', 'info');
            } catch (e) {
                setMyOrdersStatus(e.message || 'Failed to send OTP', 'error');
            } finally {
                myOrdersSendOtp.disabled = false;
            }
        });
    }

    if (myOrdersVerifyOtp) {
        myOrdersVerifyOtp.addEventListener('click', async () => {
            const otp = (myOrdersOtp?.value || '').trim();
            if (!myOrdersSessionId) return alert('Please send OTP first.');
            if (!/^\d{6}$/.test(otp)) return alert('Enter a valid 6-digit OTP.');
            setMyOrdersStatus('Verifying…', 'info');
            myOrdersVerifyOtp.disabled = true;
            try {
                const res = await jsonpAction('verifyOtp', { sessionId: myOrdersSessionId, otp });
                if (!res.ok) throw new Error(res.error || 'OTP verification failed');
                myOrdersVerified = true;
                setMyOrdersStatus('Phone verified ✓', 'success');
                if (myOrdersFetch) myOrdersFetch.disabled = false;
                if (myOrdersOtp) { myOrdersOtp.value = ''; myOrdersOtp.disabled = true; }
                if (myOrdersSendOtp) myOrdersSendOtp.disabled = true;
                if (myOrdersVerifyOtp) myOrdersVerifyOtp.disabled = true;
            } catch (e) {
                setMyOrdersStatus(e.message || 'Verification failed', 'error');
            } finally {
                myOrdersVerifyOtp.disabled = false;
            }
        });
    }

    if (myOrdersFetch) {
        myOrdersFetch.addEventListener('click', async () => {
            if (!myOrdersVerified || !myOrdersSessionId) return alert('Please verify OTP first.');
            myOrdersFetch.disabled = true;
            try {
                const res = await jsonpAction('getOrders', { sessionId: myOrdersSessionId });
                if (!res?.ok) throw new Error(res?.error || 'Could not fetch orders');
                const orders = res.orders || [];
                if (myOrdersResults) myOrdersResults.classList.remove('hidden');
                if (!myOrdersList) return;

                if (!orders.length) {
                    myOrdersList.innerHTML = `<div class="text-sm text-gray-600">No orders found for this number yet.</div>`;
                } else {
                    myOrdersList.innerHTML = orders.map(o => {
                        const items = (() => {
                            try { return o.itemsJson ? JSON.parse(o.itemsJson) : null; } catch { return null; }
                        })();
                        const itemsHtml = Array.isArray(items) && items.length
                            ? `<div class="mt-2 text-xs text-gray-600">
                                 ${items.slice(0, 5).map(it => `• ${it.name} (${it.qtyKg}kg) ₹${it.totalPrice}`).join('<br>')}
                               </div>`
                            : '';
                        return `
                            <div class="p-4 rounded-2xl border border-amber-100 bg-amber-50">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="font-mono font-bold text-amber-900">${o.id}</div>
                                    <div class="text-sm font-bold text-gray-800">₹${o.total}</div>
                                </div>
                                <div class="text-sm text-gray-700 mt-1">${o.productName} • ${o.quantity} kg</div>
                                <div class="text-xs text-gray-500 mt-1">${o.date}</div>
                                ${itemsHtml}
                            </div>
                        `;
                    }).join('');
                }
            } catch (e) {
                alert(e.message || 'Could not fetch orders');
            } finally {
                myOrdersFetch.disabled = false;
            }
        });
    }

    // Cart UI wiring
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBtn = document.getElementById('cart-btn');
    const cartBtnMobileNav = document.getElementById('cart-btn-mobile-nav');
    const cartClose = document.getElementById('cart-close');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartSubtitleEl = document.getElementById('cart-subtitle');
    const cartCountEl = document.getElementById('cart-count');
    const cartCountMobileNavEl = document.getElementById('cart-count-mobile-nav');
    const cartCheckoutBtn = document.getElementById('cart-checkout');
    const cartClearBtn = document.getElementById('cart-clear');
    const openCartFromBuilder = document.getElementById('open-cart-from-builder');

    const openCart = () => {
        if (!cartDrawer) return;
        cartDrawer.classList.remove('hidden');
        renderCart();
        if (window.lucide) lucide.createIcons();
    };
    const closeCart = () => {
        if (!cartDrawer) return;
        cartDrawer.classList.add('hidden');
    };

    const renderCart = () => {
        if (!window.cart || !cartItemsEl || !cartTotalEl || !cartSubtitleEl || !cartCheckoutBtn) return;
        const snap = window.cart.getSnapshot();
        const { items, totals } = snap;

        cartSubtitleEl.innerText = `${totals.count} item${totals.count === 1 ? '' : 's'} • ${totals.totalKg} kg`;
        cartTotalEl.innerText = `₹${totals.totalPrice}`;
        cartCheckoutBtn.disabled = totals.count === 0;

        cartItemsEl.innerHTML = items.length ? items.map(it => `
            <div class="p-4 rounded-2xl border border-amber-100 bg-amber-50">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <div class="font-bold text-gray-900">${it.name}</div>
                        <div class="text-xs text-gray-600 mt-1">${it.type === 'preset' ? 'Signature laddoo' : 'Custom mix'}</div>
                        ${it.type === 'custom' && it.highlights?.richIn?.length ? `<div class="text-xs text-amber-900/70 mt-1">Rich in: ${it.highlights.richIn.slice(0,3).join(', ')}</div>` : ''}
                    </div>
                    <button class="text-gray-500 hover:text-red-600" data-cart-remove="${it.id}" title="Remove">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center gap-2">
                        <label class="text-xs text-gray-600 font-bold">kg</label>
                        <input data-cart-qty="${it.id}" type="number" min="0.5" max="10" step="0.5" value="${it.qtyKg}"
                            class="w-24 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200"/>
                    </div>
                    <div class="text-sm font-bold text-amber-800">₹${it.totalPrice}</div>
                </div>
            </div>
        `).join('') : `<div class="text-sm text-gray-600">Your cart is empty. Add a laddoo to begin.</div>`;

        // Wire remove + qty updates
        cartItemsEl.querySelectorAll('[data-cart-remove]').forEach(btn => {
            btn.addEventListener('click', () => window.cart.removeItem(btn.getAttribute('data-cart-remove')));
        });
        cartItemsEl.querySelectorAll('[data-cart-qty]').forEach(inp => {
            inp.addEventListener('change', () => window.cart.updateQty(inp.getAttribute('data-cart-qty'), inp.value));
        });
    };

    const updateBadge = () => {
        if (!window.cart) return;
        const totals = window.cart.getTotals();
        const show = totals.count > 0;
        if (cartCountEl) {
            cartCountEl.classList.toggle('hidden', !show);
            cartCountEl.innerText = String(totals.count);
        }
        if (cartCountMobileNavEl) {
            cartCountMobileNavEl.classList.toggle('hidden', !show);
            cartCountMobileNavEl.innerText = String(totals.count);
        }
    };

    updateBadge();
    window.addEventListener('cart:updated', () => {
        updateBadge();
        renderCart();
    });

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartBtnMobileNav) cartBtnMobileNav.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
    if (openCartFromBuilder) openCartFromBuilder.addEventListener('click', openCart);

    if (cartClearBtn) cartClearBtn.addEventListener('click', () => window.cart.clear());
    if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', () => {
        closeCart();
        if (window.orderManager) {
            window.orderManager.setOrderContext({ kind: 'cart' });
            window.orderManager.openModal();
        }
    });

    // Add custom to cart button
    const addCustomBtn = document.getElementById('add-custom-to-cart');
    if (addCustomBtn) {
        addCustomBtn.addEventListener('click', () => {
            if (!window.configurator || !window.cart) return;
            const unitPrice = window.configurator.calculatePricePerKg();
            const qtyKg = window.configurator.state.quantityKg;
            const highlights = window.configurator.getHighlights();
            const meta = {
                goal: window.configurator.state.goal,
                base: window.configurator.state.base,
                fat: window.configurator.state.fat,
                sweetener: window.configurator.state.sweetener,
                selectedIds: highlights.selectedIds || [],
            };
            window.cart.addCustom({ name: 'Custom Mix', unitPrice, meta, highlights }, qtyKg);
        });
    }

    // Goal Filter Click Handlers (Global - only for Goal Selection section)
    document.querySelectorAll('#goal-grid [data-goal]').forEach(card => {
        card.addEventListener('click', () => {
            const goal = card.dataset.goal;
            // Scroll to presets
            const presetsSection = document.getElementById('presets');
            if (presetsSection) {
                presetsSection.scrollIntoView({ behavior: 'smooth' });
                // Filter presets
                renderPresets(goal);
            }
        });
    });

    // Reset Filter Handler
    const resetBtn = document.getElementById('reset-filter');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            renderPresets(); // clear filter
        });
    }
    
    console.log('App Initialized');
});

// Helper to prefill config
window.prefillConfig = (presetId) => {
    // Find the preset by ID
    const preset = presets.find(p => p.id === presetId);
    
    if (preset && preset.config && window.configurator) {
        // Load the config into the configurator instance
        window.configurator.loadPreset(preset.config);
        console.log(`Loaded preset configuration for: ${preset.name}`);
    } else {
        console.warn(`Preset not found or missing config for ID: ${presetId}`);
    }
};
