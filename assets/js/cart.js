// Lightweight Cart (static-site friendly)
// - Persists to localStorage
// - Stores multiple items (preset/custom)
// - Per-kg quantities only

const STORAGE_KEY = 'laddoo_cart_v1';

function clampQtyKg(q) {
  const n = Number(q);
  if (!Number.isFinite(n)) return 1;
  // step 0.5
  const stepped = Math.round(n * 2) / 2;
  return Math.max(0.5, Math.min(10, stepped));
}

function uid() {
  return `ci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export class Cart {
  constructor() {
    this.state = { items: [] };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        this.state.items = parsed.items;
      }
    } catch {
      // ignore
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  emit() {
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: this.getSnapshot() }));
  }

  getItems() {
    return this.state.items.slice();
  }

  clear() {
    this.state.items = [];
    this.save();
    this.emit();
  }

  removeItem(id) {
    this.state.items = this.state.items.filter(i => i.id !== id);
    this.save();
    this.emit();
  }

  updateQty(id, qtyKg) {
    const q = clampQtyKg(qtyKg);
    const it = this.state.items.find(i => i.id === id);
    if (!it) return;
    it.qtyKg = q;
    it.totalPrice = Math.round((Number(it.unitPrice) || 0) * q);
    this.save();
    this.emit();
  }

  addPreset(preset, qtyKg = 1) {
    const q = clampQtyKg(qtyKg);
    // Merge identical preset by presetId
    const existing = this.state.items.find(i => i.type === 'preset' && i.meta?.presetId === preset.id);
    if (existing) {
      const newQty = clampQtyKg((existing.qtyKg || 0) + q);
      existing.qtyKg = newQty;
      existing.unitPrice = preset.price;
      existing.totalPrice = Math.round(preset.price * newQty);
      this.save();
      this.emit();
      return existing.id;
    }

    const item = {
      id: uid(),
      type: 'preset',
      name: preset.name,
      qtyKg: q,
      unitPrice: preset.price,
      totalPrice: Math.round(preset.price * q),
      meta: {
        presetId: preset.id,
        tagline: preset.tagline,
      },
    };
    this.state.items.push(item);
    this.save();
    this.emit();
    return item.id;
  }

  addCustom(custom, qtyKg = 1) {
    const q = clampQtyKg(qtyKg);
    const item = {
      id: uid(),
      type: 'custom',
      name: custom.name || 'Custom Mix',
      qtyKg: q,
      unitPrice: Number(custom.unitPrice) || 0,
      totalPrice: Math.round((Number(custom.unitPrice) || 0) * q),
      meta: custom.meta || {},
      highlights: custom.highlights || {},
    };
    this.state.items.push(item);
    this.save();
    this.emit();
    return item.id;
  }

  getTotals() {
    const items = this.state.items;
    const totalKg = items.reduce((s, i) => s + (Number(i.qtyKg) || 0), 0);
    const totalPrice = items.reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);
    return { count: items.length, totalKg: Math.round(totalKg * 2) / 2, totalPrice };
  }

  getSnapshot() {
    return { items: this.getItems(), totals: this.getTotals() };
  }
}


