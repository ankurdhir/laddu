# Protein & Fitness Laddoo - Static Website

A premium, animated, static website for customizable fitness laddoos. Built with HTML, Tailwind CSS, GSAP, and Vanilla JS.

## ▶️ Run Locally (IMPORTANT)

This project uses **ES6 JavaScript modules** (`<script type="module">`). Most browsers will **NOT** allow module imports when opening `index.html` via `file://` (double-click), so the configurator/goals/order features may appear “broken”.

Run it via a local server:

```bash
cd /Users/adhir/Downloads/ladoo
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## 🚀 Deployment Guide (GitHub Pages)

Since this is a fully static site, deployment is instant.

1.  **Push to GitHub**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    # Add your remote origin
    # git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
    git push -u origin main
    ```

2.  **Enable GitHub Pages**:
    *   Go to your Repository Settings > **Pages**.
    *   Under **Source**, select `main` branch and `/ (root)` folder.
    *   Click **Save**.
    *   Your site will be live at `https://your-username.github.io/repo-name/`.

## ⚙️ Configuration

### Google Apps Script (Orders + OTP)
This project is static, so we use **Google Apps Script Web App** as the backend for:
- Saving orders to Google Sheets
- (Optional) Sending SMS OTP + verifying phone numbers

#### Step A — Create the sheet
1. Create a new **Google Sheet**
2. Create/rename a tab as **`Orders`** (the script will auto-create it if missing)

#### Step B — Create Apps Script
1. Go to **Extensions → Apps Script**
2. In the Apps Script editor, create a file named **`Code.gs`**
3. Copy-paste the repo file `apps_script/Code.gs` into Apps Script

#### Step C — Configure OTP sending
In `apps_script/Code.gs`:
- Set `CONFIG.TEST_MODE = true` while testing (the OTP will be returned in the API response)
- For production set `CONFIG.TEST_MODE = false` and configure an SMS provider:
  - Twilio: set `CONFIG.SMS_PROVIDER = 'TWILIO'` and add Script Properties
  - MSG91: set `CONFIG.SMS_PROVIDER = 'MSG91'` and add Script Properties
  - Fast2SMS: set `CONFIG.SMS_PROVIDER = 'FAST2SMS'` and add Script Properties

**Script Properties (recommended)**
Apps Script → Project Settings → Script properties:
- Twilio:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`
- MSG91:
  - `MSG91_AUTHKEY`
  - `MSG91_SENDER`
  - `MSG91_ROUTE` (optional)
- Fast2SMS:
  - `FAST2SMS_API_KEY`

**Fast2SMS notes**
- Fast2SMS may require KYC/DLT setup in your account before OTP works in production.
- This integration uses Fast2SMS `bulkV2` with `route: 'otp'`.
- Fast2SMS typically expects a 10-digit Indian mobile number (without country code). The script converts `91XXXXXXXXXX` → `XXXXXXXXXX` automatically.

#### Step D — Deploy as Web App
1. Click **Deploy → New deployment**
2. Select **Type: Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy**
6. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/.../exec`)

#### Step E — Add the Web App URL to the website
Open `assets/js/order.js` and set:

```js
this.googleSheetsWebhookUrl = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

> This URL is used for `sendOtp`, `verifyOtp`, and `placeOrder` actions.

#### API actions exposed by Apps Script
All requests are `POST` JSON to the Web App URL.

- `sendOtp`:
  - body: `{ "action": "sendOtp", "phone": "9XXXXXXXXX" }`
- `verifyOtp`:
  - body: `{ "action": "verifyOtp", "sessionId": "...", "otp": "123456" }`
- `placeOrder`:
  - body: `{ "action": "placeOrder", "sessionId": "...", "requireOtp": true, "order": { ... } }`

## 🛠 Tech Stack
*   **Core**: HTML5, CSS3, ES6 JavaScript modules.
*   **Styling**: Tailwind CSS (CDN).
*   **Animation**: GSAP (GreenSock) + ScrollTrigger.
*   **Icons**: Lucide Icons.
*   **Architecture**: No backend, no build step required.

## 📂 Project Structure
```
/
├── index.html              # Main entry point
├── assets/
│   ├── css/               
│   ├── js/
│   │   ├── main.js         # App entry & routing
│   │   ├── data.js         # Ingredient & Preset data
│   │   ├── configurator.js # "Build Your Own" Logic
│   │   ├── visualizer.js   # Canvas Chart Logic
│   │   ├── order.js        # Order Form & WhatsApp Logic
│   │   └── animations.js   # GSAP Animations
│   └── images/             # Local assets
└── README.md
```

