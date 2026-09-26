import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { paywallEnabled } from "./config";
import { users } from "./db";

const COOKIE = "cm_uid";

/**
 * Anonymous device-bound identity. A random 128-bit id in an httpOnly cookie
 * keys the user row that stores premium status. Call from Route Handlers only
 * (it may set a cookie).
 */
export async function getUser() {
  const jar = await cookies();
  let id = jar.get(COOKIE)?.value;
  if (!id || !/^[a-f0-9]{32}$/.test(id) || !users.get(id)) {
    id = crypto.randomBytes(16).toString("hex");
    users.create(id);
    jar.set(COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  const user = users.get(id)!;
  return { ...user, premium: !paywallEnabled() || user.premium_until > Date.now() };
}
