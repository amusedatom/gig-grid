# 🔊 DnB Bingo - Rave Edition

A high-performance, mobile-first Progressive Web App (PWA) designed for tracking Drum & Bass anthems at music festivals. Built for **100% offline functionality** with rave aesthetics.

## ✨ Features

- **🎨 Rave Aesthetics**: Dark mode with neon green, pink, and cyan accents
- **📱 Mobile-First**: Responsive 5×5 grid optimized for mobile viewports
- **💾 Persistent State**: localStorage keeps your progress even after battery death
- **🔌 Offline-First**: Service Worker with cache-first strategy for zero-network operation
- **📲 PWA Ready**: "Add to Home Screen" for standalone app experience
- **📳 Haptic Feedback**: Vibration feedback on cell toggles (mobile)
- **🔗 Web Share API**: Share progress with fallback to clipboard
- **⚡ Lightweight**: Vanilla HTML/CSS/JS - no frameworks, no bloat

## 🎵 25 DnB Anthems Included

Classic and modern tracks from:
- Pendulum, Chase & Status, Sub Focus
- Netsky, High Contrast, Camo & Krooked
- Wilkinson, Sigma, Andy C
- Calibre, Noisia, Mefjus
- And many more legends!

## 🚀 Deployment

### GitHub Pages (Automated)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DnB Bingo PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to **Pages** section
   - Under "Build and deployment", select **GitHub Actions** as the source
   - The workflow will automatically deploy on every push to `main`

3. **Access Your App**:
   - Your app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   - Or use a custom domain by editing the `CNAME` file

### Local Development

```bash
# Serve locally (Python 3)
python3 -m http.server 8000

# Or use Node.js
npx serve .

# Visit http://localhost:8000
```

## 📁 File Structure

```
gig-grid/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment
├── index.html               # Main HTML with PWA meta tags
├── style.css                # Rave-themed CSS with neon aesthetics
├── app.js                   # Core application logic
├── sw.js                    # Service Worker (cache-first)
├── manifest.json            # PWA manifest
├── icon-192.png             # App icon (192×192)
├── icon-512.png             # App icon (512×512)
├── CNAME                    # Custom domain (optional)
└── README.md                # This file
```

## 🎯 Usage

1. **Open the app** on your mobile device
2. **Add to Home Screen** for the full PWA experience
3. **Tap squares** to mark anthems as heard
4. **Progress persists** automatically via localStorage
5. **Share your progress** using the share button
6. **Reset anytime** with the reset button

## 🛠️ Technical Stack

- **HTML5**: Semantic structure with PWA meta tags
- **CSS3**: Grid/Flexbox layout, CSS animations
- **JavaScript**: Vanilla ES6+ (no frameworks)
- **Service Worker**: Cache-first offline strategy
- **localStorage**: Persistent state management
- **Web APIs**: Share API, Vibration API

## 🎨 Customization

### Change the Anthems

Edit the `DNB_ANTHEMS` array in `app.js`:

```javascript
const DNB_ANTHEMS = [
    "Your Track 1",
    "Your Track 2",
    // ... 25 total tracks
];
```

### Modify Colors

Update CSS variables in `style.css`:

```css
:root {
    --neon-green: #00ff00;
    --neon-pink: #ff00ff;
    --neon-cyan: #00ffff;
    /* ... */
}
```

### Update Cache Version

When making changes, bump the cache version in `sw.js`:

```javascript
const CACHE_NAME = 'dnb-bingo-v2'; // Increment version
```

## 📱 PWA Installation

### iOS (Safari)
1. Tap the Share button
2. Select "Add to Home Screen"
3. Confirm

### Android (Chrome)
1. Tap the menu (⋮)
2. Select "Add to Home Screen"
3. Confirm

## 🔧 Troubleshooting

**App not working offline?**
- Ensure Service Worker is registered (check browser console)
- Clear cache and reload once while online
- Check that all assets are cached in DevTools → Application → Cache Storage

**State not persisting?**
- Verify localStorage is enabled in browser settings
- Check for private/incognito mode (may limit storage)

**Icons not showing?**
- Ensure icon files are in the root directory
- Verify paths in `manifest.json` are relative (`./icon-*.png`)

## 📄 License

MIT License - Feel free to use this for your own festival bingo needs!

## 🎉 Credits

Built with ❤️ for the DnB community. See you in the pit! 🔊
