// Secure Authentication Utility for Paras Kachoriwala Author/Owner portal

export type AuthUser = {
  email: string;
  name: string;
  role: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  createdAt: number;
  lastActive: number;
};

// Security constants
const AUTH_SALT = 'pk_secure_salt_8923a1_paras';
// SHA-256 hash of "Chir@g2007:pk_secure_salt_8923a1_paras"
const AUTHOR_EMAIL = 'jainchirag2111@gmail.com';
const AUTHOR_PASSWORD_HASH = 'fbf5843db931a49ec4cc588d6502101ee73655a7a0f79a911e7dffae037d00c5';
const AUTHOR_NAME = 'Chirag Jain';
const AUTHOR_ROLE = 'Owner & Author';

// Storage keys
const STORAGE_SESSION_KEY = 'pk_author_auth_session_v2';
const STORAGE_RATE_LIMIT_KEY = 'pk_auth_rate_limit';
const STORAGE_CHALLENGE_KEY = 'pk_auth_pending_challenge';
const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours inactivity timeout
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes challenge validity
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout

// Author Two-Factor Verification Codes (Master Author PINs & dynamic 2FA keys)
const VALID_2FA_CODES = ['211107', '789211', '849201', '190740'];

/**
 * Computes SHA-256 hash with salt using Web Crypto API
 */
async function computeHash(text: string, salt: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const data = enc.encode(`${text}:${salt}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simple bitwise hash for legacy environments
    let hash = 0;
    const str = `${text}:${salt}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString(16);
  }
}

type RateLimitData = {
  failedAttempts: number;
  lockedUntil: number | null;
};

function getRateLimitData(): RateLimitData {
  try {
    const raw = sessionStorage.getItem(STORAGE_RATE_LIMIT_KEY);
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { failedAttempts: 0, lockedUntil: null };
  }
}

function saveRateLimitData(data: RateLimitData): void {
  try {
    sessionStorage.setItem(STORAGE_RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage issues
  }
}

function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number; error: string } {
  const currentLimit = getRateLimitData();
  const newFailed = currentLimit.failedAttempts + 1;
  let lockedUntil = currentLimit.lockedUntil;

  if (newFailed >= MAX_FAILED_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    saveRateLimitData({ failedAttempts: 0, lockedUntil });
    return {
      isLocked: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      error: 'Too many failed attempts. Security cooldown active for 5 minutes.',
    };
  }

  saveRateLimitData({ failedAttempts: newFailed, lockedUntil: null });
  const remainingTries = MAX_FAILED_ATTEMPTS - newFailed;
  return {
    isLocked: false,
    remainingSeconds: 0,
    error: `Invalid credentials. ${remainingTries} attempt${remainingTries === 1 ? '' : 's'} remaining before security lockout.`,
  };
}

export function checkLockout(): { isLocked: boolean; remainingSeconds: number } {
  const { lockedUntil } = getRateLimitData();
  if (lockedUntil && lockedUntil > Date.now()) {
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
    return { isLocked: true, remainingSeconds: remaining };
  }
  return { isLocked: false, remainingSeconds: 0 };
}

export type InitiateLoginResult = {
  success: boolean;
  challengeToken?: string;
  otp?: string;
  user?: AuthUser;
  error?: string;
  remainingSeconds?: number;
};

/**
 * Step 1: Verify Author Email & Password, generating a real-time 6-digit OTP challenge
 */
export async function initiateLogin(
  email: string,
  password: string
): Promise<InitiateLoginResult> {
  // 1. Check rate limiting
  const lockout = checkLockout();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Please wait ${lockout.remainingSeconds} seconds before trying again.`,
      remainingSeconds: lockout.remainingSeconds,
    };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // Format validation
  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Please enter both your email address and password.' };
  }

  // 2. Compute secure salted hash
  const hash = await computeHash(cleanPass, AUTH_SALT);

  const emailMatches = cleanEmail === AUTHOR_EMAIL.toLowerCase();
  const hashMatches = hash === AUTHOR_PASSWORD_HASH;

  if (emailMatches && hashMatches) {
    // Generate fresh 6-digit OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    // Generate secure 2FA challenge token
    const challengeToken = crypto.randomUUID
      ? crypto.randomUUID()
      : `chal_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const challengeData = {
      token: challengeToken,
      email: AUTHOR_EMAIL,
      otp,
      createdAt: Date.now(),
    };

    try {
      sessionStorage.setItem(STORAGE_CHALLENGE_KEY, JSON.stringify(challengeData));
    } catch {
      // Ignore
    }

    const user: AuthUser = {
      email: AUTHOR_EMAIL,
      name: AUTHOR_NAME,
      role: AUTHOR_ROLE,
    };

    return {
      success: true,
      challengeToken,
      otp,
      user,
    };
  }

  // Record failed attempt
  const failure = recordFailedAttempt();
  return {
    success: false,
    error: failure.isLocked ? failure.error : 'Invalid email address or password. Please try again.',
    remainingSeconds: failure.remainingSeconds,
  };
}

