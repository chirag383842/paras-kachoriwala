/**
 * Google Apps Script for Paras Kachoriwala Customer Feedback Sync
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Create column headers in Row 1:
 *    A1: Timestamp | B1: Customer Name | C1: Overall Rating | D1: Food Rating | E1: Service Rating | F1: Cleanliness Rating | G1: Feedback Message
 * 3. In the top menu, go to: Extensions > Apps Script
 * 4. Delete any existing code, and paste this entire code
 * 5. Click "Save" (disk icon)
 * 6. Click "Deploy" (top right) > "New deployment"
 * 7. Click Select type (gear icon) > "Web app"
 * 8. Set:
 *    - Description: Paras Feedback Webhook
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 9. Click "Deploy" and authorize permissions if prompted.
 * 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 11. Paste this URL into your website's Author Portal (or in .env as VITE_GOOGLE_SHEETS_URL).
 */

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
      // Format header row with bold & background
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

    // Append new row
    sheet.appendRow([
      timestamp,
      customerName,
      overallRating,
      foodRating,
      serviceRating,
      cleanlinessRating,
      message
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Feedback recorded successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Paras Kachoriwala Google Sheets Feedback Service is Live!");
}

