/**
 * Server-side login API route
 * Supports:
 *   1. Demo accounts (hardcoded)
 *   2. Migrated WordPress accounts (from lib/data/users.json)
 *   3. WordPress JWT fallback (if NEXT_PUBLIC_WORDPRESS_URL is set)
 *
 * NO email notifications are sent for any login.
 * Passwords for migrated accounts: SHA-256 hash stored in users.json
 * WP password hash fallback: stored as wpPasswordHash (phpass format — not verified here,
 *   use WP JWT endpoint for that)
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const USERS_FILE = path.join(process.cwd(), "lib", "data", "users.json");

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash?: string;
  wpId?: number;
  isAdmin: boolean;
  purchasedProducts?: string[];
  accessibleFiles?: string[];
  source?: string;
}

async function findLocalUser(email: string): Promise<StoredUser | null> {
  try {
    const content = await fs.readFile(USERS_FILE, "utf8");
    const users: StoredUser[] = JSON.parse(content);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  } catch {
    return null;
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // SEC-003 FIX: Rate limiting — admin gets 20 attempts/min, others get 5/min
    const clientIp = getClientIp(req);
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminAttempt = adminEmail && email && email.toLowerCase() === adminEmail.toLowerCase();
    const rateLimit = isAdminAttempt ? { limit: 20, windowSecs: 60 } : { limit: 5, windowSecs: 60 };
    const rateLimitResult = checkRateLimit(`login:${clientIp}`, rateLimit);
    if (!rateLimitResult.success) {
      const retryAfterSecs = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "too_many_attempts",
          message: `Zbyt wiele prób logowania. Spróbuj ponownie za ${retryAfterSecs} sekund.`,
          retryAfterSecs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSecs),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Attach remaining attempts to every response for UX feedback
    const remainingAttempts = rateLimitResult.remaining;

    // 0. ENV-based admin credentials (highest priority — overrides everything)
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (adminEmail && adminPasswordHash) {
      if (email.toLowerCase() === adminEmail.toLowerCase()) {
        const inputHash = hashPassword(password);
        if (inputHash === adminPasswordHash) {
          return NextResponse.json({
            success: true,
            user: {
              id: "admin_env",
              email: adminEmail,
              name: "Admin",
              role: "admin",
              isAdmin: true,
              purchasedProducts: [],
              accessibleFiles: [],
            },
            token: `admin_${crypto.randomBytes(16).toString("hex")}`,
            source: "env",
          });
        } else {
          // Admin email matched but wrong password — reject immediately, no fallback
          return NextResponse.json(
            { error: "invalid_credentials", message: "Nieprawidłowy email lub hasło.", remainingAttempts },
            { status: 401 }
          );
        }
      }
    }

    // 1. Check local migrated users first
    const localUser = await findLocalUser(email);
    if (localUser && localUser.passwordHash) {
      const inputHash = hashPassword(password);
      if (inputHash === localUser.passwordHash) {
        return NextResponse.json({
          success: true,
          user: {
            id: localUser.id,
            email: localUser.email,
            name: localUser.name,
            role: localUser.role,
            isAdmin: localUser.isAdmin,
            purchasedProducts: localUser.purchasedProducts || [],
            accessibleFiles: localUser.accessibleFiles || [],
          },
          token: `local_${crypto.randomBytes(16).toString("hex")}`,
          source: "local",
        });
      }
    }

    // 2. WordPress JWT fallback
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (wpUrl) {
      try {
        const wpRes = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        });

        if (wpRes.ok) {
          const wpData = await wpRes.json();
          return NextResponse.json({
            success: true,
            user: {
              id: `wp_${wpData.user_id || Date.now()}`,
              email: wpData.user_email || email,
              name: wpData.user_display_name || email.split("@")[0],
              role: "student",
              isAdmin: false,
              purchasedProducts: localUser?.purchasedProducts || [],
              accessibleFiles: localUser?.accessibleFiles || [],
            },
            token: wpData.token,
            source: "wordpress",
          });
        }
      } catch (err) {
        console.warn("[Login] WP JWT fallback failed:", err);
      }
    }

    // 3. Demo accounts (only when DEMO_ACCOUNTS_ENABLED=true in ENV)
    if (process.env.DEMO_ACCOUNTS_ENABLED === "true") {
      const demoAccounts: Record<string, { id: string; name: string; role: string; subRole: string | null }> = {
        "student@kamila.shor.dev": { id: "d1", name: "Demo Uczeń", role: "student", subRole: "learner" },
        "demo@kamila.shor.dev": { id: "d1b", name: "Demo Uczeń", role: "student", subRole: "learner" },
        "child@kamila.shor.dev": { id: "d2", name: "Demo Dziecko", role: "student", subRole: "child" },
        "teacher@kamila.shor.dev": { id: "d3", name: "Demo Nauczyciel", role: "teacher", subRole: "teacher_private" },
        "teacher.school@kamila.shor.dev": { id: "d4", name: "Demo Nauczyciel Szkolny", role: "teacher", subRole: "teacher_school" },
        "institution@kamila.shor.dev": { id: "d5", name: "Demo Szkoła", role: "institution", subRole: "institution_public" },
        "langschool@kamila.shor.dev": { id: "d6", name: "Demo Szkoła Językowa", role: "institution", subRole: "institution_language" },
        "parent@kamila.shor.dev": { id: "d7", name: "Demo Rodzic", role: "parent", subRole: "parent_independent" },
      };
      const demoUser = demoAccounts[email.toLowerCase()];
      if (demoUser && password === "demo123") {
        return NextResponse.json({
          success: true,
          user: { ...demoUser, email, isAdmin: false, purchasedProducts: [], accessibleFiles: [] },
          token: `demo_${crypto.randomBytes(8).toString("hex")}`,
          source: "demo",
        });
      }
    }

    return NextResponse.json(
      { error: "invalid_credentials", message: "Nieprawidłowy email lub hasło.", remainingAttempts },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("[Login] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
