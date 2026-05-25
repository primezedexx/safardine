/**
 * Cloudflare Turnstile Server-Side Token Verification Helper
 * Mitigates automated form spam, script abuse, and brute-force bot registrations.
 */
export async function validateTurnstileToken(token: string | null | undefined, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    // Graceful fallback to prevent production lockout if Turnstile keys are not configured yet
    console.info('ℹ️ [SECURITY INFORMATION] Cloudflare Turnstile secret key is not configured. Form validation bypassed.');
    return true;
  }

  if (!token) {
    console.warn('🚨 [SECURITY WARNING] Rejected form submission due to missing Cloudflare Turnstile token.');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}${ip ? `&remoteip=${encodeURIComponent(ip)}` : ''}`
    });

    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      console.warn('🚨 [SECURITY WARNING] Cloudflare Turnstile validation failed for submitted token. Rejecting request.');
      return false;
    }
  } catch (err) {
    console.error('❌ [SECURITY ERROR] Failed connecting to Cloudflare Turnstile verify gateway:', err);
    return false;
  }
}
