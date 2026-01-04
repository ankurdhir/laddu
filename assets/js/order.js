export class OrderManager {
    constructor(configurator, presets = [], cart = null) {
        this.configurator = configurator;
        this.presets = presets;
        this.cart = cart;
        this.modal = document.getElementById('order-modal');
        this.form = document.getElementById('order-form');
        this.closeBtn = document.getElementById('close-modal');
        this.summaryEl = document.getElementById('order-summary');
        this.qtyInput = document.getElementById('quantityKg');
        this.submitBtn = document.getElementById('submit-order');
        this.confirmedScreen = document.getElementById('order-confirmed');
        this.confirmedOrderIdEl = document.getElementById('confirmed-order-id');
        this.copyOrderIdBtn = document.getElementById('copy-order-id');
        this.whatsappHelpLink = document.getElementById('whatsapp-help');
        this.backToSiteLink = document.getElementById('back-to-site');
        this.viewMyOrdersBtn = document.getElementById('view-my-orders');
        this.myOrdersPanel = document.getElementById('my-orders-panel');
        this.myOrdersList = document.getElementById('my-orders-list');
        this.qtyRow = document.getElementById('quantity-row');

        // Prefer explicit IDs (more robust than "first button in #builder")
        this.triggerBtn = document.getElementById('open-order-modal');
        this.headerTriggerBtn = document.getElementById('order-now-btn');

        // CONFIG: put your Google Apps Script Web App URL here
        // Example: https://script.google.com/macros/s/XXXX/exec
        this.googleSheetsWebhookUrl = 'https://script.google.com/macros/s/AKfycbzPwAx2G6wSqocJUbrj-D9v0xS6jfXqg4MrMKzXWof7SwpmZz0ZZWYxIELCPdi1N6Ll/exec';

        // OTP UI
        this.sendOtpBtn = document.getElementById('send-otp');
        this.verifyOtpBtn = document.getElementById('verify-otp');
        this.otpInput = document.getElementById('otp');
        this.otpStatusEl = document.getElementById('otp-status');
        this.phoneInput = document.getElementById('phone');

        this.otpSessionId = null;
        this.phoneVerified = false;
        this.verifiedPhone = null;

        this.orderContext = { kind: 'custom' }; // {kind:'custom'} | {kind:'preset', presetId} | {kind:'cart'}
        this.init();
    }

    init() {
        if (this.triggerBtn) this.triggerBtn.addEventListener('click', () => this.openModal());
        if (this.headerTriggerBtn) this.headerTriggerBtn.addEventListener('click', () => this.openModal());
        
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeModal());

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Default to custom context
        this.setOrderContext({ kind: 'custom' });

        if (this.sendOtpBtn) {
            this.sendOtpBtn.addEventListener('click', () => this.handleSendOtp());
        }
        if (this.verifyOtpBtn) {
            this.verifyOtpBtn.addEventListener('click', () => this.handleVerifyOtp());
        }

        if (this.copyOrderIdBtn) {
            this.copyOrderIdBtn.addEventListener('click', async () => {
                const txt = this.confirmedOrderIdEl?.innerText || '';
                if (!txt || txt === '—') return;
                try {
                    await navigator.clipboard.writeText(txt);
                    this.copyOrderIdBtn.innerText = 'Copied';
                    setTimeout(() => (this.copyOrderIdBtn.innerText = 'Copy Order ID'), 1200);
                } catch {
                    alert(`Order ID: ${txt}`);
                }
            });
        }

        // Close confirmed overlay on "Back to site"
        if (this.backToSiteLink) {
            this.backToSiteLink.addEventListener('click', () => {
                if (this.confirmedScreen) this.confirmedScreen.classList.add('hidden');
                if (this.myOrdersPanel) this.myOrdersPanel.classList.add('hidden');
            });
        }

        // View My Orders
        if (this.viewMyOrdersBtn) {
            this.viewMyOrdersBtn.addEventListener('click', async () => {
                try {
                    const orders = await this.fetchMyOrders();
                    this.renderMyOrders(orders);
                } catch (e) {
                    alert(e.message || 'Could not fetch orders');
                }
            });
        }
    }

    setOrderContext(ctx) {
        this.orderContext = ctx || { kind: 'custom' };

        if (this.qtyRow) this.qtyRow.classList.remove('hidden');

        if (this.orderContext.kind === 'cart') {
            const snap = this.cart?.getSnapshot?.();
            const totals = snap?.totals || { count: 0, totalKg: 0, totalPrice: 0 };
            if (this.summaryEl) {
                this.summaryEl.innerHTML = `
                    <div class="font-bold">Ordering: Cart (${totals.count} item${totals.count === 1 ? '' : 's'})</div>
                    <div class="text-xs text-amber-900/70 mt-1">${totals.totalKg} kg • Total ₹${totals.totalPrice}</div>
                `;
            }
            if (this.qtyRow) this.qtyRow.classList.add('hidden'); // cart items have their own qty
            if (this.qtyInput) this.qtyInput.value = '1';
            return;
        }

        if (this.orderContext.kind === 'preset') {
            const preset = this.presets.find(p => p.id === this.orderContext.presetId);
            const price = preset ? preset.price : 0;
            if (this.summaryEl) {
                this.summaryEl.innerHTML = preset
                    ? `<div class="font-bold">Ordering: ${preset.name}</div><div class="text-xs text-amber-900/70 mt-1">₹${price}/kg • ${preset.tagline}</div>`
                    : `<div class="font-bold">Ordering: Signature Laddoo</div><div class="text-xs text-amber-900/70 mt-1">Preset not found.</div>`;
            }
            if (this.qtyInput) this.qtyInput.value = '1';
        } else {
            // custom
            const unitPrice = this.configurator?.calculatePricePerKg?.();
            const qty = this.configurator?.state?.quantityKg ?? 1;
            const highlights = this.configurator?.getHighlights?.();
            if (this.summaryEl) {
                this.summaryEl.innerHTML = unitPrice
                    ? `<div class="font-bold">Ordering: Custom Laddoo</div><div class="text-xs text-amber-900/70 mt-1">₹${unitPrice}/kg${highlights?.richIn?.length ? ` • Rich in ${highlights.richIn.slice(0, 3).join(', ')}` : ''}</div>`
                    : `<div class="font-bold">Ordering: Custom Laddoo</div>`;
            }
            if (this.qtyInput) this.qtyInput.value = String(qty);
        }
    }

    openModal() {
        // If user opens modal from header / elsewhere, assume custom unless a preset was set by button click
        if (!this.orderContext) this.setOrderContext({ kind: 'custom' });
        if (this.modal) this.modal.classList.remove('hidden');

        // Reset OTP state for fresh session
        this.phoneVerified = false;
        this.otpSessionId = null;
        this.verifiedPhone = null;
        this.setOtpStatus('Please verify your phone number to place the order.', 'info');
        if (this.submitBtn) this.submitBtn.disabled = true;

        // Ensure OTP UI is enabled
        if (this.otpInput) {
            this.otpInput.disabled = false;
            this.otpInput.value = '';
        }
        if (this.sendOtpBtn) this.sendOtpBtn.disabled = false;
        if (this.verifyOtpBtn) this.verifyOtpBtn.disabled = false;
    }

    closeModal() {
        if (this.modal) this.modal.classList.add('hidden');
    }

    generateOrderId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `LAD-${timestamp}-${random}`.toUpperCase();
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.googleSheetsWebhookUrl) {
            alert('Google Sheets webhook URL is not configured yet. Please add it in assets/js/order.js (googleSheetsWebhookUrl).');
            return;
        }

        if (!this.phoneVerified || !this.otpSessionId) {
            alert('Please verify your phone number (OTP) before placing the order.');
            return;
        }

        // 1. Collect User Data
        const formData = new FormData(this.form);
        const userDetails = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            pincode: formData.get('pincode')
        };

        const qtyKg = Math.max(0.5, Math.min(10, parseFloat(formData.get('quantityKg') || '1')));
        const orderId = this.generateOrderId();

        let orderProduct = null;
        let orderItems = null;

        if (this.orderContext?.kind === 'cart') {
            const snap = this.cart?.getSnapshot?.();
            const items = snap?.items || [];
            if (!items.length) {
                alert('Your cart is empty.');
                return;
            }

            const totalKg = items.reduce((s, it) => s + (Number(it.qtyKg) || 0), 0);
            const totalPrice = items.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);

            orderItems = items.map(it => ({
                id: it.id,
                type: it.type,
                name: it.name,
                qtyKg: it.qtyKg,
                unitPrice: it.unitPrice,
                totalPrice: it.totalPrice,
                meta: it.meta || {},
                highlights: it.highlights || {},
            }));

            const itemsSummary = items
                .map(it => `${it.name} (${it.qtyKg}kg) ₹${it.totalPrice}`)
                .join(' | ');

            // Aggregate a simple "Rich in" for the cart
            const richIn = Array.from(new Set(
                items.flatMap(it => (it.highlights?.richIn || []).slice(0, 3))
            )).slice(0, 8);

            orderProduct = {
                type: 'Cart Order',
                name: `Cart (${items.length} items)`,
                quantity: `${Math.round(totalKg * 2) / 2}kg`,
                ingredients: itemsSummary || 'Multiple items',
                nutrition: richIn.length ? `Rich in: ${richIn.join(', ')}` : 'Ingredient-based benefits',
                totalPrice: Math.round(totalPrice),
                unitPrice: '', // not meaningful for cart
            };
        } else if (this.orderContext?.kind === 'preset') {
            const preset = this.presets.find(p => p.id === this.orderContext.presetId);
            if (!preset) {
                alert('Preset not found. Please try again.');
                return;
            }

            orderProduct = {
                type: 'Signature Laddoo',
                name: preset.name,
                quantity: `${qtyKg}kg`,
                ingredients: this.formatPresetIngredients(preset),
                nutrition: 'Approx. values (per 100g) shown on site',
                totalPrice: Math.round(preset.price * qtyKg),
                unitPrice: preset.price,
            };
        } else {
            // Custom order uses configurator state
            const configState = this.configurator.state;
            const unitPrice = this.configurator.calculatePricePerKg();
            const highlights = this.configurator.getHighlights();

            const ingredientsList = [];
            ingredientsList.push(`Base: ${configState.base}`);
            ingredientsList.push(`Fat: ${configState.fat}`);
            ingredientsList.push(`Sweetener: ${configState.sweetener}`);
            (highlights.selectedNames || []).forEach(n => ingredientsList.push(n));

            orderProduct = {
                type: 'Custom Laddoo',
                name: 'Custom Mix',
                quantity: `${qtyKg}kg`,
                ingredients: ingredientsList.join(', '),
                nutrition: highlights.richIn?.length ? `Rich in: ${highlights.richIn.join(', ')}` : 'Ingredient-based benefits',
                totalPrice: Math.round(unitPrice * qtyKg),
                unitPrice: unitPrice,
            };
        }

        const orderData = {
            id: orderId,
            date: new Date().toISOString(),
            user: userDetails,
            product: orderProduct,
            items: orderItems || undefined,
        };

        console.log('Order Generated:', orderData);

        // Disable submit while sending
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
            this.submitBtn.innerText = 'Placing Order…';
        }

        this.placeOrder(orderData)
            .then(() => {
                this.closeModal();
                this.showConfirmed(orderData);
                // Clear cart on successful checkout
                if (this.orderContext?.kind === 'cart' && this.cart?.clear) {
                    this.cart.clear();
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Could not save the order. Please try again.');
            })
            .finally(() => {
                if (this.submitBtn) {
                    this.submitBtn.disabled = false;
                    this.submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
                    this.submitBtn.innerText = 'Place Order';
                }
            });
    }

    formatPresetIngredients(preset) {
        if (!preset?.config?.ingredients) return 'Standard recipe';
        const parts = [];
        if (preset.config.base) parts.push(`Base: ${preset.config.base}`);
        if (preset.config.fat) parts.push(`Fat: ${preset.config.fat}`);
        if (preset.config.sweetener) parts.push(`Sweetener: ${preset.config.sweetener}`);
        for (const [id, val] of Object.entries(preset.config.ingredients)) {
            if (val > 0) parts.push(`${id}: ${val}%`);
        }
        return parts.join(', ');
    }

    async sendToGoogleSheets(data) {
        await fetch(this.googleSheetsWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async postAction(action, body) {
        // Deprecated: Apps Script Web Apps often trigger CORS errors from static sites.
        // Use JSONP via doGet endpoints instead (see jsonpAction()).
        throw new Error(`postAction(${action}) not supported. Use jsonpAction().`);
    }

    jsonpAction(action, params = {}) {
        // Calls Apps Script doGet?action=...&callback=... to avoid CORS.
        return new Promise((resolve, reject) => {
            if (!this.googleSheetsWebhookUrl) return reject(new Error('Missing googleSheetsWebhookUrl'));

            const cbName = `__laddoo_cb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
            const url = new URL(this.googleSheetsWebhookUrl);
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
    }

    async handleSendOtp() {
        if (!this.googleSheetsWebhookUrl) {
            alert('Configure Google Apps Script Web App URL in assets/js/order.js first.');
            return;
        }
        const phone = (this.phoneInput?.value || '').trim();
        if (!phone) {
            alert('Enter your phone number first.');
            return;
        }

        this.setOtpStatus('Sending OTP…', 'info');
        if (this.sendOtpBtn) this.sendOtpBtn.disabled = true;

        try {
            const res = await this.jsonpAction('sendOtp', { phone });
            if (!res.ok) throw new Error(res.error || 'Failed to send OTP');

            this.otpSessionId = res.sessionId || null;
            this.phoneVerified = false;
            this.verifiedPhone = null;

            // TEST_MODE support: show OTP hint (remove in production)
            if (res.testOtp) {
                this.setOtpStatus(`OTP sent (TEST MODE): ${res.testOtp}`, 'info');
            } else {
                this.setOtpStatus('OTP sent. Please enter the 6-digit code.', 'info');
            }
        } catch (err) {
            console.error(err);
            this.setOtpStatus(err.message || 'Failed to send OTP', 'error');
        } finally {
            if (this.sendOtpBtn) this.sendOtpBtn.disabled = false;
        }
    }

    async handleVerifyOtp() {
        const otp = (this.otpInput?.value || '').trim();
        if (!this.otpSessionId) {
            alert('Please send OTP first.');
            return;
        }
        if (!/^\d{6}$/.test(otp)) {
            alert('Enter a valid 6-digit OTP.');
            return;
        }

        this.setOtpStatus('Verifying…', 'info');
        if (this.verifyOtpBtn) this.verifyOtpBtn.disabled = true;

        try {
            const res = await this.jsonpAction('verifyOtp', { sessionId: this.otpSessionId, otp });
            if (!res.ok) throw new Error(res.error || 'OTP verification failed');

            this.phoneVerified = true;
            this.verifiedPhone = (this.phoneInput?.value || '').trim();
            this.setOtpStatus('Phone verified ✓', 'success');
            if (this.submitBtn) this.submitBtn.disabled = false;

            // Important: prevent browser validation issues on submit
            // (if OTP input has partial value/pattern mismatch)
            if (this.otpInput) {
                this.otpInput.value = '';
                this.otpInput.disabled = true;
            }
            if (this.sendOtpBtn) this.sendOtpBtn.disabled = true;
            if (this.verifyOtpBtn) this.verifyOtpBtn.disabled = true;
        } catch (err) {
            console.error(err);
            this.setOtpStatus(err.message || 'Verification failed', 'error');
        } finally {
            if (this.verifyOtpBtn) this.verifyOtpBtn.disabled = false;
        }
    }

    setOtpStatus(text, type) {
        if (!this.otpStatusEl) return;
        this.otpStatusEl.innerText = text || '';
        this.otpStatusEl.className = 'text-xs mb-3 ' + (
            type === 'success' ? 'text-green-700' :
            type === 'error' ? 'text-red-700' :
            'text-gray-600'
        );
    }

    async placeOrder(orderData) {
        // Use POST (no-cors) to avoid URL size limits, then confirm via JSONP checkOrder.
        await fetch(this.googleSheetsWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'placeOrder',
                requireOtp: true,
                sessionId: this.otpSessionId,
                order: orderData,
            }),
        });

        // Confirm write (poll a few times)
        for (let i = 0; i < 6; i++) {
            const res = await this.jsonpAction('checkOrder', {
                sessionId: this.otpSessionId,
                orderId: orderData.id,
            });
            if (res && res.ok && res.found) return;
            await new Promise(r => setTimeout(r, 700));
        }

        // If not confirmed, fetch last server-side error (if any) and surface it.
        try {
            const last = await this.jsonpAction('getLastError', { sessionId: this.otpSessionId });
            const msg = last?.message ? `\n\nServer error: ${last.message}` : '';
            throw new Error(`Order submitted but not confirmed in sheet yet. Please try again in a minute.${msg}`);
        } catch (e) {
            throw new Error('Order submitted but not confirmed in sheet yet. Please try again in a minute.');
        }
    }

    async fetchMyOrders() {
        if (!this.otpSessionId) throw new Error('Missing session');
        const res = await this.jsonpAction('getOrders', { sessionId: this.otpSessionId });
        if (!res?.ok) throw new Error(res?.error || 'Could not fetch orders');
        return res.orders || [];
    }

    buildWhatsAppUrl(data) {
        const phone = '919811150234'; // Replace with business phone
        let msg = `Hi! I need help with my order.\n\n`;
        msg += `Order ID: ${data.id}\n`;
        msg += `Name: ${data.user.name}\n`;
        msg += `Phone: ${data.user.phone}\n\n`;
        msg += `${data.product.type}: ${data.product.name} (${data.product.quantity})\n`;
        if (Array.isArray(data.items) && data.items.length) {
            msg += `\nItems:\n`;
            data.items.forEach(it => {
                msg += `- ${it.name} (${it.qtyKg}kg) ₹${it.totalPrice}\n`;
            });
        }
        msg += `\nTotal: ₹${data.product.totalPrice}\n`;
        const encodedMsg = encodeURIComponent(msg);
        return `https://wa.me/${phone}?text=${encodedMsg}`;
    }

    showConfirmed(orderData) {
        if (this.confirmedOrderIdEl) this.confirmedOrderIdEl.innerText = orderData.id;
        if (this.whatsappHelpLink) this.whatsappHelpLink.href = this.buildWhatsAppUrl(orderData);
        if (this.confirmedScreen) this.confirmedScreen.classList.remove('hidden');
    }

    renderMyOrders(orders) {
        if (!this.myOrdersPanel || !this.myOrdersList) return;
        this.myOrdersPanel.classList.remove('hidden');

        if (!orders || orders.length === 0) {
            this.myOrdersList.innerHTML = `<div class="text-sm text-gray-600">No orders found for this number yet.</div>`;
            return;
        }

        this.myOrdersList.innerHTML = orders.map(o => `
            <div class="p-4 rounded-2xl border border-amber-100 bg-amber-50">
                <div class="flex items-center justify-between gap-3">
                    <div class="font-mono font-bold text-amber-900">${o.id}</div>
                    <div class="text-sm font-bold text-gray-800">₹${o.total}</div>
                </div>
                <div class="text-sm text-gray-700 mt-1">${o.productName} • ${o.quantity} kg</div>
                <div class="text-xs text-gray-500 mt-1">${o.date}</div>
            </div>
        `).join('');
    }
}

