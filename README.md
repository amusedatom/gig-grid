# 🎵 Music Bingo - Multiplayer Edition

A high-performance, mobile-first Progressive Web App (PWA) for creating custom bingo games from Spotify playlists. Built for **100% offline functionality** with rave aesthetics and serverless multiplayer using URL-based game sharing.

## ✨ Features

- **🎨 Rave Aesthetics**: Dark mode with neon green, pink, and cyan accents
- **📱 Mobile-First**: Responsive 5×5 grid optimized for mobile viewports
- **🎵 Spotify Integration**: Create games from any Spotify playlist
- **� Multiplayer**: Host creates game, players join via QR code
- **🔗 URL-Based State**: No backend required - all game data in the URL
- **🎲 Seeded Randomization**: Same tracks for all players, different grid layouts
- **�💾 Persistent State**: localStorage keeps progress per game session
- **🔌 Offline-First**: Service Worker with cache-first strategy
- **📲 PWA Ready**: "Add to Home Screen" for standalone app experience
- **📳 Haptic Feedback**: Vibration feedback on cell toggles (mobile)
- **🔗 Web Share API**: Share progress with fallback to clipboard
- **⚡ Lightweight**: Vanilla HTML/CSS/JS - no frameworks

## 🎮 How It Works

### Host Flow
1. Click "Host Game" and connect to Spotify
2. Select a playlist from your library
3. App extracts top 25 tracks by popularity
4. Generate QR code with game URL
5. Share with players

### Player Flow
1. Scan QR code or click shared link
2. Game loads instantly with same tracks
3. Grid is shuffled uniquely for each player
4. Check off tracks as you hear them
5. Progress saves automatically

### Classic Mode
- Pre-loaded with 25 classic and modern DnB anthems
- No Spotify required
- Perfect for offline use

## 🚀 Setup & Deployment

### 1. Spotify App Registration

To use Spotify features, you need a Client ID:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in app name and description
5. Copy your **Client ID**
6. Add redirect URIs:
   - `http://localhost:8000` (for local development)
   - `https://YOUR_USERNAME.github.io/YOUR_REPO/` (for production)

### 2. Configure Client ID

Edit `spotify-auth.js` and replace the placeholder:

```javascript
const SPOTIFY_CONFIG = {
    clientId: 'YOUR_SPOTIFY_CLIENT_ID', // Replace this
    // ...
};
```

### 3. Deploy to GitHub Pages

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Music Bingo PWA"
git branch -M main

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Under "Build and deployment", select **GitHub Actions**
4. Workflow will automatically deploy on every push to `main`

### 5. Access Your App

- **GitHub Pages**: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
- **Custom Domain**: Edit `CNAME` file with your domain

## 💻 Local Development

```bash
# Serve locally
python3 -m http.server 8000

# Or use Node.js
npx serve .

# Visit http://localhost:8000
```

## 📁 File Structure

```
gig-grid/
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions deployment
├── libs/
│   └── qrcode.min.js        # QR code library
├── index.html               # Main HTML with modals
├── style.css                # Rave-themed CSS
├── app.js                   # Main application logic
├── seed-random.js           # Seeded RNG (Mulberry32)
├── game-state.js            # URL-based state management
├── spotify-auth.js          # OAuth Implicit Grant Flow
├── spotify-api.js           # Spotify Web API wrapper
├── qr-generator.js          # QR code generation
├── sw.js                    # Service Worker
├── manifest.json            # PWA manifest
├── icon-192.png             # App icon
├── icon-512.png             # App icon
├── CNAME                    # Custom domain (optional)
└── README.md                # This file
```

## 🎯 Usage

### Creating a Game

1. Open the app
2. Click "Host Game"
3. Log in to Spotify
4. Select a playlist (must have 25+ tracks)
5. QR code appears with shareable link
6. Share with friends!

### Joining a Game

1. Scan QR code or click link
2. Game loads with playlist tracks
3. Tap squares to mark tracks
4. Progress saves automatically

### Classic DnB Mode

1. Click "Classic DnB" mode
2. Play with pre-loaded DnB anthems
3. No Spotify required

## 🛠️ Technical Details

### Seeded Randomization

Uses **Mulberry32** algorithm for deterministic shuffling:
- Same seed = same track pool for all players
- Different player IDs = different grid layouts
- Ensures fair gameplay across devices

### URL Format

```
https://your-app.com/#game=abc123&mode=spotify&playlist=37i9dQZF1DX&seed=42&name=My+Playlist
```

- **game**: Unique game ID
- **mode**: `classic` or `spotify`
- **playlist**: Spotify playlist ID (if Spotify mode)
- **seed**: Random seed for shuffling
- **name**: Playlist name (URL encoded)

### localStorage Keys

- `dnb-bingo-game-{gameId}`: Per-game progress
- `spotify_access_token`: Spotify OAuth token (sessionStorage)

## 🎨 Customization

### Change Colors

Edit CSS variables in `style.css`:

```css
:root {
    --neon-green: #00ff00;
    --neon-pink: #ff00ff;
    --neon-cyan: #00ffff;
}
```

### Modify Classic Tracks

Edit `DNB_ANTHEMS` array in `app.js`:

```javascript
const DNB_ANTHEMS = [
    "Your Track 1",
    "Your Track 2",
    // ... 25 total
];
```

### Adjust Track Count

Change the track count in `spotify-api.js`:

```javascript
const gameData = await createGameFromPlaylist(playlistId, 50); // Change 25 to 50
```

## 🔧 Troubleshooting

**Spotify login fails?**
- Verify Client ID is correct
- Check redirect URIs match exactly
- Ensure app is not in development mode

**QR code not working?**
- URL might be too long for some scanners
- Try copying and sharing the link directly

**Game not loading offline?**
- Spotify games require initial online fetch
- Classic mode works 100% offline
- Clear cache and reload once while online

**State not persisting?**
- Check localStorage is enabled
- Verify not in private/incognito mode
- Each game has separate state by ID

## 📱 PWA Installation

### iOS (Safari)
1. Tap Share button
2. Select "Add to Home Screen"
3. Confirm

### Android (Chrome)
1. Tap menu (⋮)
2. Select "Add to Home Screen"
3. Confirm

## � Privacy & Security

- **No Data Collection**: All data stays on your device
- **Spotify Tokens**: Stored in sessionStorage (expires with browser)
- **Game State**: Stored in localStorage (per-device)
- **No Backend**: Completely serverless architecture

## 📄 License

MIT License - Feel free to use and modify!

## 🎉 Credits

Built with ❤️ for music lovers everywhere. Powered by the Spotify Web API.

---

**Enjoy your music bingo games! 🎵🎉**
