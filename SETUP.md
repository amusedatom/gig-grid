# 🔐 GitHub Secret Setup Guide

## Quick Setup: Spotify Client ID

Your app is now configured to automatically inject the Spotify Client ID from GitHub Secrets during deployment. Follow these steps:

---

## 1️⃣ Get Your Spotify Client ID

1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create an App"**
4. Fill in:
   - **App Name**: "Music Bingo" (or your choice)
   - **App Description**: "Multiplayer bingo game with Spotify playlists"
   - **Redirect URIs**: Add both:
     - `http://localhost:8000`
     - `https://YOUR_USERNAME.github.io/YOUR_REPO/`
5. Click **"Save"**
6. Copy your **Client ID** (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

---

## 2️⃣ Add Secret to GitHub

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** (green button)
5. Enter:
   - **Name**: `SPOTIFY_CLIENT_ID` (exactly as shown)
   - **Secret**: Paste your Client ID from step 1
6. Click **Add secret**

---

## 3️⃣ Deploy

Push your code to GitHub:

```bash
git add .
git commit -m "Add Spotify multiplayer support"
git push origin main
```

The GitHub Actions workflow will:
1. Checkout your code
2. **Inject the Client ID** from the secret
3. Deploy to GitHub Pages

---

## 4️⃣ Verify

1. Wait for the GitHub Action to complete (~1-2 minutes)
2. Visit your GitHub Pages URL
3. Click **"Host Game"**
4. Click **"Connect Spotify"**
5. You should see the Spotify login popup ✅

---

## 🛠️ Local Development

For local testing, you'll need to manually edit `spotify-auth.js`:

```javascript
const SPOTIFY_CONFIG = {
    clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE',
    // ...
};
```

**Important**: Don't commit this change! Keep the placeholder `YOUR_SPOTIFY_CLIENT_ID` in the repository.

---

## 🔍 Troubleshooting

**"Invalid Client" error?**
- Verify the Client ID is correct in GitHub Secrets
- Check that redirect URIs match exactly (including trailing slashes)

**Spotify login doesn't open?**
- Check browser console for errors
- Verify the secret name is exactly `SPOTIFY_CLIENT_ID`
- Re-run the GitHub Action

**Secret not injecting?**
- Check the GitHub Actions log for "Injecting Spotify Client ID..."
- Verify the secret exists in Settings → Secrets and variables → Actions

---

## ✅ You're Done!

Your app will now automatically use the Spotify Client ID from GitHub Secrets on every deployment, keeping your credentials secure! 🎉
