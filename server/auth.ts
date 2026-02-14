import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  userType?: string | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function createUser(email: string, password: string, name?: string): Promise<AuthUser> {
  const passwordHash = await hashPassword(password);
  
  const [user] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
  }).returning();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, id));

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}

export async function updateUserType(userId: string, userType: string): Promise<AuthUser | null> {
  const [user] = await db.update(users)
    .set({ 
      userType,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}

/**
 * Find or create a user from Google OAuth.
 * If the email exists, returns the existing user.
 * If not, creates a new user with a random password hash (they'll auth via Google).
 */
export async function findOrCreateGoogleUser(
  email: string,
  name?: string,
  avatarUrl?: string,
): Promise<AuthUser> {
  const existing = await getUserByEmail(email);
  if (existing) {
    return existing;
  }

  const randomPassword = require("crypto").randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  const [user] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name: name || email.split("@")[0],
    emailVerified: true,
    avatarUrl: avatarUrl || null,
  }).returning();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}
