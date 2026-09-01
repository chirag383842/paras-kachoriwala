# Google Sheets Feedback Setup Guide for Paras Kachoriwala

Follow these simple steps to link your customer feedback form to your Google Sheet:

---

## Step 1: Create a Google Sheet
1. Open Google Sheets at [sheets.new](https://sheets.new).
2. Name the sheet **"Paras Kachoriwala Customer Feedback"**.

---

## Step 2: Add the Google Apps Script
1. In the Google Sheets menu, click **Extensions** > **Apps Script**.
2. Delete any default code in the editor (`myFunction() { ... }`).
3. Copy all the code from [`google-sheets-script.js`](./google-sheets-script.js) and paste it into the editor:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Customer Name",
        "Overall Rating",
        "Food Rating",
        "Service Rating",
        "Cleanliness Rating",
        "Feedback Message"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#9c4c18");
      headerRange.setFontColor("#ffffff");
    }

    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }

    var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var customerName = data.customer_name || "Anonymous";
    var overallRating = data.overall_rating || 0;
    var foodRating = data.food_rating || 0;
    var serviceRating = data.service_rating || 0;
    var cleanlinessRating = data.cleanliness_rating || 0;
    var message = data.message || "";

    sheet.appendRow([
      timestamp,
      customerName,
      overallRating,
      foodRating,
      serviceRating,
      cleanlinessRating,
      message
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Feedback recorded" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Paras Kachoriwala Feedback Webhook is Live!");
}
```
4. Click **Save** (💾 icon) or press `Ctrl + S`.

---

## Step 3: Deploy as Web App
1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `Paras Feedback Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Important: select "Anyone" so submissions from your website can reach the sheet)*
4. Click **Deploy**.
5. Click **Authorize access**, choose your Google account, click **Advanced** > **Go to Untitled project (unsafe)** > **Allow**.
6. Copy the **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).

---

## Step 4: Link with Website
You have two easy ways to add the URL:

### Option A: From Author Portal (Easiest)
1. Go to your website footer > click **Author & Owner Portal**.
2. Log in (`jainchirag2111@gmail.com` / `Chir@g2007`).
3. Click the **Customer Reviews** tab.
4. Paste your Web App URL in the **Live Google Sheets Auto-Sync** input and click **Save Google Sheet Link**.

### Option B: In `.env` file
Add this line to your `.env` file:
```env
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## Step 5: Test It!
1. Go to your website's **Feedback** page.
2. Submit a test review with star ratings and a comment.
3. Open your Google Sheet — the new row will appear instantly with timestamp, customer name, ratings, and feedback!