/**
 * Regenerates and resends a new 6-digit OTP code
 */
export async function resendOtp(challengeToken: string): Promise<{ success: boolean; otp?: string; error?: string }> {
  try {
    const raw = sessionStorage.getItem(STORAGE_CHALLENGE_KEY);
    if (!raw) return { success: false, error: 'Verification session expired. Please sign in again.' };
    const challenge = JSON.parse(raw);
    if (!challenge || challenge.token !== challengeToken) {
      return { success: false, error: 'Invalid challenge session.' };
    }

    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    challenge.otp = newOtp;
    challenge.createdAt = Date.now();
    sessionStorage.setItem(STORAGE_CHALLENGE_KEY, JSON.stringify(challenge));

    return { success: true, otp: newOtp };
  } catch {
    return { success: false, error: 'Failed to resend verification code.' };
  }
}

export type VerifyTwoFactorResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
  remainingSeconds?: number;
};

/**
 * Step 2: Verify 6-digit OTP / Author Passcode against the active Challenge Token
 */
export async function verifyTwoFactor(
  challengeToken: string,
  code: string
): Promise<VerifyTwoFactorResult> {
  // 1. Check rate limiting
  const lockout = checkLockout();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Security cooldown active (${lockout.remainingSeconds}s remaining).`,
      remainingSeconds: lockout.remainingSeconds,
    };
  }

  const cleanCode = (code || '').trim().replace(/[\s-]/g, '');

  if (!cleanCode || cleanCode.length < 6) {
    return { success: false, error: 'Please enter your complete 6-digit verification OTP code.' };
  }

  // Verify challenge token existence and expiry
  let challengeEmail = AUTHOR_EMAIL;
  let challengeOtp = '';
  try {
    const raw = sessionStorage.getItem(STORAGE_CHALLENGE_KEY);
    if (!raw) {
      return { success: false, error: 'Verification session expired. Please sign in again.' };
    }
    const challenge = JSON.parse(raw);
    if (
      !challenge ||
      challenge.token !== challengeToken ||
      Date.now() - challenge.createdAt > CHALLENGE_EXPIRY_MS
    ) {
      sessionStorage.removeItem(STORAGE_CHALLENGE_KEY);
      return { success: false, error: 'Verification challenge expired. Please sign in again.' };
    }
    challengeEmail = challenge.email;
    challengeOtp = challenge.otp || '';
  } catch {
    // Continue
  }

  // Verify code: Matches either the dynamic session OTP or registered master Author PINs
  const isCodeValid = (challengeOtp && cleanCode === challengeOtp) || VALID_2FA_CODES.includes(cleanCode);

  if (isCodeValid) {
    // Reset rate limiter & clear challenge
    saveRateLimitData({ failedAttempts: 0, lockedUntil: null });
    try {
      sessionStorage.removeItem(STORAGE_CHALLENGE_KEY);
    } catch {
      // Ignore
    }

    const user: AuthUser = {
      email: challengeEmail,
      name: AUTHOR_NAME,
      role: AUTHOR_ROLE,
    };

    // Generate random cryptographic session token
    const token = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = Date.now();

    const session: AuthSession = {
      user,
      token,
      createdAt: now,
      lastActive: now,
    };

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event('pk_auth_state_changed'));
    } catch {
      // Fallback
    }

    return { success: true, user };
  }

  // Record failed attempt
  const failure = recordFailedAttempt();
  return {
    success: false,
    error: failure.isLocked
      ? failure.error
      : 'Invalid 6-digit OTP verification code. Please check and try again.',
    remainingSeconds: failure.remainingSeconds,
  };
}

/**
 * Backward-compatible login helper
 */
export async function login(
  email: string,
  password: string,
  code?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; remainingSeconds?: number }> {
  const step1 = await initiateLogin(email, password);
  if (!step1.success) return step1;
  if (!code) {
    return step1;
  }
  return verifyTwoFactor(step1.challengeToken || '', code);
}

export function logout(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    window.dispatchEvent(new Event('pk_auth_state_changed'));
  } catch {
    // Ignore
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;

    const session: AuthSession = JSON.parse(raw);
    if (!session || !session.user || !session.lastActive) {
      logout();
      return null;
    }

    const now = Date.now();
    // Check session expiration (2 hours)
    if (now - session.lastActive > SESSION_EXPIRY_MS) {
      logout();
      return null;
    }

    // Refresh last active timestamp
    session.lastActive = now;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

    return session.user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}
