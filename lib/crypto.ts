// lib/crypto.ts
// Helper untuk generate sessionId tanpa import crypto di edge runtime

/**
 * Generate random UUID tanpa pakai crypto module
 * Compatible dengan Edge Runtime
 */
export function generateSessionId(): string {
  // Implementasi UUID v4 tanpa crypto module
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Alternative: Pakai Web Crypto API (support di Edge Runtime)
 */
export function generateSessionIdSecure(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback ke Math.random() based
  return generateSessionId()
}