// Google Sheets Feedback Integration Service

const GOOGLE_SHEET_URL_KEY = 'pk_google_sheet_webhook_url';
export const DEFAULT_GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbxa-zzas9_lhX_YHjM6JzdXGVa5_DNhDHwifbOKQjvrjVmwJVUGMQheU2CLgeeNloRIEQ/exec';

export function getGoogleSheetUrl(): string {
  try {
    const saved = localStorage.getItem(GOOGLE_SHEET_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore
  }
  return (import.meta.env.VITE_GOOGLE_SHEETS_URL || DEFAULT_GOOGLE_SHEET_URL).trim();
}

export function setGoogleSheetUrl(url: string): void {
  try {
    localStorage.setItem(GOOGLE_SHEET_URL_KEY, url.trim());
  } catch {
    // Ignore
  }
}

export type GoogleSheetFeedbackData = {
  customer_name?: string;
  overall_rating: number;
  food_rating?: number;
  service_rating?: number;
  cleanliness_rating?: number;
  message?: string;
  submitted_at?: string;
};

export async function sendFeedbackToGoogleSheet(data: GoogleSheetFeedbackData): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = getGoogleSheetUrl();
  if (!webhookUrl) {
    // No webhook configured, skip silently
    return { success: true };
  }

  try {
    const payload = {
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customer_name: data.customer_name || 'Anonymous Customer',
      overall_rating: data.overall_rating,
      food_rating: data.food_rating || 0,
      service_rating: data.service_rating || 0,
      cleanliness_rating: data.cleanliness_rating || 0,
      message: data.message || '',
    };

    // Google Apps Script Web App handles POST with text/plain body without CORS issues
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return { success: true };
  } catch (err: any) {
    console.warn('Google Sheets sync notice:', err);
    return { success: false, error: err.message };
  }
}

