import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function seedAdminUser(): Promise<void> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Admin seeding skipped: ADMIN_EMAIL and ADMIN_PASSWORD env vars not set");
    return;
  }

  try {
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL.toLowerCase()));

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists, updating to admin type...");
      await db.update(users)
        .set({ userType: "admin" })
        .where(eq(users.email, ADMIN_EMAIL.toLowerCase()));
      return;
    }

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    await db.insert(users).values({
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      name: "Admin",
      userType: "admin",
      subscriptionTier: "enterprise",
      subscriptionStatus: "active",
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}
