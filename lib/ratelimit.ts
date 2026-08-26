// In-memory rate limiting tracker
const requestLogs = new Map<string, number[]>();

function checkRateLimit(key: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number } {
  const now = Date.now();
  const timestamps = (requestLogs.get(key) || []).filter(t => now - t < windowMs);
  
  if (timestamps.length >= limit) {
    requestLogs.set(key, timestamps);
    return { success: false, limit, remaining: 0 };
  }

  timestamps.push(now);
  requestLogs.set(key, timestamps);
  return { success: true, limit, remaining: limit - timestamps.length };
}

export async function rateLimitAuth(ip: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  // 5 requests per minute
  return checkRateLimit(`auth:${ip}`, 5, 60 * 1000);
}

export async function rateLimitApi(ip: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  // 60 requests per minute
  return checkRateLimit(`api:${ip}`, 60, 60 * 1000);
}