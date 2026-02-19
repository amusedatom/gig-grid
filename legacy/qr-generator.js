// ========================================
// QR CODE GENERATOR
// Wrapper for QRCode.js library
// ========================================

/**
 * Generate QR code for a URL
 * @param {string} containerId - ID of container element
 * @param {string} url - URL to encode
 * @param {Object} options - QR code options
 */
function generateQRCode(containerId, url, options = {}) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    // Clear existing QR code
    container.innerHTML = '';

    const defaults = {
        width: 256,
        height: 256,
        colorDark: '#00ff00',  // Neon green
        colorLight: '#000000', // Black background
        correctLevel: QRCode.CorrectLevel.H
    };

    const qrOptions = { ...defaults, ...options };

    try {
        new QRCode(container, {
            text: url,
            ...qrOptions
        });
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        container.innerHTML = '<p style="color: #ff00ff;">QR Code generation failed</p>';
    }
}

/**
 * Show QR code modal
 * @param {string} url - URL to encode
 * @param {string} gameName - Name of the game
 */
function showQRCodeModal(url, gameName) {
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrCodeContainer');
    const urlDisplay = document.getElementById('shareUrl');
    const gameNameDisplay = document.getElementById('qrGameName');

    if (!modal) {
        console.error('QR modal not found');
        return;
    }

    // Update modal content
    if (gameNameDisplay) {
        gameNameDisplay.textContent = gameName;
    }

    if (urlDisplay) {
        urlDisplay.value = url;
    }

    // Generate QR code
    generateQRCode('qrCodeContainer', url);

    // Show modal
    modal.classList.add('active');
}

/**
 * Hide QR code modal
 */
function hideQRCodeModal() {
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Copy URL to clipboard
 * @param {string} url - URL to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyUrlToClipboard(url) {
    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);

        // Fallback for older browsers
        try {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            const success = document.execCommand('copy');
            document.body.removeChild(input);
            return success;
        } catch (e) {
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateQRCode,
        showQRCodeModal,
        hideQRCodeModal,
        copyUrlToClipboard
    };
}
