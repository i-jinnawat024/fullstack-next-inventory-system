import { JWTPayload, AuthUser, TokenType } from '@/lib/types';
import { NextRequest } from 'next/server';

// JWT simulation for development - in production, use a proper JWT library
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Generate UUID v4 compatible string
function randomUUID(): string {
  // Generate a UUID v4 compatible string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const TOKEN_HEADER = {
  alg: 'HS256',
  typ: 'JWT',
} as const;

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

interface GenerateTokenOptions {
  tokenType?: TokenType;
  sessionId?: string;
  expiresInSeconds?: number;
}

function buildPayload(
  user: AuthUser,
  tokenType: TokenType,
  sessionId: string,
  expiresInSeconds: number
): JWTPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    department: user.department,
    role: user.role,
    tokenType,
    sessionId,
    iat: now,
    exp: now + expiresInSeconds,
  };
}

export function generateToken(user: AuthUser, options: GenerateTokenOptions = {}): string {
  const tokenType = options.tokenType ?? 'access';
  const expiresIn = options.expiresInSeconds ?? (tokenType === 'access' ? ACCESS_TOKEN_MAX_AGE : REFRESH_TOKEN_MAX_AGE);
  const sessionId = options.sessionId ?? randomUUID();

  const payload = buildPayload(user, tokenType, sessionId, expiresIn);
  const encodedHeader = base64UrlEncode(JSON.stringify(TOKEN_HEADER));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(encodedHeader, encodedPayload);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function generateAuthTokens(user: AuthUser) {
  const sessionId = randomUUID();
  return {
    sessionId,
    accessToken: generateToken(user, { tokenType: 'access', sessionId, expiresInSeconds: ACCESS_TOKEN_MAX_AGE }),
    refreshToken: generateToken(user, { tokenType: 'refresh', sessionId, expiresInSeconds: REFRESH_TOKEN_MAX_AGE }),
  };
}

function verifyTokenInternal(token: string, expectedType: TokenType): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    const expectedSignature = createSignature(headerPart, payloadPart);
    if (signaturePart !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadPart)) as JWTPayload;
    if (payload.tokenType !== expectedType) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function verifyToken(token: string, expectedType: TokenType = 'access'): JWTPayload | null {
  return verifyTokenInternal(token, expectedType);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  return verifyTokenInternal(token, 'access');
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  return verifyTokenInternal(token, 'refresh');
}

export function extractTokenFromCookie(cookieHeader: string | null, cookieName = 'auth-token'): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const authCookie = cookies.find(cookie => cookie.startsWith(`${cookieName}=`));

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

// Verify authentication from request
export async function verifyAuth(request: NextRequest): Promise<{ valid: boolean; user?: AuthUser; error?: string }> {
  try {
    const cookieHeader = request.cookies.get('auth-token')?.value;

    if (!cookieHeader) {
      return { valid: false, error: 'No authentication token' };
    }

    const payload = verifyAccessToken(cookieHeader);

    if (!payload) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    const user: AuthUser = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      department: payload.department,
    };

    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: 'Authentication failed' };
  }
}
