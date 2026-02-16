// ========================================
// RAVE-READY BINGO - MAIN APPLICATION
// ========================================

// 25 Classic and Modern Drum & Bass Anthems
const DNB_ANTHEMS = [
    "Pendulum - Tarantula",
    "Chase & Status - End Credits",
    "Sub Focus - Rock It",
    "Netsky - Come Alive",
    "High Contrast - If We Ever",
    "Camo & Krooked - Climax",
    "Wilkinson - Afterglow",
    "Sigma - Nobody to Love",
    "Andy C - Heartbeat Loud",
    "Calibre - Drop It Down",
    "Noisia - Stigma",
    "Mefjus - Suicide Bassline",
    "Dimension - UK",
    "Culture Shock - Bunker",
    "Friction - Long Gone Memory",
    "Loadstar - Stepped Outside",
    "Logistics - The Trip",
    "Danny Byrd - Sweet Harmony",
    "Roni Size - Brown Paper Bag",
    "Goldie - Inner City Life",
    "LTJ Bukem - Horizons",
    "DJ Marky - LK",
    "Hybrid Minds - Touch",
    "Etherwood - Souvenirs",
    "Metrik - Freefall"
];

// State Management
const STORAGE_KEY = 'dnb-bingo-state';

class BingoApp {
    constructor() {
        this.grid = document.getElementById('bingoGrid');
        this.counter = document.getElementById('counter');
        this.resetBtn = document.getElementById('resetBtn');
        this.shareBtn = document.getElementById('shareBtn');

        this.state = this.loadState();
        this.init();
    }

    // Initialize the app
    init() {
        this.renderGrid();
        this.updateCounter();
        this.attachEventListeners();
    }

    // Load state from localStorage
    loadState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved state:', e);
            }
        }
        // Initialize with all unchecked
        return DNB_ANTHEMS.map(() => false);
    }

    // Save state to localStorage
    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    // Render the bingo grid
    renderGrid() {
        this.grid.innerHTML = '';
        DNB_ANTHEMS.forEach((anthem, index) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.textContent = anthem;
            cell.dataset.index = index;

            if (this.state[index]) {
                cell.classList.add('checked');
            }

            this.grid.appendChild(cell);
        });
    }

    // Update the counter display
    updateCounter() {
        const checkedCount = this.state.filter(Boolean).length;
        this.counter.textContent = checkedCount;
    }

    // Toggle a cell's checked state
    toggleCell(index) {
        this.state[index] = !this.state[index];
        this.saveState();
        this.updateCounter();

        // Update the cell visually
        const cell = this.grid.querySelector(`[data-index="${index}"]`);
        if (this.state[index]) {
            cell.classList.add('checked');
            this.triggerHaptic();
        } else {
            cell.classList.remove('checked');
        }
    }

    // Reset the board
    resetBoard() {
        if (confirm('Reset the entire board? This cannot be undone.')) {
            this.state = DNB_ANTHEMS.map(() => false);
            this.saveState();
            this.renderGrid();
            this.updateCounter();
            this.triggerHaptic('medium');
        }
    }

    // Share progress
    async shareProgress() {
        const checkedCount = this.state.filter(Boolean).length;
        const shareText = `🔊 DnB Bingo: ${checkedCount}/25 anthems found! Ready for the rave! 🎧`;
        const shareUrl = window.location.href;

        // Try Web Share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'DnB Bingo Progress',
                    text: shareText,
                    url: shareUrl
                });
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.log('Share failed, falling back to clipboard');
                }
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            this.showToast('Progress copied to clipboard! 📋');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            this.showToast('Share failed. Please try again.');
        }
    }

    // Trigger haptic feedback (if supported)
    triggerHaptic(style = 'light') {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30
            };
            navigator.vibrate(patterns[style] || 10);
        }
    }

    // Show a toast notification
    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--neon-green);
            color: var(--bg-black);
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 700;
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Attach event listeners
    attachEventListeners() {
        // Cell clicks
        this.grid.addEventListener('click', (e) => {
            const cell = e.target.closest('.bingo-cell');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                this.toggleCell(index);
            }
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetBoard());

        // Share button
        this.shareBtn.addEventListener('click', () => this.shareProgress());
    }
}

// Add toast animations to the document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BingoApp());
} else {
    new BingoApp();
}
