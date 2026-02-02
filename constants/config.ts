// GTD Claude API Configuration
export const API_BASE_URL = 'http://5.78.95.161:5108';
export const API_CREDENTIALS = {
  username: 'deep',
  password: 'into',
};

// Base64 encode for React Native (works in both RN and web)
function base64Encode(str: string): string {
  // This works in both React Native and web environments
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const byte1 = str.charCodeAt(i);
    const byte2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const byte3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = i + 1 < str.length ? ((byte2 & 15) << 2) | (byte3 >> 6) : 64;
    const enc4 = i + 2 < str.length ? byte3 & 63 : 64;

    output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
  }
  return output;
}

// Get the basic auth header
export function getAuthHeader(): string {
  const encoded = base64Encode(`${API_CREDENTIALS.username}:${API_CREDENTIALS.password}`);
  return `Basic ${encoded}`;
}

// Layout breakpoint - use columns if screen width >= this value
// Fold 6 inner display: ~707dp portrait, ~823dp landscape
export const COLUMN_BREAKPOINT = 780;
