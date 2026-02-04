import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const ADMIN_EMAIL = "m.dixon5030@gmail.com";
const ADMIN_PASSWORD = "Nova@$5030";

export async function seedAdminUser(): Promise<void> {
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
