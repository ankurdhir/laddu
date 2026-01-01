export class Visualizer {
    constructor(configurator) {
        this.configurator = configurator;
        this.container = document.querySelector('.relative.w-48.h-48'); // Target the visualizer container
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Replace static HTML with Canvas
        this.container.innerHTML = '<canvas id="laddoo-chart" width="200" height="200" class="w-full h-full"></canvas>';
        this.canvas = document.getElementById('laddoo-chart');
        this.ctx = this.canvas.getContext('2d');
        
        // Colors mapping
        this.colors = {
            base: '#fde68a', // amber-200
            fat: '#fbbf24',  // amber-400
            sweetener: '#d97706', // amber-600
            nut: '#78350f',  // amber-900 (dark brown)
            seed: '#84cc16', // lime-500
            booster: '#3b82f6' // blue-500 (distinct for whey)
        };

        // Listen for updates
        // We need to hook into the configurator's update cycle.
        // Quickest way: Monkey patch updateFeedback or use an event.
        // For simplicity, I'll poll/animate via requestAnimationFrame or just hook the existing method.
        const originalUpdate = this.configurator.updateFeedback.bind(this.configurator);
        this.configurator.updateFeedback = () => {
            originalUpdate();
            this.draw();
        };

        // Initial draw
        this.draw();
    }

    draw() {
        if (!this.ctx) return;
        
        const state = this.configurator.state;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 10;

        ctx.clearRect(0, 0, width, height);

        // 1. Calculate Segments
        let segments = [];
        
        // Benefits-first builder: selected ingredients (equal share)
        if (state.selected) {
            const selectedIds = Object.keys(state.selected).filter(k => state.selected[k]);
            const mixTotal = 60; // % of chart reserved for mix
            const each = selectedIds.length ? (mixTotal / selectedIds.length) : 0;
            selectedIds.forEach(id => {
                const type = this.getIngredientType(id);
                segments.push({ label: id, percent: each, color: this.colors[type] || '#ccc' });
            });
        }

        // Base/Binder (Remainder)
        const usedPercent = segments.reduce((sum, s) => sum + s.percent, 0);
        const remaining = 100 - usedPercent;
        
        // Split remaining visually into Base, Fat, Sweetener for effect
        // 50% Base, 25% Fat, 25% Sweetener of the remainder
        if (remaining > 0) {
            segments.push({ label: 'base', percent: remaining * 0.5, color: this.colors.base });
            segments.push({ label: 'fat', percent: remaining * 0.25, color: this.colors.fat });
            segments.push({ label: 'sweetener', percent: remaining * 0.25, color: this.colors.sweetener });
        }

        // 2. Draw Doughnut Chart
        let startAngle = 0;

        segments.forEach(seg => {
            const sliceAngle = (seg.percent / 100) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = seg.color;
            ctx.fill();
            
            // Add slight border for separation
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            startAngle += sliceAngle;
        });

        // 3. Cut out the center to make it a doughnut (optional, looks more modern)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // 4. Draw Center Text (Summary)
        ctx.fillStyle = '#78350f'; // amber-900
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${state.quantityKg} kg`, centerX, centerY - 10);
        
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af'; // gray-400
        ctx.fillText('Custom', centerX, centerY + 10);
    }

    getIngredientType(id) {
        // Conservative fallback: infer from ID suffix/known groups
        // (Kept simple to avoid tight coupling; unknowns render as base color.)
        if (['whey'].includes(id)) return 'booster';
        if (['badam','kaju','akhrot','kishmish','gond'].includes(id)) return 'nut';
        if (['makhana','flax','pumpkin','chia','muskmelon'].includes(id)) return 'seed';
        return 'base';
    }
}

