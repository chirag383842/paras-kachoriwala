# Google Sheets Feedback Setup Guide for Paras Kachoriwala

Follow these simple steps to link your customer feedback form to your Google Sheet:

---

## Step 1: Create a Google Sheet
1. Open Google Sheets at [sheets.new](https://sheets.new).
2. Name the spreadsheet **"Paras Kachoriwala Customer Feedback"**.
3. **Important**: You can name the bottom sheet tab **"Feedback"** or **"Sheet1"** (the script automatically handles both!).

---

## Step 2: Add the Google Apps Script
1. In Google Sheets top menu, click **Extensions** > **Apps Script**.
2. Delete any existing code in the editor.
3. Open [`google-sheets-script.js`](./google-sheets-script.js) from this project, copy all its code, and paste it into the Apps Script editor.
4. Click **Save** (💾 disk icon).

---

## Step 3: Deploy as Web App
1. Click the blue **Deploy** button (top right) > **New deployment** (or **Manage deployments** > Edit > New version).
2. Under "Select type" (gear icon), select **Web app**.
3. Fill in:
   - **Description**: `Paras Feedback Webhook`
   - **Execute as**: `Me (your Google account)`
   - **Who has access**: `Anyone` *(Must be set to "Anyone" so submissions from your website can reach the sheet)*
4. Click **Deploy**.
5. Click **Authorize access**, select your Google account, click **Advanced** > **Go to Untitled project (unsafe)** > **Allow**.
6. Copy the **Web App URL** (starts with `https://script.google.com/macros/s/.../exec`).

---

## Step 4: Link with Website
You have two easy ways to link the URL:

### Option A: From Author Portal (Recommended)
1. In your website footer, click **Author & Owner Portal**.
2. Sign in (`jainchirag2111@gmail.com` / `Chir@g2007`).
3. Click the **Customer Reviews** tab.
4. Paste your Web App URL into the **Live Google Sheets Auto-Sync** input.
5. Click **Save Link**.
6. Click **Test Webhook** to immediately verify connection! You will see a green checkmark confirming live connectivity.

### Option B: In `.env` file
Set this line in your `.env` file:
```env
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## Step 5: Troubleshooting "Sheet 'Feedback' not found"
If you ever see this error in your Google Apps Script:
- **Solution 1**: Simply double-click the bottom tab in Google Sheets and rename `Sheet1` to `Feedback`.
- **Solution 2**: Paste the latest code from `google-sheets-script.js` into Apps Script and deploy a new version. The updated script automatically detects your active sheet or creates the `Feedback` tab for you!
