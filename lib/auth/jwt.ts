import { JWTPayload, AuthUser } from '@/lib/types';

// JWT simulation for development - in production, use a proper JWT library
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

// Simple base64 encoding/decoding for JWT simulation
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str += new Array(5 - (str.length % 4)).join('=');
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

// Create HMAC-like signature simulation
function createSignature(header: string, payload: string): string {
  const data = `${header}.${payload}.${JWT_SECRET}`;
  return base64UrlEncode(Buffer.from(data).toString('hex'));
}

export function generateToken(user: AuthUser): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(encodedHeader, encodedPayload);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    
    // Verify signature
    const expectedSignature = createSignature(headerPart, payloadPart);
    if (signaturePart !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as JWTPayload;
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
  
  if (!authCookie) return null;
  
  return authCookie.split('=')[1];
}

// Password hashing simulation (in production, use bcrypt)
export function hashPassword(password: string): string {
  // This is a simple simulation - in production, use bcrypt
  return `$2a$10$${Buffer.from(password + JWT_SECRET).toString('base64')}`;
}

export function comparePassword(password: string, hash: string): boolean {
  // This is a simple simulation - in production, use bcrypt.compare
  const expectedHash = hashPassword(password);
  return expectedHash === hash;
}